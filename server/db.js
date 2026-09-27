import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, 'trips_db.json');

// Initialize Database File if it doesn't exist
function initDb() {
  if (!fs.existsSync(DB_FILE_PATH)) {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

initDb();

export function getAllTrips() {
  try {
    initDb();
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('⚠️ Database Read Error:', err.message);
    return [];
  }
}

export function saveTripToDb(itinerary) {
  try {
    const trips = getAllTrips();
    const existingIndex = trips.findIndex((t) => t.itinerary.tripTitle === itinerary.tripTitle);

    const savedTripRecord = {
      id: existingIndex >= 0 ? trips[existingIndex].id : `db-trip-${Date.now()}`,
      savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      itinerary: itinerary
    };

    let updated = [];
    if (existingIndex >= 0) {
      updated = [...trips];
      updated[existingIndex] = savedTripRecord;
    } else {
      updated = [savedTripRecord, ...trips];
    }

    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    console.log(`💾 Saved trip "${itinerary.tripTitle}" to Server Database.`);
    return updated;
  } catch (err) {
    console.error('⚠️ Database Save Error:', err.message);
    throw err;
  }
}

export function deleteTripFromDb(id) {
  try {
    const trips = getAllTrips();
    const updated = trips.filter((t) => t.id !== id);
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    console.log(`🗑️ Deleted trip #${id} from Server Database.`);
    return updated;
  } catch (err) {
    console.error('⚠️ Database Delete Error:', err.message);
    throw err;
  }
}
