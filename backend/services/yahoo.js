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

// ============================================
// Common Aliases
// ============================================

const ALIASES = {

    "sensex": "^BSESN",
    "bse": "^BSESN",
    "bse sensex": "^BSESN",

    "nifty": "^NSEI",
    "nifty50": "^NSEI",
    "nifty 50": "^NSEI",

    "bank nifty": "^NSEBANK",
    "nifty bank": "^NSEBANK",
    "banknifty": "^NSEBANK",

    "dow": "^DJI",
    "dow jones": "^DJI",

    "nasdaq": "^IXIC",

    "s&p500": "^GSPC",
    "s&p 500": "^GSPC",
    "sp500": "^GSPC",

    "ftse": "^FTSE",

    "nikkei": "^N225",

    "hang seng": "^HSI",

    "dax": "^GDAXI"

};

function scoreResult(result, query){

    const q = query.toLowerCase();

    const symbol =
        result.symbol.toLowerCase();

    const name =
        result.name.toLowerCase();

    let score = 0;

    if(symbol === q)
        score += 1000;

    if(name === q)
        score += 900;

    if(symbol.startsWith(q))
        score += 700;

    if(name.startsWith(q))
        score += 600;

    if(symbol.includes(q))
        score += 400;

    if(name.includes(q))
        score += 300;

    if(result.type === "INDEX")
        score += 30;

    return score;

}

// ============================================
// SEARCH
// ============================================

export async function searchSymbol(query){

    query = query.trim();

    if(!query)
        return [];

    const key =
        `search:${query.toLowerCase()}`;

    const cached =
        cache.get(key);

    if(cached)
        return cached;

    // ----------------------------
    // Alias Search
    // ----------------------------

    const alias =
        ALIASES[query.toLowerCase()];

    if(alias){

        const url =
            `${YAHOO.SEARCH}?q=${encodeURIComponent(alias)}&quotesCount=5&newsCount=0`;

        const data =
            await fetchJSON(url);

        const quote =
            data.quotes?.[0];

        if(quote){

            const results=[{

                symbol:quote.symbol,

                name:
                    quote.shortname ||
                    quote.longname ||
                    quote.symbol,

                exchange:
                    quote.exchDisp ||
                    quote.exchange ||
                    "",

                type:
                    quote.quoteType

            }];

            cache.set(
                key,
                results
            );

            return results;

        }

    }

    // ----------------------------
    // Yahoo Search
    // ----------------------------

    const url =
        `${YAHOO.SEARCH}?q=${encodeURIComponent(query)}&quotesCount=20&newsCount=0`;

    const data =
        await fetchJSON(url);

    const allowed =
        new Set([
            "EQUITY",
            "ETF",
            "INDEX"
        ]);

    const results =
        (data.quotes || [])

        .filter(q =>
            allowed.has(q.quoteType)
        )

        .map(q=>({

            symbol:q.symbol,

            name:
                q.shortname ||
                q.longname ||
                q.symbol,

            exchange:
                q.exchDisp ||
                q.exchange ||
                "",

            type:
                q.quoteType

        }))

        .sort(

            (a,b)=>

                scoreResult(
                    b,
                    query
                )-

                scoreResult(
                    a,
                    query
                )

        )

        .slice(0,10);

    cache.set(
        key,
        results
    );

    return results;

}


// ============================================
// HISTORICAL OHLC
// (Replace your existing getHistoricalData())
// ============================================

export async function getHistoricalData(
    symbol,
    startDate,
    endDate
){

    symbol = symbol.trim().toUpperCase();

    const key =
        `history:${symbol}:${startDate}:${endDate}`;

    const cached =
        cache.get(key);

    if(cached)
        return cached;

    const period1 = Math.floor(

        new Date(
            startDate + "T00:00:00Z"
        ).getTime() / 1000

    );

    const period2 = Math.floor(

        new Date(
            endDate + "T23:59:59Z"
        ).getTime() / 1000

    );

    const url =

        `${YAHOO.CHART}/${encodeURIComponent(symbol)}` +

        `?period1=${period1}` +

        `&period2=${period2}` +

        `&interval=1d` +

        `&includePrePost=false`;

    const json =
        await fetchJSON(url);

    if(json.chart.error){

        throw new Error(
            json.chart.error.description
        );

    }

    const result =
        json.chart.result?.[0];

    if(!result){

        throw new Error(
            "No historical data returned."
        );

    }

    const quote =
        result.indicators.quote[0];

    const timestamps =
        result.timestamp || [];

    const candles = [];

    for(let i=0;i<timestamps.length;i++){

        if(

            quote.open[i]==null ||

            quote.high[i]==null ||

            quote.low[i]==null ||

            quote.close[i]==null

        ){

            continue;

        }

        candles.push({

            date:new Date(

                timestamps[i]*1000

            ).toISOString().slice(0,10),

            open:Number(
                quote.open[i]
            ),

            high:Number(
                quote.high[i]
            ),

            low:Number(
                quote.low[i]
            ),

            close:Number(
                quote.close[i]
            ),

            volume:Number(
                quote.volume[i] || 0
            )

        });

    }

    candles.sort(

        (a,b)=>

            new Date(a.date)-

            new Date(b.date)

    );

    cache.set(
        key,
        candles
    );

    return candles;

}

// ============================================
// LIVE PRICE
// (Replace your existing getLivePrice())
// ============================================

export async function getLivePrice(symbol){

    symbol = symbol.trim().toUpperCase();

    const key =
        `live:${symbol}`;

    const cached =
        cache.get(key);

    if(cached)
        return cached;

    const url =

        `${YAHOO.CHART}/${encodeURIComponent(symbol)}` +

        `?range=1d&interval=1m`;

    const json =
        await fetchJSON(url);

    if(json.chart.error){

        throw new Error(
            json.chart.error.description
        );

    }

    const result =
        json.chart.result?.[0];

    if(!result){

        throw new Error(
            "No live price available."
        );

    }

    const quote =
        result.indicators.quote[0];

    const closes =
        quote.close.filter(v=>v!=null);

    const highs =
        quote.high.filter(v=>v!=null);

    const lows =
        quote.low.filter(v=>v!=null);

    const opens =
        quote.open.filter(v=>v!=null);

    const lastPrice =
        closes[closes.length-1];

    const data={

        symbol,

        price:lastPrice,

        open:opens[0],

        high:Math.max(...highs),

        low:Math.min(...lows),

        timestamp:

            result.timestamp[
                result.timestamp.length-1
            ]

    };

    cache.set(
        key,
        data
    );

    return data;

}
