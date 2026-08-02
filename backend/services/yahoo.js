import cache from "../cache/cache.js";
import { YAHOO, HEADERS } from "../config/constants.js";

async function fetchJSON(url) {
  const response = await fetch(url, {
    headers: HEADERS,
  });

  if (!response.ok) {
    throw new Error(`Yahoo request failed (${response.status})`);
  }

  return response.json();
}

// ----------------------------------------------------
// Search Company
// ----------------------------------------------------

export async function searchSymbol(query) {
  const key = `search:${query.toLowerCase()}`;

  const cached = cache.get(key);
  if (cached) return cached;

  const url =
    `${YAHOO.SEARCH}?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;

  const data = await fetchJSON(url);

  const allowed = new Set([
    "EQUITY",
    "ETF",
    "INDEX",
  ]);

  const results = (data.quotes || [])
    .filter(q => allowed.has(q.quoteType))
    .map(q => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      exchange: q.exchDisp || q.exchange || "",
      type: q.quoteType,
    }));

  cache.set(key, results);

  return results;
}

// ----------------------------------------------------
// Historical OHLC
// ----------------------------------------------------

export async function getHistoricalData(
  symbol,
  startDate,
  endDate
) {
  const key = `history:${symbol}:${startDate}:${endDate}`;

  const cached = cache.get(key);
  if (cached) return cached;

  const period1 = Math.floor(
    new Date(startDate + "T00:00:00Z").getTime() / 1000
  );

  const period2 = Math.floor(
    new Date(endDate + "T23:59:59Z").getTime() / 1000
  );

  const url =
    `${YAHOO.CHART}/${encodeURIComponent(symbol)}` +
    `?interval=1d&period1=${period1}&period2=${period2}`;

  const json = await fetchJSON(url);

  if (json.chart.error) {
    throw new Error(json.chart.error.description);
  }

  const result = json.chart.result?.[0];

  if (!result) {
    throw new Error("No historical data returned.");
  }

  const quote = result.indicators.quote[0];

  const timestamps = result.timestamp || [];

  const candles = [];

  for (let i = 0; i < timestamps.length; i++) {
    if (
      quote.high[i] == null ||
      quote.low[i] == null ||
      quote.close[i] == null
    ) {
      continue;
    }

    candles.push({
      date: new Date(
        timestamps[i] * 1000
      ).toISOString().slice(0, 10),

      open: quote.open[i],
      high: quote.high[i],
      low: quote.low[i],
      close: quote.close[i],
      volume: quote.volume[i],
    });
  }

  cache.set(key, candles);

  return candles;
}

// ----------------------------------------------------
// Current Live Price
// ----------------------------------------------------

export async function getLivePrice(symbol) {
  const key = `live:${symbol}`;

  const cached = cache.get(key);

  if (cached) return cached;

  const url =
    `${YAHOO.CHART}/${encodeURIComponent(symbol)}?range=1d&interval=1m`;

  const json = await fetchJSON(url);

  if (json.chart.error) {
    throw new Error(json.chart.error.description);
  }

  const result = json.chart.result?.[0];

  if (!result) {
    throw new Error("No live data returned.");
  }

  const quote = result.indicators.quote[0];

  const last = quote.close.length - 1;

  const data = {
    symbol,

    price: quote.close[last],

    open: quote.open[0],

    high: Math.max(...quote.high.filter(v => v != null)),

    low: Math.min(...quote.low.filter(v => v != null)),

    timestamp: result.timestamp[last],
  };

  cache.set(key, data);

  return data;
}
