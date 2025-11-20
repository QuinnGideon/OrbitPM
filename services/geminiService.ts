import { GoogleGenAI, Type, Schema } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const parseJobDescription = async (text: string) => {
  const ai = getClient();
  if (!ai) throw new Error("Gemini API Key missing");

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      company: { type: Type.STRING, description: "Company name" },
      title: { type: Type.STRING, description: "Job title" },
      location: { type: Type.STRING, description: "Job location (City, Remote, etc.)", nullable: true },
      compensation: { type: Type.STRING, description: "Salary range or compensation details if available, else 'Unknown'", nullable: true },
      summary: { type: Type.STRING, description: "A concise, user-friendly 2-sentence summary of the role." },
      suggestedStages: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of probable interview stages based on the description (e.g., 'Recruiter Screen', 'Technical Round')."
      }
    },
    required: ["company", "title", "summary", "suggestedStages"]
  };

  // Reduce text length to prevent payload issues and ensure explicit structure
  const cleanText = text.substring(0, 7000);
  
  const contents = [
    {
      role: 'user',
      parts: [
        { text: `Analyze the following job description or job related text. Extract key details to help a professional track their application.\n\nText:\n"${cleanText}"` }
      ]
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a helpful career assistant for a job seeker. Be precise and helpful."
      }
    });

    // Handle cases where the response might be null or empty
    if (!response.text) {
      console.warn("Empty response from Gemini");
      return {};
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error parsing job description:", error);
    throw error;
  }
};