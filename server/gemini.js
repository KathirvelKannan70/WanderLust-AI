import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `
You are an expert AI Travel Planner assistant.
You MUST output ONLY valid JSON matching the exact schema below.
DO NOT include markdown formatting like \`\`\`json or \`\`\`, DO NOT add introductory text or postscript commentary.

JSON Schema:
{
  "tripTitle": "string",
  "destination": "string",
  "durationDays": number,
  "estimatedTotalCost": number,
  "currency": "USD" | "EUR" | "GBP" | "JPY" | "INR" | string,
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
          "time": "string (e.g. 09:00 AM)",
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
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-2.5-flash'
  ];
  
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Requesting Realtime Gemini API (${modelName}) for prompt: "${userPrompt}"...`);
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
        console.log(`✅ Realtime Gemini AI successfully generated output with ${modelName}`);
        return { data: text, raw: text, source: `realtime-gemini (${modelName})` };
      }
    } catch (error) {
      console.warn(`⚠️ Model ${modelName} call error:`, error.message);
      lastError = error;
    }
  }

  // Direct REST API fallback with working models
  for (const modelName of ['gemini-3.6-flash', 'gemini-flash-latest']) {
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

  throw new Error(lastError?.message || 'Failed to fetch realtime response from Gemini API.');
}

export async function refineItineraryFromAI(currentItinerary, refinementInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from .env file.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const fullPrompt = `${SYSTEM_PROMPT}

Current Itinerary:
${JSON.stringify(currentItinerary, null, 2)}

User Refinement Request: "${refinementInstruction}"

Modify the itinerary according to the user request while preserving the strict JSON schema. Return raw JSON ONLY.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const text = response.text ? response.text.trim() : '';
    return { data: text, raw: text, source: 'realtime-gemini (gemini-3.6-flash)' };
  } catch (error) {
    console.error('⚠️ Gemini Refinement Failed:', error.message);
    throw new Error(`Realtime Refinement failed: ${error.message}`);
  }
}
