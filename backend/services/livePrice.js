// services/livePrice.js

import { getLivePrice } from "./yahoo.js";

import { calculateTradePoint } from "../calculations/reduction.js";

import {
    calculateIndicators,
    calculateDistances
} from "../calculations/indicators.js";

import { detectScenario } from "../calculations/scenarios.js";

export async function buildLiveSnapshot(

    symbol,

    candles

) {

    if (!candles || !candles.length) {

        throw new Error(

            "No historical candles supplied."

        );

    }

    //------------------------------------------------
    // Historical Levels
    //------------------------------------------------

    const high = Math.max(

        ...candles.map(c => c.high)

    );

    const low = Math.min(

        ...candles.map(c => c.low)

    );

    const lastCandle =

        candles[candles.length - 1];

    //------------------------------------------------
    // Current Market
    //------------------------------------------------

    const live = await getLivePrice(

        symbol

    );

    //------------------------------------------------
    // Reduction
    //------------------------------------------------

    const reduction =

        calculateTradePoint(

            high,

            low

        );

    //------------------------------------------------
    // Indicators
    //------------------------------------------------

    const indicators =

        calculateIndicators({

            high,

            low,

            close: lastCandle.close,

            tradePoint:
                reduction.tradePoint

        });

    //------------------------------------------------
    // Market Engine
    //------------------------------------------------

    const engine =

        detectScenario({

            currentPrice:
                live.price,

            open:
                live.open,

            indicators

        });

    //------------------------------------------------
    // Distances
    //------------------------------------------------

    const distances =

        calculateDistances(

            live.price,

            indicators

        );

    //------------------------------------------------
    // Response
    //------------------------------------------------

    return {

        symbol,

        timestamp:

            new Date(

                live.timestamp * 1000

            ).toISOString(),

        live: {

            price:
                live.price,

            open:
                live.open,

            high:
                live.high,

            low:
                live.low

        },

        reduction: {

            high:
                reduction.high,

            low:
                reduction.low,

            spread:
                reduction.spread,

            digitalRoot:
                reduction.digitalRoot,

            tradePoint:
                reduction.tradePoint,

            reductionSteps:
                reduction.reductionSteps

        },

        indicators,

        distances,

        engine

    };

}
