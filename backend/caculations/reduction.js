export function round(value, digits = 2) {
  return Number(Number(value).toFixed(digits));
}

export function digitalRoot(number) {
  let value = Math.round(Math.abs(number));
  const steps = [];

  if (value === 0) {
    return {
      root: 9,
      steps: [],
      wasZero: true,
    };
  }

  while (value >= 10) {
    const digits = String(value).split("").map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);

    steps.push({
      digits,
      sum,
    });

    value = sum;
  }

  return {
    root: value,
    steps,
    wasZero: false,
  };
}

export function calculateSpread(high, low) {
  return round(high - low);
}

export function calculateTradePoint(high, low) {
  const spread = calculateSpread(high, low);

  const {
    root,
    steps,
    wasZero,
  } = digitalRoot(spread);

  return {
    high: round(high),
    low: round(low),

    spread,

    digitalRoot: root,

    reductionSteps: steps,

    tradePoint: round(spread / root),

    rootWasZero: wasZero,
  };
}
