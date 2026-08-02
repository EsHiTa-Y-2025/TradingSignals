export const PORT = process.env.PORT || 3000;

export const CACHE_TIME = 60 * 1000;

export const USER_AGENT =
  "Mozilla/5.0 (ReductionTape/2.0)";

export const YAHOO = {
  SEARCH: "https://query1.finance.yahoo.com/v1/finance/search",
  CHART: "https://query1.finance.yahoo.com/v8/finance/chart"
};

export const HEADERS = {
  "User-Agent": USER_AGENT
};

export const INTERVAL = "1d";

export const LIVE_INTERVAL = 1000;

export const SCAN_BUFFER = {
  SP: 250,
  BP: 250,
  UPPER: 100,
  LOWER: 100
};
