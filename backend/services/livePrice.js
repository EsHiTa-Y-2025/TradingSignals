import { getLivePrice } from "./yahoo.js";

import { calculateTradePoint } from "../calculations/reduction.js";

import { calculateIndicators } from "../calculations/indicators.js";

import { detectScenario } from "../calculations/scenarios.js";

export async function buildLiveSnapshot(

    symbol,

    candles

) {

    if (!candles || candles.length === 0) {

        throw new Error(
            "No historical candles supplied."
        );

    }

    //--------------------------------------------------
    // Historical Levels
    //--------------------------------------------------

    const high = Math.max(

        ...candles.map(c => c.high)

    );

    const low = Math.min(

        ...candles.map(c => c.low)

    );

    const lastCandle =

        candles[candles.length - 1];

    //--------------------------------------------------
    // Previous Close
    //--------------------------------------------------

    const previousClose =
        lastCandle.close;

    //--------------------------------------------------
    // Live Market
    //--------------------------------------------------

    const live =
        await getLivePrice(symbol);

    //--------------------------------------------------
    // Reduction
    //--------------------------------------------------

    const reduction =
        calculateTradePoint(

            high,

            low

        );

    //--------------------------------------------------
    // Indicators
    //--------------------------------------------------

    const indicators =
        calculateIndicators({

            high,

            low,

            close: previousClose,

            tradePoint:
                reduction.tradePoint

        });

    //--------------------------------------------------
    // Scenario Engine
    //--------------------------------------------------

    const market =
        detectScenario({

            previousClose,

            open: live.open,

            currentPrice:
                live.price,

            indicators,

            tradePoint:
                reduction.tradePoint

        });

    //--------------------------------------------------
    // Response
    //--------------------------------------------------

    return {

        success: true,

        symbol,

        timestamp: new Date(

            live.timestamp * 1000

        ).toISOString(),

        historical: {

            high,

            low,

            previousClose,

            candlesUsed:
                candles.length

        },

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

        engine: {

            direction:
                market.direction,

            nearClose:
                market.nearClose,

            state:
                market.state,

            signal:
                market.signal,

            target:
                market.target,

            targetPrice:
                market.targetPrice,

            nextTarget:
                market.nextTarget,

            watchZone:
                market.watchZone,

            breakoutBuffer:
                market.breakoutBuffer,

            reversalBuffer:
                market.reversalBuffer,

            reason:
                market.reason

        },

        distances:
            market.distances

    };

}
