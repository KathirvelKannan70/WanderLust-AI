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

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured in .env. Please set a valid API key from https://aistudio.google.com/ in your .env file.');
  }

  const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
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

  // Direct REST API attempt as fallback for valid key
  try {
    console.log('🔄 Attempting direct REST call to Gemini API...');
    const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const restRes = await fetch(restUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Request: "${userPrompt}"` }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const restData = await restRes.json();
    if (!restRes.ok) {
      const apiErrMessage = restData.error?.message || `HTTP ${restRes.status} Error from Gemini API`;
      throw new Error(`Gemini API Error: ${apiErrMessage}`);
    }

    const rawText = restData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (rawText) {
      return { data: rawText, raw: rawText, source: 'realtime-gemini (rest)' };
    }
  } catch (restErr) {
    console.error('⚠️ Direct REST Call Error:', restErr.message);
    throw new Error(restErr.message || lastError?.message || 'Failed to fetch realtime response from Gemini API.');
  }

  throw new Error(lastError?.message || 'Gemini API returned an empty or invalid response.');
}

export async function refineItineraryFromAI(currentItinerary, refinementInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured in .env file.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const fullPrompt = `${SYSTEM_PROMPT}

Current Itinerary:
${JSON.stringify(currentItinerary, null, 2)}

User Refinement Request: "${refinementInstruction}"

Modify the itinerary according to the user request while preserving the strict JSON schema. Return raw JSON ONLY.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const text = response.text ? response.text.trim() : '';
    return { data: text, raw: text, source: 'realtime-gemini' };
  } catch (error) {
    console.error('⚠️ Gemini Refinement Failed:', error.message);
    throw new Error(`Realtime Refinement failed: ${error.message}`);
  }
}
