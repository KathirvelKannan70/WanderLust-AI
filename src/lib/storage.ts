import { Itinerary } from '../types/itinerary';

const STORAGE_KEY = 'wanderlust_saved_trips_v1';

export interface SavedTrip {
  id: string;
  savedAt: string;
  itinerary: Itinerary;
}

export function getSavedTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read saved trips from localStorage:', err);
    return [];
  }
}

export function saveTrip(itinerary: Itinerary): SavedTrip[] {
  try {
    const trips = getSavedTrips();
    const existingIndex = trips.findIndex((t) => t.itinerary.tripTitle === itinerary.tripTitle);

    const newSavedItem: SavedTrip = {
      id: existingIndex >= 0 ? trips[existingIndex].id : `trip-${Date.now()}`,
      savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      itinerary,
    };

    let updatedTrips = [];
    if (existingIndex >= 0) {
      updatedTrips = [...trips];
      updatedTrips[existingIndex] = newSavedItem;
    } else {
      updatedTrips = [newSavedItem, ...trips];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips));
    return updatedTrips;
  } catch (err) {
    console.error('Failed to save trip to localStorage:', err);
    return getSavedTrips();
  }
}

export function deleteSavedTrip(id: string): SavedTrip[] {
  try {
    const trips = getSavedTrips();
    const updated = trips.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete saved trip:', err);
    return getSavedTrips();
  }
}
