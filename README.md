
# Pipeliner AI 🚀

**Pipeliner AI** (formerly PM Orbit) is an intelligent, AI-powered career companion designed to help professionals track job applications, visualize interview timelines, and manage their career pipeline with ease.

## 🌐 Live App
The app is deployed as a Progressive Web App (PWA). You can install it directly to your device.

## ✨ Key Features

### 🧠 AI-Powered Automation
*   **Smart Paste**: Paste any job description, and **Google Gemini Flash 2.5** automatically extracts the Company, Title, Compensation, Location, and suggests a realistic Interview Round structure customized to the role.
*   **Intelligent Summaries**: The AI generates a concise 2-sentence summary of the role, cutting through the jargon.
*   **Inbox Insights**: Connect your Gmail to automatically scan for interview scheduling requests, offer letters, or rejections, and apply updates to your board with one click.

### 📊 Pipeline Management
*   **Kanban Board**: Visualize applications across stages (Wishlist, Applied, Interviewing, Offer, Rejected).
*   **Calendar View**: A monthly view of all your upcoming and past interview rounds to spot schedule overlaps.
*   **Active Pipeline Health**: A dashboard table showing the velocity (rounds completed vs. total) and time-active for every role.

### 📅 Timeline & Gantt Tracking
*   **Custom Timelines**: Every job card has an editable timeline. Add rounds, set dates, and track status (Pending, Passed, Failed).
*   **Date Logic**: The app automatically sorts rounds chronologically.

### ☁️ Sync & Security
*   **Local & Cloud Modes**: Start with Local Storage (privacy-first) and upgrade to Cloud Sync via InstantDB seamlessly.
*   **PWA Support**: Install on iOS and Android for a native app experience with offline capabilities.

## 🛠 Tech Stack
*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **Database**: InstantDB (Graph-based, Real-time)
*   **AI Model**: Google Gemini 2.5 Flash (via `@google/genai` SDK)
*   **Auth**: Magic Code (Email) & Google OAuth (Gmail Integration)

## 🏃‍♂️ Getting Started

### Prerequisites
1.  **Google Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/).
2.  **InstantDB App ID**: (Optional) Create an app at [InstantDB](https://instantdb.com/) for cloud sync.

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file and add your API key:
    ```
    API_KEY=your_gemini_api_key_here
    ```
4.  Run the dev server:
    ```bash
    npm run dev
    ```

## 📧 Gmail Integration Setup

To enable **Inbox Insights**:

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Enable the **Gmail API**.
4.  Configure **OAuth Consent Screen**:
    *   User Type: External
    *   Scopes: `gmail.readonly`
    *   Add your email as a Test User.
5.  Create Credentials (**OAuth Client ID**):
    *   Type: Web Application
    *   Authorized Origins (Add **BOTH**):
        *   `http://localhost:5173`
        *   `https://pipeliner-ai-12201177322.us-west1.run.app`
6.  Copy the **Client ID** and paste it into the app Settings.

## 🔒 Privacy
*   In **Local Mode**, all data is stored in your browser's `localStorage`. Nothing leaves your device except the text sent to Gemini for parsing.
*   In **Cloud Mode**, data is encrypted and stored via InstantDB.
*   **Gmail Data**: Email snippets are sent *only* to Gemini for analysis and are never stored permanently.
