import express from "express";

import { getHistoricalData } from "../services/yahoo.js";

import { calculateTradePoint } from "../calculations/reduction.js";
import { calculateIndicators } from "../calculations/indicators.js";
import { detectScenario } from "../calculations/scenarios.js";

const router = express.Router();

/*
=======================================================

GET /api/tape

/api/tape?symbol=AAPL&start=2025-01-01&end=2025-03-01

=======================================================
*/

router.get("/", async (req, res) => {

    try {

        //----------------------------------------
        // Query
        //----------------------------------------

        const symbol = (req.query.symbol || "")
            .trim()
            .toUpperCase();

        const start = (req.query.start || "")
            .trim();

        const end = (req.query.end || "")
            .trim();

        if (!symbol) {

            return res.status(400).json({

                success: false,

                error: "Missing symbol."

            });

        }

        if (!start || !end) {

            return res.status(400).json({

                success: false,

                error: "Start and End dates required."

            });

        }

        //----------------------------------------
        // Selected Range
        //----------------------------------------

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

        //----------------------------------------
        // Reduction Range
        //----------------------------------------

        const high = Math.max(

            ...candles.map(c => c.high)

        );

        const low = Math.min(

            ...candles.map(c => c.low)

        );

        const lastCandle =

            candles[candles.length - 1];

        //----------------------------------------
        // Next Day
        //----------------------------------------

        const nextDay = new Date(end);

        nextDay.setDate(
            nextDay.getDate() + 1
        );

        const nextStart =
            nextDay
            .toISOString()
            .slice(0,10);

        const nextEnd = nextStart;

        let nextOpen = null;

        let historicalMode = false;

        try{

            const nextCandles =
                await getHistoricalData(

                    symbol,

                    nextStart,

                    nextEnd

                );

            if(nextCandles.length){

                nextOpen =
                    nextCandles[0].open;

                historicalMode = true;

            }

        }

        catch{

            historicalMode = false;

        }

        //----------------------------------------
        // Reduction
        //----------------------------------------

        const reduction =
            calculateTradePoint(

                high,

                low

            );

        //----------------------------------------
        // Levels
        //----------------------------------------

        const indicators =
            calculateIndicators({

                high,

                low,

                close:
                    lastCandle.close,

                tradePoint:
                    reduction.tradePoint

            });

        //----------------------------------------
        // Historical Prediction
        //----------------------------------------

        let prediction = null;

        if(historicalMode){

            prediction =
                detectScenario({

                    previousClose:
                        lastCandle.close,

                    open:
                        nextOpen,

                    currentPrice:
                        nextOpen,

                    indicators,

                    tradePoint:
                        reduction.tradePoint

                });

        }

        //----------------------------------------
        // Response
        //----------------------------------------

        res.json({

            success:true,

            historicalMode,

            symbol,

            period:{

                start,

                end

            },

            candlesUsed:
                candles.length,

            reduction:{

                high,

                low,

                spread:
                    reduction.spread,

                digitalRoot:
                    reduction.digitalRoot,

                tradePoint:
                    reduction.tradePoint,

                reductionSteps:
                    reduction.reductionSteps

            },

            indicators,

            previousClose:
                lastCandle.close,

            nextOpen,

            prediction

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            error:error.message

        });

    }

});

export default router;
