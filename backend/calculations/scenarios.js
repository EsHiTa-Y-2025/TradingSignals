import { SCAN_BUFFER } from "../config/constants.js";
import { round } from "./reduction.js";

function within(price, target, buffer) {
  return Math.abs(price - target) <= buffer;
}

function distance(price, target) {
  return round(price - target);
}

export function detectScenario({
  currentPrice,
  open,
  indicators,
}) {
  const {
    upperTDP,
    lowerTDP,
    SP,
    BP,
    close,
  } = indicators;

  let scenario = "WAIT";
  let signal = "NONE";
  let reason = "";

  // -------------------------
  // CASE 1
  // Open between Upper & Lower
  // -------------------------

  if (open <= upperTDP && open >= lowerTDP) {

    scenario = "CASE_1";

    if (within(currentPrice, SP, SCAN_BUFFER.SP)) {
      signal = "SELL";
      reason = "Price reached SP zone.";
    }

    else if (within(currentPrice, lowerTDP, SCAN_BUFFER.LOWER)) {
      signal = "BUY";
      reason = "Price reached Lower TDP.";
    }
  }

  // -------------------------
  // CASE 2
  // Open near Close or TDP
  // -------------------------

  else if (
    within(open, close, 100) ||
    within(open, upperTDP, 100) ||
    within(open, lowerTDP, 100)
  ) {

    scenario = "CASE_2";

    if (within(currentPrice, upperTDP, SCAN_BUFFER.UPPER)) {
      signal = "SELL";
      reason = "Upper TDP reversal.";
    }

    else if (within(currentPrice, lowerTDP, SCAN_BUFFER.LOWER)) {
      signal = "BUY";
      reason = "Lower TDP reversal.";
    }
  }

  // -------------------------
  // CASE 3
  // Open outside TDP range
  // -------------------------

  else if (open > upperTDP) {

    scenario = "CASE_3";

    if (within(currentPrice, upperTDP, SCAN_BUFFER.UPPER)) {
      signal = "BUY";
      reason = "Pullback to Upper TDP.";
    }

  } else if (open < lowerTDP) {

    scenario = "CASE_3";

    if (within(currentPrice, lowerTDP, SCAN_BUFFER.LOWER)) {
      signal = "SELL";
      reason = "Pullback to Lower TDP.";
    }
  }

  return {
    scenario,
    signal,
    reason,

    distances: {
      upperTDP: distance(currentPrice, upperTDP),
      lowerTDP: distance(currentPrice, lowerTDP),
      SP: distance(currentPrice, SP),
      BP: distance(currentPrice, BP),
      close: distance(currentPrice, close),
    },
  };
}
