import { GoogleGenAI, Type, Schema } from "@google/genai";
import { JobStatus, GmailSuggestion } from "../types";

// Global declaration for Google Identity Services
declare global {
  interface Window {
    google: any;
  }
}

let tokenClient: any;
let accessToken: string | null = null;

// Initialize the Google Identity Services client
export const initGoogleAuth = (clientId: string) => {
  if (!window.google) return;
  
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    callback: (response: any) => {
      if (response.access_token) {
        accessToken = response.access_token;
      }
    },
  });
};

export const requestGmailPermission = () => {
  return new Promise<string>((resolve, reject) => {
    if (!tokenClient) return reject("Google Auth not initialized");
    
    // Override callback to capture resolution
    tokenClient.callback = (resp: any) => {
      if (resp.error) {
        reject(resp);
      } else {
        accessToken = resp.access_token;
        resolve(resp.access_token);
      }
    };
    
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

const fetchEmails = async () => {
  if (!accessToken) throw new Error("No access token");

  // Search for emails from common ATS systems or containing keywords
  const query = 'subject:(interview OR offer OR rejection OR application) newer_than:30d';
  
  const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=15`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const data = await response.json();
  return data.messages || [];
};

const getEmailContent = async (messageId: string) => {
  if (!accessToken) return null;
  
  const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  const data = await response.json();
  const snippet = data.snippet;
  const headers = data.payload.headers;
  const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
  const from = headers.find((h: any) => h.name === 'From')?.value || '';
  const date = headers.find((h: any) => h.name === 'Date')?.value || '';

  return { id: messageId, snippet, subject, from, date };
};

export const checkGmailForUpdates = async () => {
  if (!accessToken) {
    await requestGmailPermission();
  }

  try {
    const messages = await fetchEmails();
    const emails = await Promise.all(messages.map((m: any) => getEmailContent(m.id)));
    
    // Filter out empty or irrelevant emails roughly before sending to AI
    const validEmails = emails.filter(e => e && (e.snippet.length > 10));

    // Use Gemini to analyze
    return await analyzeEmailsWithGemini(validEmails);
  } catch (error) {
    console.error("Gmail Fetch Error:", error);
    throw error;
  }
};

const analyzeEmailsWithGemini = async (emailData: any[]): Promise<GmailSuggestion[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });
  
  const emailContext = emailData.map(e => 
    `ID: ${e.id}\nFrom: ${e.from}\nSubject: ${e.subject}\nDate: ${e.date}\nSnippet: ${e.snippet}\n---`
  ).join('\n');

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: "The ID of the email analyzed" },
        company: { type: Type.STRING, description: "The company name associated with the application" },
        newStatus: { type: Type.STRING, description: "The inferred status (Interviewing, Offer, Rejected, or Applied)" },
        reason: { type: Type.STRING, description: "Brief explanation of why this status is suggested based on the email text" }
      },
      required: ["id", "company", "newStatus", "reason"]
    }
  };

  const prompt = `
    You are a helpful assistant for a Product Manager tracking their job applications.
    Analyze the following recent emails and identify if any of them indicate a status update for a job application.
    
    Valid Statuses:
    - Interviewing (scheduling request, next steps)
    - Offer (offer letter, compensation details)
    - Rejected (thank you for applying, moving forward with other candidates)
    
    Ignore emails that are just newsletters, confirmations of receipt (unless it's the only interaction), or unrelated.
    
    Emails:
    ${emailContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (!response.text) return [];

    const rawSuggestions = JSON.parse(response.text);
    
    // Map back to full details
    return rawSuggestions.map((s: any) => {
      const originalEmail = emailData.find(e => e.id === s.id);
      return {
        id: s.id,
        company: s.company,
        newStatus: s.newStatus as JobStatus,
        reason: s.reason,
        emailDate: originalEmail?.date || new Date().toISOString(),
        emailSnippet: originalEmail?.snippet || ''
      };
    }).filter((s: any) => Object.values(JobStatus).includes(s.newStatus));

  } catch (e) {
    console.error("Gemini Email Analysis Error:", e);
    return [];
  }
};
