// routes/search.js

import express from "express";
import { searchSymbol } from "../services/yahoo.js";

const router = express.Router();

// ----------------------------------------------------
// GET /api/search?q=apple
// ----------------------------------------------------

router.get("/", async (req, res) => {

    try {

        const query = (req.query.q || "").trim();

        if (!query) {

            return res.status(400).json({

                success: false,

                error: "Missing search query."

            });

        }

        const results = await searchSymbol(query);

        res.json({

            success: true,

            query,

            count: results.length,

            results

        });

    }

    catch (err) {

        console.error("Search Error:", err);

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

export default router;
