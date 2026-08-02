import { getLivePrice } from "./yahoo.js";
import { calculateTradePoint } from "../calculations/reduction.js";
import { calculateIndicators } from "../calculations/indicators.js";
import { detectScenario } from "../calculations/scenarios.js";

export async function buildLiveSnapshot(symbol, candles) {
  if (!candles || candles.length === 0) {
    throw new Error("No historical candles supplied.");
  }

  // Highest high in selected date range
  const high = Math.max(...candles.map(c => c.high));

  // Lowest low in selected date range
  const low = Math.min(...candles.map(c => c.low));

  // Last candle in selected date range
  const lastCandle = candles[candles.length - 1];

  // Current market price
  const live = await getLivePrice(symbol);

  // Reduction calculations
  const reduction = calculateTradePoint(high, low);

  // Indicators
  const indicators = calculateIndicators({
    high,
    low,
    close: lastCandle.close,
    tradePoint: reduction.tradePoint,
  });

  // Scenario Engine
  const scenario = detectScenario({
    currentPrice: live.price,
    open: live.open,
    indicators,
  });

  return {
    symbol,

    timestamp: new Date(
      live.timestamp * 1000
    ).toISOString(),

    live: {
      price: live.price,
      open: live.open,
      high: live.high,
      low: live.low,
    },

    reduction: {
      high: reduction.high,
      low: reduction.low,
      spread: reduction.spread,
      digitalRoot: reduction.digitalRoot,
      tradePoint: reduction.tradePoint,
      reductionSteps: reduction.reductionSteps,
    },

    indicators,

    monitor: {
      scenario: scenario.scenario,
      signal: scenario.signal,
      reason: scenario.reason,
      distances: scenario.distances,
    },
  };
}
