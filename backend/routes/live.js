import express from "express";

import { getHistoricalData } from "../services/yahoo.js";
import { buildLiveSnapshot } from "../services/livePrice.js";

const router = express.Router();

/*
=====================================================

GET /api/live

Example

/api/live?symbol=AAPL&start=2025-01-01&end=2025-03-01

=====================================================
*/

router.get("/", async (req, res) => {

    try {

        //--------------------------------------------------
        // Query Parameters
        //--------------------------------------------------

        const symbol = (req.query.symbol || "")
            .trim()
            .toUpperCase();

        const start = (req.query.start || "")
            .trim();

        const end = (req.query.end || "")
            .trim();

        //--------------------------------------------------
        // Validation
        //--------------------------------------------------

        if (!symbol) {

            return res.status(400).json({

                success: false,

                error: "Missing symbol."

            });

        }

        if (!start || !end) {

            return res.status(400).json({

                success: false,

                error: "Missing date range."

            });

        }

        //--------------------------------------------------
        // Historical Data
        //--------------------------------------------------

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

        //--------------------------------------------------
        // Live Snapshot
        //--------------------------------------------------

        const snapshot = await buildLiveSnapshot(

            symbol,

            candles

        );

        //--------------------------------------------------
        // Response
        //--------------------------------------------------

        return res.json(snapshot);

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            error: error.message

        });

    }

});

export default router;
