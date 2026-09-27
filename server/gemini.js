import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `
You are an expert AI Travel Planner assistant specializing in detailed, highly immersive travel itineraries.
You MUST output ONLY valid JSON matching the exact schema below.
DO NOT include markdown formatting like \`\`\`json or \`\`\`, DO NOT add introductory text or postscript commentary.

CRITICAL ITINERARY RULES:
1. CURRENCY: Default all budget estimations and activity cost numbers to Indian Rupees ("INR" - ₹) unless the user explicitly requests another currency.
2. HIGH DENSITY & MINIMUM 4-5 STOPS PER DAY: Every day in the itinerary MUST contain strictly 4 to 5 complete, distinct activities/stops. NEVER generate fewer than 4 stops for any day. Every day must include:
   - 🌅 Morning Landmark / Temple / Culture (e.g., 08:30 AM)
   - 🏛️ Mid-Day Exploration / Sightseeing (e.g., 11:00 AM)
   - 🍛 Authentic Local Lunch & Specialty Food (e.g., 01:30 PM)
   - 🛍️ Afternoon Shopping / Craft / Nature Stroll (e.g., 04:30 PM)
   - 🌙 Evening Dinner / Night Market / Viewpoint (e.g., 07:30 PM)
3. EXACT DURATION: If the user prompt specifies a number of days (e.g. "5 days in Kumbakonam" or "4 days in Madurai"), generate EXACTLY that number of days in the "days" array. If unspecified, default to 4 full days.
4. DEEP INSIDER TIPS: Write rich, engaging descriptions and specific insider tips (e.g., best dishes to try, dress codes, ticket booking advice) for every single stop.

JSON Schema:
{
  "tripTitle": "string",
  "destination": "string",
  "durationDays": number,
  "estimatedTotalCost": number,
  "currency": "INR",
  "summary": "string",
  "travelTips": ["string"],
  "days": [
    {
      "dayNumber": number,
      "theme": "string",
      "title": "string",
      "stops": [
        {
          "id": "string (unique)",
          "time": "string (e.g. 08:30 AM)",
          "title": "string",
          "description": "string",
          "category": "sights" | "food" | "shopping" | "transport" | "accommodation" | "nature" | "nightlife",
          "location": "string",
          "estimatedCost": number,
          "durationMinutes": number,
          "tips": "string",
          "mapQuery": "string"
        }
      ]
    }
  ],
  "packingList": [
    {
      "category": "string",
      "items": ["string"]
    }
  ]
}
`;

export async function generateItineraryFromAI(userPrompt, preferences = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from .env file.');
  }

  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-flash-latest'
  ];
  
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Requesting High-Density Realtime Gemini API (${modelName}) for prompt: "${userPrompt}"...`);
      const ai = new GoogleGenAI({ apiKey });
      
      const fullPrompt = `${SYSTEM_PROMPT}

User Request: "${userPrompt}"
User Preferences: ${JSON.stringify(preferences)}

Generate a detailed, custom day-by-day travel itinerary matching the JSON schema for "${userPrompt}". Return raw JSON ONLY.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: fullPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const text = response.text ? response.text.trim() : '';
      if (text) {
        console.log(`✅ High-Density Gemini AI successfully generated output with ${modelName}`);
        return { data: text, raw: text, source: `realtime-gemini (${modelName})` };
      }
    } catch (error) {
      console.warn(`⚠️ Model ${modelName} call error:`, error.message);
      lastError = error;
    }
  }

  // Direct REST API fallback
  for (const modelName of ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash-latest']) {
    try {
      console.log(`🔄 Attempting direct REST call to Gemini API (${modelName})...`);
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const restRes = await fetch(restUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Request: "${userPrompt}"` }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      const restData = await restRes.json();
      if (restRes.ok && restData.candidates?.[0]?.content?.parts?.[0]?.text) {
        const rawText = restData.candidates[0].content.parts[0].text;
        console.log(`✅ REST Call Success with ${modelName}`);
        return { data: rawText, raw: rawText, source: `realtime-gemini (${modelName}-rest)` };
      }
    } catch (restErr) {
      console.warn(`⚠️ REST Call Error (${modelName}):`, restErr.message);
    }
  }

  let finalErrorMsg = lastError?.message || 'Failed to fetch realtime response from Gemini API.';
  try {
    const parsedErr = JSON.parse(finalErrorMsg);
    if (parsedErr?.error?.message) finalErrorMsg = parsedErr.error.message;
  } catch {}

  throw new Error(finalErrorMsg);
}

export async function refineItineraryFromAI(currentItinerary, refinementInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from .env file.');
  }

  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-flash-latest'
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Requesting Realtime Refinement (${modelName}) for instruction: "${refinementInstruction}"...`);
      const ai = new GoogleGenAI({ apiKey });
      const fullPrompt = `${SYSTEM_PROMPT}

Current Itinerary:
${JSON.stringify(currentItinerary, null, 2)}

User Refinement Request: "${refinementInstruction}"

Modify the itinerary according to the user request while preserving the strict JSON schema and high activity density. Return raw JSON ONLY.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: fullPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const text = response.text ? response.text.trim() : '';
      if (text) {
        console.log(`✅ Realtime Refinement successful with ${modelName}`);
        return { data: text, raw: text, source: `realtime-gemini (${modelName})` };
      }
    } catch (error) {
      console.warn(`⚠️ Refinement model ${modelName} error:`, error.message);
      lastError = error;
    }
  }

  // Direct REST API Fallback for Refinement
  for (const modelName of ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash-latest']) {
    try {
      console.log(`🔄 Attempting direct REST Refinement (${modelName})...`);
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const restRes = await fetch(restUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nCurrent Itinerary:\n${JSON.stringify(currentItinerary)}\n\nRefinement Request: "${refinementInstruction}"` }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      const restData = await restRes.json();
      if (restRes.ok && restData.candidates?.[0]?.content?.parts?.[0]?.text) {
        const rawText = restData.candidates[0].content.parts[0].text;
        console.log(`✅ REST Refinement Success with ${modelName}`);
        return { data: rawText, raw: rawText, source: `realtime-gemini (${modelName}-rest)` };
      }
    } catch (restErr) {
      console.warn(`⚠️ REST Refinement Error (${modelName}):`, restErr.message);
    }
  }

  let finalRefineErrorMsg = lastError?.message || 'Refinement request failed across all Gemini models.';
  try {
    const parsedErr = JSON.parse(finalRefineErrorMsg);
    if (parsedErr?.error?.message) finalRefineErrorMsg = parsedErr.error.message;
  } catch {}

  throw new Error(finalRefineErrorMsg);
}
