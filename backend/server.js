import express from "express";
import cors from "cors";

import { PORT } from "./config/constants.js";

import searchRoutes from "./routes/search.js";
import tapeRoutes from "./routes/tape.js";
import liveRoutes from "./routes/live.js";

const app = express();

// -----------------------------------------------------
// Middleware
// -----------------------------------------------------

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------------
// Health Check
// -----------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "Reduction Tape API",
    version: "2.0",
    status: "Running",
    endpoints: {
      search: "/api/search?q=apple",
      tape:
        "/api/tape?symbol=AAPL&start=2025-01-01&end=2025-03-01",
      live:
        "/api/live?symbol=AAPL&start=2025-01-01&end=2025-03-01",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    serverTime: new Date().toISOString(),
    uptime: process.uptime(),
    status: "Healthy",
  });
});

// -----------------------------------------------------
// API Routes
// -----------------------------------------------------

app.use("/api/search", searchRoutes);

app.use("/api/tape", tapeRoutes);

app.use("/api/live", liveRoutes);

// -----------------------------------------------------
// 404 Handler
// -----------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found.",
  });
});

// -----------------------------------------------------
// Global Error Handler
// -----------------------------------------------------

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// -----------------------------------------------------
// Start Server
// -----------------------------------------------------

app.listen(PORT, () => {
  console.log("");
  console.log("======================================");
  console.log(" Reduction Tape Backend Started");
  console.log("======================================");
  console.log(` Server : http://localhost:${PORT}`);
  console.log(` Health : http://localhost:${PORT}/health`);
  console.log("======================================");
});
