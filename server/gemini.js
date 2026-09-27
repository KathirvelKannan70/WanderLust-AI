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
    console.log('ℹ️ No GEMINI_API_KEY detected in env. Using smart mock itinerary generator.');
    return { data: generateMockItinerary(userPrompt, preferences), raw: null, source: 'mock' };
  }

  const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Requesting Gemini API with model: ${modelName}...`);
      const ai = new GoogleGenAI({ apiKey });
      
      const fullPrompt = `${SYSTEM_PROMPT}

User Prompt: "${userPrompt}"
User Preferences: ${JSON.stringify(preferences)}

Generate a detailed day-by-day travel itinerary matching the JSON schema. Return raw JSON ONLY.`;

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
        console.log(`✅ Success with ${modelName}`);
        return { data: text, raw: text, source: `gemini (${modelName})` };
      }
    } catch (error) {
      console.warn(`⚠️ Model ${modelName} call failed:`, error.message);
    }
  }

  // Direct REST API Fallback if SDK fails
  try {
    console.log('🔄 Attempting Direct Gemini REST API Fallback...');
    const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const restRes = await fetch(restUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Request: "${userPrompt}"` }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (restRes.ok) {
      const restData = await restRes.json();
      const rawText = restData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (rawText) {
        return { data: rawText, raw: rawText, source: 'gemini (rest fallback)' };
      }
    }
  } catch (restErr) {
    console.warn('⚠️ Direct REST API Fallback failed:', restErr.message);
  }

  console.log('ℹ️ Falling back to dynamic mock generator for:', userPrompt);
  return { 
    data: generateMockItinerary(userPrompt, preferences), 
    raw: null, 
    source: 'mock_fallback' 
  };
}

export async function refineItineraryFromAI(currentItinerary, refinementInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const updated = JSON.parse(JSON.stringify(currentItinerary));
    updated.summary += ` (Refined: ${refinementInstruction})`;
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
      model: 'gemini-1.5-flash',
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
    return { 
      data: currentItinerary, 
      raw: null, 
      source: 'mock_fallback' 
    };
  }
}
