import { validateItineraryResponse } from './validateItinerary';
import { Itinerary, TravelPreferences } from '../types/itinerary';

export interface ApiGenerateOptions {
  prompt: string;
  preferences?: TravelPreferences;
  testFailureMode?: string;
  signal?: AbortSignal;
}

export interface ApiResponse {
  success: boolean;
  data?: Itinerary;
  source?: 'gemini' | 'mock' | 'mock_fallback';
  error?: {
    type: 'network' | 'timeout' | 'server_error' | 'malformed_json' | 'wrong_shape' | 'empty_response' | 'schema_mismatch';
    message: string;
    details?: string[];
    rawSnippet?: string;
  };
}

const TIMEOUT_MS = 45000; // 45s timeout limit for complex multi-day AI requests

export async function fetchItinerary(options: ApiGenerateOptions): Promise<ApiResponse> {
  const { prompt, preferences, testFailureMode, signal } = options;

  // Create an internal timeout controller combined with external signal
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);

  // Link signal if provided
  if (signal) {
    signal.addEventListener('abort', () => timeoutController.abort());
  }

  try {
    const response = await fetch('/api/generate-itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        preferences,
        testFailureMode,
      }),
      signal: timeoutController.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Server error');
      let cleanDetail = errText;
      try {
        const parsed = JSON.parse(errText);
        if (typeof parsed.error === 'string') cleanDetail = parsed.error;
        else if (parsed.error?.message) cleanDetail = parsed.error.message;
      } catch {}

      const isHighDemand = response.status === 503 || cleanDetail.includes('503') || cleanDetail.toLowerCase().includes('high demand');

      return {
        success: false,
        error: {
          type: 'server_error',
          message: isHighDemand
            ? 'Gemini AI API High Demand (503 Service Unavailable)'
            : `Server returned HTTP status ${response.status}`,
          details: [cleanDetail || 'An unexpected internal error occurred on the backend server.'],
        },
      };
    }

    const payload = await response.json();
    const rawResult = payload.result;

    // Run our strict multi-stage validator
    const validation = validateItineraryResponse(rawResult);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    return {
      success: true,
      data: validation.data,
      source: payload.source || 'gemini',
    };
  } catch (err: any) {
    clearTimeout(timer);

    if (err.name === 'AbortError') {
      return {
        success: false,
        error: {
          type: 'timeout',
          message: 'Request timed out or was cancelled by user.',
          details: ['The AI response took longer than 15 seconds to generate.'],
        },
      };
    }

    return {
      success: false,
      error: {
        type: 'network',
        message: 'Failed to connect to the trip planner backend API.',
        details: [err.message || 'Check network connection or ensure server is running on port 3001.'],
      },
    };
  }
}

export async function fetchRefineItinerary(
  currentItinerary: Itinerary,
  instruction: string,
  signal?: AbortSignal
): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/refine-itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentItinerary, instruction }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const validation = validateItineraryResponse(payload.result);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    return {
      success: true,
      data: validation.data,
      source: payload.source,
    };
  } catch (err: any) {
    return {
      success: false,
      error: {
        type: 'server_error',
        message: 'Failed to refine itinerary.',
        details: [err.message],
      },
    };
  }
}
