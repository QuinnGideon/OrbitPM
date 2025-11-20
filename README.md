# PM Orbit 🪐

**PM Orbit** is an intelligent, AI-powered interview tracker designed specifically for Product Managers. It helps you manage the chaos of job hunting by tracking applications, visualizing timelines, and providing actionable metrics on your interview performance.

## 🚀 Live Demo
[https://pm-orbit-12201177322.us-west1.run.app/](https://pm-orbit-12201177322.us-west1.run.app/)

## ✨ Key Features

### 🧠 AI-Powered Automation
*   **Smart Paste**: Paste a raw job description, and **Google Gemini Flash 2.5** automatically extracts the Company, Title, Compensation, Location, and suggests a realistic Interview Round structure based on the role's seniority.
*   **Intelligent Summaries**: The AI generates a concise 2-sentence summary of the role so you don't have to re-read the whole JD every time.
*   **Inbox Insights** (New!): Connect your Gmail to automatically scan for interview scheduling requests, offer letters, or rejections, and apply them to your board with one click.

### 📊 Pipeline Management
*   **Kanban Board**: Visualize applications across stages (Wishlist, Applied, Interviewing, Offer, Rejected).
*   **Calendar View**: A monthly view of all your upcoming and past interview rounds to spot schedule overlaps.
*   **Active Pipeline Health**: A dedicated table in the dashboard showing the velocity (rounds completed vs. total) and time-active for every role.

### 📅 Timeline & Gantt Tracking
*   **Custom Timelines**: Every job card has an editable timeline. Add rounds (Recruiter Screen, Case Study, etc.), set dates, and track status (Pending, Passed, Failed).
*   **Date Logic**: The app automatically sorts rounds chronologically and calculates "Days Active" based on the earliest recorded activity.

### 📈 Metrics & Insights
*   **Funnel Visualization**: See where you are dropping off in the process.
*   **Success Rates**: Track your Offer/Win rate.
*   **Velocity Tracking**: Visual progress bars for every active application.

### ☁️ Sync & Security
*   **Local & Cloud Modes**: Start with Local Storage (privacy-first) and upgrade to Cloud Sync seamlessly.
*   **InstantDB Integration**: Real-time data syncing across devices.
*   **Magic Code Auth**: Secure, passwordless login via Email.

### 🎨 UI/UX
*   **Dark Mode**: Fully supported system-wide dark mode.
*   **Responsive Design**: Optimized for Mobile, Tablet, and Desktop.

## 🛠 Tech Stack
*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **Database**: InstantDB (Graph-based, Real-time)
*   **AI Model**: Google Gemini 2.5 Flash (via `@google/genai` SDK)
*   **Charts**: Recharts
*   **Icons**: Lucide React

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
2.  Create a new project (e.g. "PM Orbit").
3.  Enable the **Gmail API**.
4.  Configure **OAuth Consent Screen**:
    *   User Type: External
    *   Scopes: `gmail.readonly`
    *   Add your email as a Test User.
5.  Create Credentials (**OAuth Client ID**):
    *   Type: Web Application
    *   Authorized Origins: `http://localhost:5173` (and your deployed URL)
6.  Copy the **Client ID** and paste it into the app Settings.

## 🔒 Privacy
*   In **Local Mode**, all data is stored in your browser's `localStorage`. Nothing leaves your device except the text sent to Gemini for parsing.
*   In **Cloud Mode**, data is encrypted and stored via InstantDB.
*   **Gmail Data**: Email snippets are sent *only* to Gemini for analysis and are never stored permanently.

## 🤝 Contributing
PRs are welcome! Please ensure you update the `README.md` with any new features added.