const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // required for API calls

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- Mock Waste Data ---
const wasteTypes = [
  { type: "organic", efficiency: 0.4, byproducts: ["water", "CO2"] },
  { type: "plastic", efficiency: 0.3, byproducts: ["syngas", "char"] },
  { type: "metal", efficiency: 0.1, byproducts: ["slag"] },
  { type: "e-waste", efficiency: 0.25, byproducts: ["rare metals", "toxic residue"] }
];

// --- Basic Routes ---
app.get("/", (req, res) => {
  res.json({ message: "🚀 Mars Recycler Backend API is running!" });
});

app.get("/api/waste-types", (req, res) => res.json(wasteTypes));

app.get("/api/workflow", (req, res) => {
  res.json({
    steps: [
      "Collect waste on Mars base",
      "Sort waste (organic, plastic, metal, e-waste)",
      "Send to recycling module",
      "Convert into energy via plasma/biogas/pyrolysis",
      "Store generated energy for habitat use"
    ]
  });
});

app.post("/api/process", (req, res) => {
  const { type, weight } = req.body;
  const waste = wasteTypes.find(w => w.type === type.toLowerCase());
  if (!waste) return res.status(400).json({ error: "Invalid waste type" });
  res.json({
    type: waste.type,
    input_weight: weight,
    energy_kwh: weight * waste.efficiency,
    byproducts: waste.byproducts
  });
});

// --- NASA APIs ---
// 1. Mars Weather API (InSight)
app.get("/api/mars-weather", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.nasa.gov/insight_weather/?api_key=DEMO_KEY&feedtype=json&ver=1.0"
    );
    const data = await response.json();
    // Extract latest sol data
    const solKeys = data.sol_keys;
    if (!solKeys || solKeys.length === 0) return res.json({ message: "No data available" });
    const latestSol = solKeys[solKeys.length - 1];
    const weather = data[latestSol];
    res.json({
      sol: latestSol,
      date: weather.First_UTC,
      temp: weather.AT ? weather.AT.av : null,
      wind: weather.HWS ? weather.HWS.av : null,
      pressure: weather.PRE ? weather.PRE.av : null
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Mars weather" });
  }
});

// 2. Mars Rover Photos API
app.get("/api/mars-photos", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=DEMO_KEY"
    );
    const data = await response.json();
    // Return first 5 photos
    const photos = data.photos.slice(0, 5).map(p => p.img_src);
    res.json({ photos });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Mars photos" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
