// calculations/indicators.js

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

    tradePoint

}) {

    const upperTDP = round(

        close + tradePoint

    );

    const lowerTDP = round(

        close - tradePoint

    );

    const SP = round(

        low + tradePoint

    );

    const BP = round(

        high - tradePoint

    );

    return {

        close: round(close),

        upperTDP,

        lowerTDP,

        SP,

        BP

    };

}

// ----------------------------------------------------
// Distances from Current Price
// ----------------------------------------------------

export function calculateDistances(

    currentPrice,

    indicators

) {

    return {

        upperTDP: round(

            indicators.upperTDP -

            currentPrice

        ),

        SP: round(

            indicators.SP -

            currentPrice

        ),

        close: round(

            indicators.close -

            currentPrice

        ),

        BP: round(

            indicators.BP -

            currentPrice

        ),

        lowerTDP: round(

            indicators.lowerTDP -

            currentPrice

        )

    };

}

// ----------------------------------------------------
// Full Calculation Object
// ----------------------------------------------------

export function buildCalculation({

    high,

    low,

    close,

    tradePoint

}) {

    const indicators =

        calculateIndicators({

            high,

            low,

            close,

            tradePoint

        });

    return {

        high: round(high),

        low: round(low),

        close: round(close),

        tradePoint: round(

            tradePoint

        ),

        upperTDP:

            indicators.upperTDP,

        lowerTDP:

            indicators.lowerTDP,

        SP:

            indicators.SP,

        BP:

            indicators.BP

    };

}
