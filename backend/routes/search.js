import express from "express";
import { searchSymbol } from "../services/yahoo.js";

const router = express.Router();

/*
    GET /api/search?q=apple
*/

router.get("/", async (req, res) => {
  try {
    const query = (req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Missing search query.",
      });
    }

    const results = await searchSymbol(query);

    res.json({
      success: true,
      count: results.length,
      results,
    });

  } catch (error) {
    console.error("Search Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
