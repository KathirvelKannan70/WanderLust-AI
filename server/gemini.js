import { GoogleGenAI } from '@google/genai';
import { generateMockItinerary } from './mockData.js';

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
  "currency": "USD" | "EUR" | "GBP" | "JPY" | string,
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
    console.log('ℹ️ No GEMINI_API_KEY detected in env. Using smart mock itinerary generator.');
    return { data: generateMockItinerary(userPrompt, preferences), raw: null, source: 'mock' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const fullPrompt = `${SYSTEM_PROMPT}

User Prompt: "${userPrompt}"
User Preferences: ${JSON.stringify(preferences)}

Generate a detailed day-by-day travel itinerary matching the JSON schema. Return raw JSON ONLY.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const text = response.text ? response.text.trim() : '';

    return { data: text, raw: text, source: 'gemini' };
  } catch (error) {
    console.error('⚠️ Gemini API Call Failed:', error.message);
    // Fallback to mock data if API call fails (e.g. quota or invalid key)
    return { 
      data: generateMockItinerary(userPrompt, preferences), 
      raw: null, 
      source: 'mock_fallback',
      errorNotice: error.message 
    };
  }
}

export async function refineItineraryFromAI(currentItinerary, refinementInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Basic mock refinement
    const updated = JSON.parse(JSON.stringify(currentItinerary));
    updated.summary += ` (Refined: ${refinementInstruction})`;
    if (updated.days && updated.days[0] && updated.days[0].stops[0]) {
      updated.days[0].stops[0].description += ` [Updated per request: ${refinementInstruction}]`;
    }
    return { data: updated, raw: null, source: 'mock' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const fullPrompt = `${SYSTEM_PROMPT}

Current Itinerary:
${JSON.stringify(currentItinerary, null, 2)}

User Refinement Request: "${refinementInstruction}"

Modify the itinerary according to the user request while preserving the strict JSON schema. Return raw JSON ONLY.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const text = response.text ? response.text.trim() : '';
    return { data: text, raw: text, source: 'gemini' };
  } catch (error) {
    console.error('⚠️ Gemini Refinement Failed:', error.message);
    throw new Error(`Refinement failed: ${error.message}`);
  }
}
