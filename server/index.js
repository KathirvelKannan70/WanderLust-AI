import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateItineraryFromAI, refineItineraryFromAI } from './gemini.js';
import { getAllTrips, saveTripToDb, deleteTripFromDb } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    timestamp: new Date().toISOString()
  });
});

// Generate Itinerary Endpoint
app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { prompt, preferences, testFailureMode } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt string is required.' });
    }

    // Interactive failure simulation for evaluation demo
    if (testFailureMode) {
      if (testFailureMode === 'malformed_json') {
        return res.json({ result: '{"tripTitle": "Paris Trip", "days": [ { "dayNumber": 1, "stops": [' }); // Missing closing brackets
      }
      if (testFailureMode === 'wrong_schema') {
        return res.json({ result: JSON.stringify({ message: "Here is your trip text!", content: "Day 1: Go to Eiffel Tower" }) }); // Wrong shape
      }
      if (testFailureMode === 'empty') {
        return res.json({ result: "" });
      }
      if (testFailureMode === 'server_500') {
        return res.status(500).json({ error: "Simulated 500 Server Internal Error" });
      }
      if (testFailureMode === 'slow_timeout') {
        await new Promise(r => setTimeout(r, 46000)); // Delay for timeout test
      }
    }

    const aiResult = await generateItineraryFromAI(prompt, preferences);

    return res.json({
      result: aiResult.data,
      source: aiResult.source,
    });
  } catch (error) {
    console.error('⚠️ Realtime Gemini Generation Error:', error.message);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Refine Itinerary Endpoint
app.post('/api/refine-itinerary', async (req, res) => {
  try {
    const { currentItinerary, instruction } = req.body;

    if (!currentItinerary || !instruction) {
      return res.status(400).json({ error: 'currentItinerary and instruction are required.' });
    }

    const refinedResult = await refineItineraryFromAI(currentItinerary, instruction);

    return res.json({
      result: refinedResult.data,
      source: refinedResult.source
    });
  } catch (error) {
    console.error('⚠️ Realtime Gemini Refinement Error:', error.message);
    return res.status(500).json({ error: error.message || 'Refinement failed' });
  }
});

// Database API Endpoints: Persistent Server Storage
app.get('/api/trips', (req, res) => {
  try {
    const trips = getAllTrips();
    res.json({ success: true, trips });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trips', (req, res) => {
  try {
    const { itinerary } = req.body;
    if (!itinerary) return res.status(400).json({ error: 'Itinerary is required.' });
    const trips = saveTripToDb(itinerary);
    res.json({ success: true, trips });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/trips/:id', (req, res) => {
  try {
    const { id } = req.params;
    const trips = deleteTripFromDb(id);
    res.json({ success: true, trips });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Server proxy running on http://localhost:${PORT}`);
  console.log(`💾 Server Database API initialized (trips_db.json)`);
  console.log(`🔑 Gemini Key loaded: ${Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') ? 'YES' : 'NO'}`);
});
