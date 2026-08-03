// services/yahoo.js

import cache from "../cache/cache.js";
import { YAHOO, HEADERS } from "../config/constants.js";

async function fetchJSON(url) {

    const response = await fetch(url, {

        headers: HEADERS

    });

    if (!response.ok) {

        throw new Error(

            `Yahoo request failed (${response.status})`

        );

    }

    return response.json();

}

// ----------------------------------------------------
// SEARCH SYMBOLS
// ----------------------------------------------------

export async function searchSymbol(query) {

    const aliases = {

        nifty: "^NSEI",
        banknifty: "^NSEBANK",
        sensex: "^BSESN",
        bitcoin: "BTC-USD",
        btc: "BTC-USD",
        ethereum: "ETH-USD",
        eth: "ETH-USD",
        gold: "GC=F",
        silver: "SI=F",
        crude: "CL=F",
        oil: "CL=F",
        usd: "DX-Y.NYB"

    };

    const q = query.trim().toLowerCase();

    const key = `search:${q}`;

    const cached = cache.get(key);

    if (cached)

        return cached;

    let finalQuery = query;

    if (aliases[q])

        finalQuery = aliases[q];

    const url =

        `${YAHOO.SEARCH}?q=${encodeURIComponent(finalQuery)}&quotesCount=20&newsCount=0`;

    const json = await fetchJSON(url);

    const allowed = new Set([

        "EQUITY",

        "ETF",

        "INDEX",

        "CRYPTOCURRENCY",

        "CURRENCY",

        "MUTUALFUND"

    ]);

    const results = [];

    (json.quotes || []).forEach(item => {

        if (!allowed.has(item.quoteType))

            return;

        results.push({

            symbol: item.symbol,

            name:

                item.shortname ||

                item.longname ||

                item.symbol,

            exchange:

                item.exchDisp ||

                item.exchange ||

                "",

            type:

                item.quoteType

        });

    });

    cache.set(key, results);

    return results;

}

// ----------------------------------------------------
// HISTORICAL DATA
// ----------------------------------------------------

export async function getHistoricalData(

    symbol,

    start,

    end

) {

    const key =

        `history:${symbol}:${start}:${end}`;

    const cached = cache.get(key);

    if (cached)

        return cached;

    const period1 = Math.floor(

        new Date(start + "T00:00:00Z")

            .getTime() / 1000

    );

    const period2 = Math.floor(

        new Date(end + "T23:59:59Z")

            .getTime() / 1000

    );

    const url =

        `${YAHOO.CHART}/${encodeURIComponent(symbol)}` +

        `?period1=${period1}` +

        `&period2=${period2}` +

        `&interval=1d`;

    const json = await fetchJSON(url);

    if (json.chart.error)

        throw new Error(

            json.chart.error.description

        );

    const result =

        json.chart.result?.[0];

    if (!result)

        throw new Error(

            "No historical data."

        );

    const quote =

        result.indicators.quote[0];

    const timestamps =

        result.timestamp || [];

    const candles = [];

    for (

        let i = 0;

        i < timestamps.length;

        i++

    ) {

        if (

            quote.high[i] == null ||

            quote.low[i] == null ||

            quote.close[i] == null

        )

            continue;

        candles.push({

            date:

                new Date(

                    timestamps[i] * 1000

                )

                .toISOString()

                .slice(0, 10),

            open: quote.open[i],

            high: quote.high[i],

            low: quote.low[i],

            close: quote.close[i],

            volume: quote.volume[i]

        });

    }

    cache.set(

        key,

        candles

    );

    return candles;

}

// ----------------------------------------------------
// LIVE PRICE
// ----------------------------------------------------

export async function getLivePrice(symbol) {

    const key =

        `live:${symbol}`;

    const cached = cache.get(key);

    if (cached)

        return cached;

    const url =

        `${YAHOO.CHART}/${encodeURIComponent(symbol)}?range=1d&interval=1m`;

    const json = await fetchJSON(url);

    if (json.chart.error)

        throw new Error(

            json.chart.error.description

        );

    const result =

        json.chart.result?.[0];

    if (!result)

        throw new Error(

            "No live data."

        );

    const quote =

        result.indicators.quote[0];

    const last =

        quote.close.length - 1;

    const data = {

        symbol,

        price:

            quote.close[last],

        open:

            quote.open[0],

        high:

            Math.max(

                ...quote.high.filter(

                    x => x != null

                )

            ),

        low:

            Math.min(

                ...quote.low.filter(

                    x => x != null

                )

            ),

        timestamp:

            result.timestamp[last]

    };

    cache.set(

        key,

        data

    );

    return data;

}
