# WanderLust AI — Interactive Structured Trip Planner 🗺️✨
> **Flam — Frontend Internship Assignment Submission**  
> **Candidate Reference:** Kathirvel Kannan  
> **Live Demo:** [https://flam-frontend-assignment-xn4e.onrender.com](https://flam-frontend-assignment-xn4e.onrender.com)  
> **GitHub Repository:** [(https://github.com/KathirvelKannan70/WanderLust-AI)](https://github.com/KathirvelKannan70/WanderLust-AI))

---

## 🌟 Overview

**WanderLust AI** is an interactive, stateful travel itinerary tool built with **React**, **TypeScript**, **Tailwind CSS**, and an **Express backend proxy** powered by **Google Gemini 2.5 Flash LLM**. 

Instead of printing unformatted text in a chatbot window, WanderLust AI requests **strict structured JSON data** from the LLM, validates and repairs unpredictable model outputs, and renders the result as an interactive React component suite where users can expand, reorder, delete, edit, refine, save, and export their day-by-day travel plans.

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18+ (Tested on Node v22.14.0)
- **npm**: v9+

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/KathirvelKannan70/WanderLust-AI
cd WanderLust-AI
npm install
```

### 3. Environment Setup (Optional)
Copy the environment example file:
```bash
cp .env.example .env
```
*(Optional)* Add your Gemini API key inside `.env`:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```
> 💡 **Smart Mock Mode:** If no `GEMINI_API_KEY` is provided in `.env`, the backend proxy **automatically switches to built-in smart mock data**, allowing reviewers to immediately run and test the app without needing API keys!

### 4. Running the Application
Launch both the Express backend server and the Vite React frontend concurrently with one command:
```bash
npm start
```
Open your browser at **`http://localhost:5173`**.

---

## 🏗️ Architecture & Project Structure

```
flam-frontend-assignment/
├── server/
│   ├── index.js             # Express backend proxy (protects API key, handles failure simulation)
│   ├── gemini.js            # Gemini API integration & strict JSON prompt engineering
│   └── mockData.js          # Offline fallback itinerary generator
├── src/
│   ├── components/
│   │   ├── Header.tsx       # Brand header, API status badge & Saved Trips launcher
│   │   ├── PromptInput.tsx  # Free-form input, sample presets, travel filters & failure suite
│   │   ├── ItineraryView.tsx # Master day timeline, day tabs, overview banner
│   │   ├── DayCard.tsx      # Single day container with stop management
│   │   ├── ActivityItem.tsx # Stop card with expand, reorder, delete, edit & map links
│   │   ├── AddStopModal.tsx # Modal to create or edit custom stops
│   │   ├── BudgetOverview.tsx # Interactive category budget breakdown
│   │   ├── PackingChecklist.tsx # Smart checkable packing list
│   │   ├── RefinementBar.tsx # Follow-up AI refinement prompt loop
│   │   ├── SavedTripsModal.tsx # LocalStorage session manager
│   │   ├── LoadingState.tsx # Step progress indicator & skeleton shimmer cards
│   │   └── ErrorState.tsx   # Detailed error screen with developer diagnostic logs
│   ├── lib/
│   │   ├── api.ts           # Frontend API client with AbortController & stale request guard
│   │   ├── validateItinerary.ts # Multi-stage Zod validator & JSON sanitizer
│   │   ├── storage.ts       # LocalStorage helper for session persistence
│   │   ├── mockData.ts      # Client-side fallback generator
│   │   └── exportUtils.ts   # Export itinerary to JSON, Markdown, and PDF
│   ├── types/
│   │   └── itinerary.ts     # TypeScript interface definitions
│   ├── App.tsx              # Main state controller & race condition guard
│   └── index.css            # Tailwind CSS imports, glassmorphism & shimmer animations
├── .env.example
├── package.json
└── README.md
```

---

## 🛡️ Handling Bad AI Output & Failure Modes

A major highlight of this project is defensive data validation and failure handling (**20% of evaluation weight**). AI output is treated as inherently untrusted.

### 1. Multi-Stage Defensive Validation (`src/lib/validateItinerary.ts`)
Before AI output reaches the UI, it passes through 5 validation stages:
- **Sanitizer:** Strips markdown code fences (` ```json `), leading noise, and trailing commas.
- **JSON Parser Guard:** Catches syntax errors (malformed JSON) and routes to a clear error state instead of crashing.
- **Object Shape Check:** Verifies the output is a non-null object (not a primitive or bare array).
- **Defensive Property Check:** Ensures essential fields (`tripTitle`, `destination`, `days` array) are present.
- **Zod Schema Safe Parse:** Validates type constraints, auto-coerces numbers, provides default fallbacks, and guarantees unique IDs.

### 2. Stale Response Guard (`src/App.tsx`)
Prevents slow requests from overwriting newer user requests using a request sequence counter:
```ts
const requestId = useRef(0);

async function handleGenerateItinerary(prompt, preferences) {
  const currentId = ++requestId.current;
  const response = await fetchItinerary({ prompt, signal });
  
  // Guard: Ignore if a newer request was initiated
  if (currentId !== requestId.current) return;
  
  setItinerary(response.data);
}
```

### 3. Evaluator Testing Suite (Built into UI)
To demo failure handling live, expand the **"Evaluator Testing Suite"** accordion inside the prompt form:
- 🔴 **Malformed JSON:** Simulates broken JSON syntax from model.
- 🔴 **Wrong Shape:** Simulates valid JSON missing required `days` / `stops` arrays.
- 🔴 **Empty Output:** Simulates empty response from model.
- 🔴 **Server 500 Error:** Simulates backend proxy failure.
- 🔴 **Slow Response Timeout:** Simulates 15s+ delay triggering `AbortController` timeout.

---

## 💡 Key Features & Interactive Stretch Goals

- 🔄 **Interactive Day Timeline:** Expand/collapse stop details, reorder activities (move up/down), delete stops, and edit activity timing/costs.
- ➕ **Add Custom Stops:** Insert custom activities into any day with instant budget recalculation.
- 🪄 **AI Refinement Loop:** Submit follow-up prompts ("Make Day 2 more relaxed", "Add vegan food options") to edit the existing itinerary.
- 📊 **Interactive Budget Breakdown:** Visual expense bar and category breakdown (Sights, Food, Shopping, Transport).
- 🎒 **Packing Checklist:** Smart checkable packing items with custom item additions.
- 💾 **Session Persistence:** Save itineraries to `localStorage` and reload past trips anytime.
- 📥 **Export Options:** Export complete itineraries as `.json`, `.md` (Markdown), or print to PDF.

---

## 🤖 AI Usage Disclosure Note

In accordance with assignment guidelines:
- **AI Tools Used:** Antigravity AI, Claude 3.5 Sonnet, and GitHub Copilot.
- **What AI was used for:**
  - Generating initial Vite + React + Tailwind boilerplate configurations.
  - Formulating strict system prompts for structured JSON enforcement.
  - Designing realistic mock itinerary fallback data.
  - Writing CSS glassmorphism and shimmer loading animations.
- **Human Ownership:** All architectural design, Zod validation schemas, state management, race condition guards, component hierarchy, error reporting panels, and manual testing were authored and verified step-by-step.

---

## ⚠️ Known Limitations

1. **Free Gemini API Quota:** The free tier of Gemini API may enforce rate limits (RPM). If quota is exceeded, the backend proxy automatically falls back to smart mock data.
2. **Google Maps Queries:** Map links generate search query URLs based on activity title and location rather than exact coordinate pins.

---

## ⏱️ Time Spent Breakdown

| Activity | Time Spent |
| :--- | :--- |
| **Requirements Analysis & JSON Schema Design** | 0.5 hours |
| **Backend Proxy & Gemini API Integration** | 1.0 hours |
| **Multi-Stage Validation & Zod Error Handling** | 1.5 hours |
| **React Interactive UI Components (DayCard, ActivityItem, Modals)** | 2.0 hours |
| **AI Refinement Loop, Budget Breakdown & Session Storage** | 1.0 hours |
| **Polishing UI, Testing Failure Suite & README** | 0.5 hours |
| **Total Work Time** | **~6.5 hours** |

---

Made with ❤️ for the Flam Frontend Internship Assignment.
