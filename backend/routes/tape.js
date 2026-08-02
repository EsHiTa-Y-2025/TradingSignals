import express from "express";

import { getHistoricalData } from "../services/yahoo.js";
import { calculateTradePoint } from "../calculations/reduction.js";
import { calculateIndicators } from "../calculations/indicators.js";

const router = express.Router();

/*
    GET /api/tape

    Query Parameters

    symbol=AAPL
    start=2025-01-01
    end=2025-03-01
*/

router.get("/", async (req, res) => {
  try {
    const symbol = (req.query.symbol || "").trim().toUpperCase();
    const start = (req.query.start || "").trim();
    const end = (req.query.end || "").trim();

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: "Missing symbol.",
      });
    }

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: "Start date and End date are required.",
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
        error: "No historical data found.",
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
        tradePoint: reduction.tradePoint,
      });

    res.json({
      success: true,

      symbol,

      start,

      end,

      candlesUsed: candles.length,

      calculation: {
        high: reduction.high,
        low: reduction.low,

        spread: reduction.spread,

        digitalRoot:
          reduction.digitalRoot,

        reductionSteps:
          reduction.reductionSteps,

        tradePoint:
          reduction.tradePoint,
      },

      indicators,

      lastClose: lastCandle.close,

      lastTradingDay: lastCandle.date,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }
});

export default router;
