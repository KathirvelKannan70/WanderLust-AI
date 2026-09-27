import { z } from 'zod';
import { Itinerary, ValidationResult, ActivityCategory } from '../types/itinerary';

// Strict Zod schema for structural integrity
const stopSchema = z.object({
  id: z.string().default(() => `stop-${Math.random().toString(36).substr(2, 9)}`),
  time: z.string().default('Flex Time'),
  title: z.string().min(1, 'Stop title cannot be empty'),
  description: z.string().default('No description provided.'),
  category: z.enum(['sights', 'food', 'shopping', 'transport', 'accommodation', 'nature', 'nightlife', 'other'])
    .catch('other'),
  location: z.string().default('City Center'),
  estimatedCost: z.coerce.number().nonnegative().default(0),
  durationMinutes: z.coerce.number().positive().default(60),
  tips: z.string().optional(),
  mapQuery: z.string().optional(),
  completed: z.boolean().default(false),
});

const daySchema = z.object({
  dayNumber: z.coerce.number().int().positive(),
  theme: z.string().default('Exploration'),
  title: z.string().default('Day Schedule'),
  stops: z.array(stopSchema).min(1, 'Each day must contain at least one stop'),
});

const packingCategorySchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

const itinerarySchema = z.object({
  tripTitle: z.string().min(1, 'Trip title is required'),
  destination: z.string().min(1, 'Destination is required'),
  durationDays: z.coerce.number().int().positive().default(1),
  estimatedTotalCost: z.coerce.number().nonnegative().default(0),
  currency: z.string().default('USD'),
  summary: z.string().default('Custom travel itinerary.'),
  travelTips: z.array(z.string()).default([]),
  days: z.array(daySchema).min(1, 'Itinerary must have at least 1 day'),
  packingList: z.array(packingCategorySchema).default([]),
});

/**
 * Clean markdown backticks, preambles, postscripts, and trailing commas before parsing
 */
export function sanitizeRawJson(rawText: string): string {
  if (!rawText) return '';
  let cleaned = rawText.trim();

  // 1. Replace fancy smart quotes with standard ASCII quotes
  cleaned = cleaned
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");

  // 2. Extract content inside markdown code fences if present (e.g. ```json ... ```)
  const codeFenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/i);
  if (codeFenceMatch && codeFenceMatch[1] && codeFenceMatch[1].includes('{')) {
    cleaned = codeFenceMatch[1].trim();
  }

  // 3. Extract JSON object strictly between the first '{' and the last '}'
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // 4. Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  // 5. Strip illegal ASCII control characters (except \n, \r, \t)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return cleaned.trim();
}

/**
 * Validates raw AI output against the expected shape.
 * Performs sanitization, parsing, defensive structural check, and schema validation.
 */
export function validateItineraryResponse(rawInput: any): ValidationResult {
  // Case 1: Empty or null response
  if (!rawInput) {
    return {
      success: false,
      error: {
        type: 'empty_response',
        message: 'AI returned an empty response.',
        details: ['The server received null or empty content from the model.']
      }
    };
  }

  let parsedObject: any = rawInput;

  // Case 2: Parse JSON string if input is raw text
  if (typeof rawInput === 'string') {
    const cleaned = sanitizeRawJson(rawInput);
    if (!cleaned) {
      return {
        success: false,
        error: {
          type: 'empty_response',
          message: 'AI returned an empty or whitespace-only response.',
          rawSnippet: rawInput.slice(0, 200)
        }
      };
    }

    try {
      parsedObject = JSON.parse(cleaned);
    } catch (parseError: any) {
      // Secondary repair attempt: escape raw unescaped newlines/tabs inside JSON string literals
      let parseSucceeded = false;
      try {
        const escapedStrings = cleaned.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
          return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
        });
        parsedObject = JSON.parse(escapedStrings);
        parseSucceeded = true;
      } catch (secondError: any) {
        // Fallback: truncated JSON recovery
        try {
          const openBraces = (cleaned.match(/\{/g) || []).length;
          const closeBraces = (cleaned.match(/\}/g) || []).length;
          const openBrackets = (cleaned.match(/\[/g) || []).length;
          const closeBrackets = (cleaned.match(/\]/g) || []).length;

          let fix = cleaned.replace(/,?\s*"[^"]*"?\s*:?\s*"?[^"]*$/s, '');
          for (let i = 0; i < openBrackets - closeBrackets; i++) fix += ']';
          for (let i = 0; i < openBraces - closeBraces; i++) fix += '}';

          parsedObject = JSON.parse(fix);
          parseSucceeded = true;
        } catch (thirdError: any) {
          // All recovery attempts failed
        }
      }

      if (!parseSucceeded) {
        return {
          success: false,
          error: {
            type: 'malformed_json',
            message: 'Failed to parse AI output as JSON.',
            details: [
              `JSON Syntax Error: ${parseError.message}`,
              'Ensure model returns valid raw JSON without invalid escape characters.'
            ],
            rawSnippet: cleaned.slice(0, 300)
          }
        };
      }
    }
  }

  // Case 3: Structural Check - Ensure it's a non-null object
  if (typeof parsedObject !== 'object' || parsedObject === null || Array.isArray(parsedObject)) {
    return {
      success: false,
      error: {
        type: 'wrong_shape',
        message: 'AI response is not a valid JSON object.',
        details: [`Expected an object '{...}', but received type: ${typeof parsedObject}`],
        rawSnippet: JSON.stringify(parsedObject).slice(0, 300)
      }
    };
  }

  // Case 4: Defensive check for essential fields before schema
  const missingFields: string[] = [];
  if (!parsedObject.tripTitle) missingFields.push('tripTitle');
  if (!parsedObject.destination) missingFields.push('destination');
  if (!Array.isArray(parsedObject.days) || parsedObject.days.length === 0) missingFields.push('days array');

  if (missingFields.length > 0) {
    return {
      success: false,
      error: {
        type: 'wrong_shape',
        message: `Missing essential fields in AI response: ${missingFields.join(', ')}`,
        details: [
          `The response was missing required structure: [${missingFields.join(', ')}]`,
          'AI failed to adhere to the requested JSON schema.'
        ],
        rawSnippet: JSON.stringify(parsedObject, null, 2).slice(0, 400)
      }
    };
  }

  // Case 5: Zod Schema Safe Parse
  const schemaValidation = itinerarySchema.safeParse(parsedObject);

  if (!schemaValidation.success) {
    const issueDetails = schemaValidation.error.issues.map(
      issue => `At path "${issue.path.join('.')}": ${issue.message}`
    );

    return {
      success: false,
      error: {
        type: 'schema_mismatch',
        message: 'AI output does not match the required itinerary data shape.',
        details: issueDetails,
        rawSnippet: JSON.stringify(parsedObject, null, 2).slice(0, 400)
      }
    };
  }

  // Successfully validated! Ensure every stop has a unique ID
  const validatedItinerary: Itinerary = schemaValidation.data as Itinerary;
  validatedItinerary.days = validatedItinerary.days.map((day, dIdx) => ({
    ...day,
    stops: day.stops.map((stop, sIdx) => ({
      ...stop,
      id: stop.id || `day-${day.dayNumber}-stop-${sIdx + 1}-${Math.random().toString(36).substr(2, 5)}`
    }))
  }));

  return {
    success: true,
    data: validatedItinerary
  };
}
