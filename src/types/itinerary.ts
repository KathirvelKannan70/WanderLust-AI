export type ActivityCategory = 
  | 'sights'
  | 'food'
  | 'shopping'
  | 'transport'
  | 'accommodation'
  | 'nature'
  | 'nightlife'
  | 'other';

export interface ItineraryStop {
  id: string;
  time: string;
  title: string;
  description: string;
  category: ActivityCategory;
  location: string;
  estimatedCost: number;
  durationMinutes: number;
  tips?: string;
  mapQuery?: string;
  completed?: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  theme: string;
  title: string;
  stops: ItineraryStop[];
}

export interface PackingCategory {
  category: string;
  items: string[];
}

export interface Itinerary {
  tripTitle: string;
  destination: string;
  durationDays: number;
  estimatedTotalCost: number;
  currency: string;
  summary: string;
  travelTips: string[];
  days: ItineraryDay[];
  packingList: PackingCategory[];
}

export interface ValidationResult {
  success: boolean;
  data?: Itinerary;
  error?: {
    type: 'malformed_json' | 'wrong_shape' | 'empty_response' | 'schema_mismatch';
    message: string;
    details?: string[];
    rawSnippet?: string;
  };
}

export interface TravelPreferences {
  budgetLevel?: 'budget' | 'moderate' | 'luxury';
  pace?: 'relaxed' | 'balanced' | 'fast-paced';
  travelers?: 'solo' | 'couple' | 'family' | 'friends';
}
