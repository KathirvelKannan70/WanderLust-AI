import { Itinerary } from '../types/itinerary';

const LOCAL_STORAGE_KEY = 'wanderlust_saved_trips_v1';

export interface SavedTrip {
  id: string;
  savedAt: string;
  itinerary: Itinerary;
}

/**
 * Fetch all saved trips from the Server Database API (with LocalStorage fallback)
 */
export async function getSavedTrips(): Promise<SavedTrip[]> {
  try {
    const res = await fetch('/api/trips');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.trips)) {
        return data.trips;
      }
    }
  } catch (err) {
    console.warn('⚠️ Server DB API unavailable, falling back to LocalStorage:', err);
  }

  // LocalStorage Fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

/**
 * Save trip to Server Database API (with LocalStorage fallback)
 */
export async function saveTrip(itinerary: Itinerary): Promise<SavedTrip[]> {
  try {
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itinerary }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.trips)) {
        // Sync to local storage as well
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.trips));
        return data.trips;
      }
    }
  } catch (err) {
    console.warn('⚠️ Server DB save failed, syncing to LocalStorage:', err);
  }

  // LocalStorage Fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const trips: SavedTrip[] = raw ? JSON.parse(raw) : [];
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

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTrips));
    return updatedTrips;
  } catch (err) {
    return [];
  }
}

/**
 * Delete saved trip from Server Database API (with LocalStorage fallback)
 */
export async function deleteSavedTrip(id: string): Promise<SavedTrip[]> {
  try {
    const res = await fetch(`/api/trips/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.trips)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.trips));
        return data.trips;
      }
    }
  } catch (err) {
    console.warn('⚠️ Server DB delete failed:', err);
  }

  // LocalStorage Fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const trips: SavedTrip[] = raw ? JSON.parse(raw) : [];
    const updated = trips.filter((t) => t.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    return [];
  }
}
