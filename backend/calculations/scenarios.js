import { round } from "./reduction.js";

/*
==================================================

Reduction Tape Scanner
Scenario Engine V3

==================================================
*/

function distance(price, level) {

    return round(price - level);

}

function isNear(price, level, buffer) {

    return Math.abs(price - level) <= buffer;

}

export function detectScenario({

    open,

    currentPrice,

    indicators,

    tradePoint,

    previousClose

}) {

    const {

        upperTDP,

        lowerTDP,

        SP,

        BP,

        close

    } = indicators;

    //--------------------------------------------------
    // Dynamic Watch Zone
    //--------------------------------------------------

    const WATCH_ZONE = Math.max(

        20,

        round(tradePoint * 2)

    );

    //--------------------------------------------------
    // Market State
    //--------------------------------------------------

    let scenario = "";

    let state = "";

    let signal = "WAIT";

    let reason = "";

    let target = "";

    //--------------------------------------------------
    // CASE 1
    // Open near Previous Close
    //--------------------------------------------------

    if (

        Math.abs(open - previousClose) <= 100

    ) {

        scenario = "CASE_1";

        state = "MOVING_FROM_CLOSE";

        if (open >= previousClose) {

            target = "Upper TDP";

            if (

                isNear(

                    currentPrice,

                    upperTDP,

                    WATCH_ZONE

                )

            ) {

                state = "WATCHING_RESISTANCE";

                signal = "SELL";

                reason =

                    "Price entered Upper TDP watch zone.";

            }

            else if (

                currentPrice > upperTDP

            ) {

                state = "BREAKOUT";

                target = "SP";

                signal = "BUY";

                reason =

                    "Upper TDP breakout confirmed.";

            }

        }

        else {

            target = "Lower TDP";

            if (

                isNear(

                    currentPrice,

                    lowerTDP,

                    WATCH_ZONE

                )

            ) {

                state = "WATCHING_SUPPORT";

                signal = "BUY";

                reason =

                    "Price entered Lower TDP watch zone.";

            }

            else if (

                currentPrice < lowerTDP

            ) {

                state = "BREAKDOWN";

                target = "BP";

                signal = "SELL";

                reason =

                    "Lower TDP breakdown confirmed.";

            }

        }

    }

    //--------------------------------------------------
    // CASE 2
    // Open Inside Range
    //--------------------------------------------------

    else if (

        open < upperTDP &&

        open > lowerTDP

    ) {

        scenario = "CASE_2";

        state = "RANGE";

        const dUpper =

            Math.abs(

                currentPrice -

                upperTDP

            );

        const dLower =

            Math.abs(

                currentPrice -

                lowerTDP

            );

        if (

            dUpper < dLower

        ) {

            target = "Upper TDP";

            if (

                dUpper <= WATCH_ZONE

            ) {

                signal = "SELL";

                state =

                    "WATCHING_RESISTANCE";

                reason =

                    "Approaching Upper TDP.";

            }

        }

        else {

            target = "Lower TDP";

            if (

                dLower <= WATCH_ZONE

            ) {

                signal = "BUY";

                state =

                    "WATCHING_SUPPORT";

                reason =

                    "Approaching Lower TDP.";

            }

        }

    }

    //--------------------------------------------------
    // CASE 3
    // Gap Outside Range
    //--------------------------------------------------

    else {

        scenario = "CASE_3";

        if (

            open > upperTDP

        ) {

            state =

                "ABOVE_RANGE";

            target =

                "Upper TDP";

            if (

                isNear(

                    currentPrice,

                    upperTDP,

                    WATCH_ZONE

                )

            ) {

                signal =

                    "BUY";

                state =

                    "PULLBACK";

                reason =

                    "Pullback to Upper TDP.";

            }

        }

        else {

            state =

                "BELOW_RANGE";

            target =

                "Lower TDP";

            if (

                isNear(

                    currentPrice,

                    lowerTDP,

                    WATCH_ZONE

                )

            ) {

                signal =

                    "SELL";

                state =

                    "PULLBACK";

                reason =

                    "Pullback to Lower TDP.";

            }

        }

    }

    //--------------------------------------------------
    // Distances
    //--------------------------------------------------

    return {

        scenario,

        state,

        signal,

        target,

        watchZone:

            WATCH_ZONE,

        reason,

        distances: {

            upperTDP:

                distance(

                    currentPrice,

                    upperTDP

                ),

            lowerTDP:

                distance(

                    currentPrice,

                    lowerTDP

                ),

            SP:

                distance(

                    currentPrice,

                    SP

                ),

            BP:

                distance(

                    currentPrice,

                    BP

                ),

            close:

                distance(

                    currentPrice,

                    close

                )

        }

    };

}
