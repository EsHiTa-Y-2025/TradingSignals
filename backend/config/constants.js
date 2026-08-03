// config/constants.js

export const PORT =
    process.env.PORT || 3000;

// ----------------------------------------------------
// Yahoo Finance
// ----------------------------------------------------

export const YAHOO = {

    SEARCH:
        "https://query1.finance.yahoo.com/v1/finance/search",

    CHART:
        "https://query1.finance.yahoo.com/v8/finance/chart"

};

// ----------------------------------------------------
// Headers
// ----------------------------------------------------

export const HEADERS = {

    "User-Agent":
        "Mozilla/5.0",

    Accept:
        "application/json"

};

// ----------------------------------------------------
// Cache
// ----------------------------------------------------

export const CACHE_TIME = {

    SEARCH:
        1000 * 60 * 60,

    HISTORY:
        1000 * 60 * 30,

    LIVE:
        1000 * 2

};

// ----------------------------------------------------
// Market Engine Buffers
// ----------------------------------------------------

export const SCAN_BUFFER = {

    UPPER: 100,

    LOWER: 100,

    SP: 100,

    BP: 100,

    CLOSE: 100,

    BREAKOUT: 200,

    REVERSAL: 100

};

// ----------------------------------------------------
// Market States
// ----------------------------------------------------

export const MARKET_STATE = {

    MOVING: "MOVING",

    WATCHING: "WATCHING",

    BREAKOUT: "BREAKOUT",

    REVERSAL: "REVERSAL",

    WAIT: "WAIT"

};

// ----------------------------------------------------
// Directions
// ----------------------------------------------------

export const MARKET_DIRECTION = {

    UP: "UP",

    DOWN: "DOWN",

    NEUTRAL: "NEUTRAL"

};

// ----------------------------------------------------
// Signals
// ----------------------------------------------------

export const SIGNAL = {

    BUY: "BUY",

    SELL: "SELL",

    WAIT: "WAIT"

};
