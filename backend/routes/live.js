// routes/live.js

import express from "express";

import { getHistoricalData } from "../services/yahoo.js";
import { buildLiveSnapshot } from "../services/livePrice.js";

const router = express.Router();

// -----------------------------------------------------
// GET /api/live
// -----------------------------------------------------

router.get("/", async (req, res) => {

    try {

        const symbol = (req.query.symbol || "")
            .trim()
            .toUpperCase();

        const start = (req.query.start || "").trim();

        const end = (req.query.end || "").trim();

        if (!symbol) {

            return res.status(400).json({

                success: false,

                error: "Missing symbol."

            });

        }

        if (!start || !end) {

            return res.status(400).json({

                success: false,

                error: "Start and End dates are required."

            });

        }

        const candles = await getHistoricalData(

            symbol,

            start,

            end

        );

        if (!candles.length) {

            return res.status(404).json({

                success: false,

                error: "No historical data found."

            });

        }

        const snapshot = await buildLiveSnapshot(

            symbol,

            candles

        );

        res.json({

            success: true,

            ...snapshot

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

export default router;
