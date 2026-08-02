import { round } from "./reduction.js";

/*
    Upper TDP = Close + Trade Point
    Lower TDP = Close - Trade Point

    SP = Low + Trade Point
    BP = High - Trade Point
*/

export function calculateIndicators({
  high,
  low,
  close,
  tradePoint,
}) {
  const upperTDP = round(close + tradePoint);
  const lowerTDP = round(close - tradePoint);

  const SP = round(low + tradePoint);
  const BP = round(high - tradePoint);

  return {
    close: round(close),

    upperTDP,
    lowerTDP,

    SP,
    BP,
  };
}

export function calculateDistances(currentPrice, indicators) {
  return {
    toUpperTDP: round(currentPrice - indicators.upperTDP),

    toLowerTDP: round(currentPrice - indicators.lowerTDP),

    toSP: round(currentPrice - indicators.SP),

    toBP: round(currentPrice - indicators.BP),
  };
}

export function buildCalculation({
  high,
  low,
  close,
  tradePoint,
}) {
  const indicators = calculateIndicators({
    high,
    low,
    close,
    tradePoint,
  });

  return {
    high: round(high),
    low: round(low),
    close: round(close),

    tradePoint: round(tradePoint),

    upperTDP: indicators.upperTDP,
    lowerTDP: indicators.lowerTDP,

    SP: indicators.SP,
    BP: indicators.BP,
  };
}
