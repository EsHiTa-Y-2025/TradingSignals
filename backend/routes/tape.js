// routes/tape.js

import express from "express";

import { getHistoricalData } from "../services/yahoo.js";
import { calculateTradePoint } from "../calculations/reduction.js";
import {
    calculateIndicators,
    calculateDistances
} from "../calculations/indicators.js";
import { detectScenario } from "../calculations/scenarios.js";

const router = express.Router();

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

        const high = Math.max(
            ...candles.map(c => c.high)
        );

        const low = Math.min(
            ...candles.map(c => c.low)
        );

        const lastCandle =
            candles[candles.length - 1];

        const reduction =
            calculateTradePoint(high, low);

        const indicators =
            calculateIndicators({

                high,

                low,

                close: lastCandle.close,

                tradePoint:
                    reduction.tradePoint

            });

        const today =
            new Date()
                .toISOString()
                .slice(0, 10);

        const historicalMode =
            end !== today;

        let prediction = null;

        let nextOpen = null;

        // BUG (previous version): this reused `candles[candles.length - 1]`,
        // which is just the last candle already inside the selected range
        // (same as `lastCandle` above) — so nextOpen was really "last day's open",
        // not the open of the day AFTER `end`.
        //
        // Fix: actually fetch the next trading day after `end`. Search a short
        // window forward (not just end+1) to skip past weekends/holidays.
        if (historicalMode) {

            try {

                const nextDayStart = new Date(end + "T00:00:00Z");
                nextDayStart.setUTCDate(nextDayStart.getUTCDate() + 1);
                const nextStart = nextDayStart.toISOString().slice(0, 10);

                const searchWindowEnd = new Date(nextDayStart);
                searchWindowEnd.setUTCDate(searchWindowEnd.getUTCDate() + 7);
                const nextEnd = searchWindowEnd.toISOString().slice(0, 10);

                const nextCandles = await getHistoricalData(
                    symbol,
                    nextStart,
                    nextEnd
                );

                if (nextCandles.length) {

                    nextOpen = nextCandles[0].open;

                    prediction =
                        detectScenario({

                            currentPrice: nextOpen,

                            open: nextOpen,

                            indicators

                        });

                }

            }

            catch {

                nextOpen = null;

                prediction = null;

            }

        }

        res.json({

            success: true,

            symbol,

            start,

            end,

            historicalMode,

            nextOpen,

            candlesUsed:
                candles.length,

            reduction,

            indicators,

            distances:
                calculateDistances(

                    lastCandle.close,

                    indicators

                ),

            prediction

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
