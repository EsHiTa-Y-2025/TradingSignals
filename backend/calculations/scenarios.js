// calculations/scenarios.js

import { SCAN_BUFFER } from "../config/constants.js";
import { round } from "./reduction.js";

function within(price, target, buffer) {

    return Math.abs(price - target) <= buffer;

}

function distance(price, target) {

    return round(target - price);

}

export function detectScenario({

    currentPrice,

    open,

    indicators

}) {

    const {

        upperTDP,

        lowerTDP,

        SP,

        BP,

        close

    } = indicators;

    let direction = "NEUTRAL";

    let state = "WAIT";

    let signal = "WAIT";

    let reason = "Waiting for confirmation.";

    let target = "Close";

    let nextTarget = "-";

    let watchZone = "±100";

    let breakoutBuffer = "200";

    let reversalBuffer = "100";

    //--------------------------------------------------
    // Determine Market Direction
    //--------------------------------------------------

    if (open > close) {

        direction = "UP";

    }

    else if (open < close) {

        direction = "DOWN";

    }

    //--------------------------------------------------
    // UP TREND
    //--------------------------------------------------

    if (direction === "UP") {

        if (currentPrice < upperTDP) {

            state = "MOVING";

            target = "Upper TDP";

            nextTarget = "SP";

        }

        else if (

            within(

                currentPrice,

                upperTDP,

                SCAN_BUFFER.UPPER

            )

        ) {

            state = "WATCHING";

            target = "Upper TDP";

            nextTarget = "SP";

            signal = "WAIT";

            reason = "Watching reaction near Upper TDP.";

        }

        else if (currentPrice > upperTDP + 200) {

            state = "BREAKOUT";

            target = "SP";

            nextTarget = "BP";

            signal = "BUY";

            reason = "Confirmed breakout above Upper TDP.";

        }

    }

    //--------------------------------------------------
    // DOWN TREND
    //--------------------------------------------------

    else if (direction === "DOWN") {

        if (currentPrice > lowerTDP) {

            state = "MOVING";

            target = "Lower TDP";

            nextTarget = "BP";

        }

        else if (

            within(

                currentPrice,

                lowerTDP,

                SCAN_BUFFER.LOWER

            )

        ) {

            state = "WATCHING";

            target = "Lower TDP";

            nextTarget = "BP";

            signal = "WAIT";

            reason = "Watching reaction near Lower TDP.";

        }

        else if (currentPrice < lowerTDP - 200) {

            state = "BREAKOUT";

            target = "BP";

            nextTarget = "SP";

            signal = "SELL";

            reason = "Confirmed breakout below Lower TDP.";

        }

    }

    //--------------------------------------------------
    // Reversal Detection
    //--------------------------------------------------

    if (

        within(

            currentPrice,

            close,

            100

        )

    ) {

        state = "REVERSAL";

        signal = "WAIT";

        target = "Close";

        nextTarget = direction === "UP"

            ? "Upper TDP"

            : "Lower TDP";

        reason =

            "Price is testing previous Close.";

    }

    //--------------------------------------------------
    // Return Engine
    //--------------------------------------------------

    return {

        direction,

        state,

        signal,

        reason,

        target,

        nextTarget,

        watchZone,

        breakoutBuffer,

        reversalBuffer,

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
