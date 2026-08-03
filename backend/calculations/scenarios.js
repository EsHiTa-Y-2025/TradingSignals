// calculations/scenarios.js

import { round } from "./reduction.js";

const MIN_WATCH_ZONE = 20;
const CLOSE_BUFFER = 100;

function abs(value) {
    return Math.abs(value);
}

function distance(price, level) {
    return round(level - price);
}

function dynamicWatchZone(tradePoint) {
    return Math.max(
        MIN_WATCH_ZONE,
        round(tradePoint * 2)
    );
}

function breakoutBuffer(tradePoint) {
    return Math.max(
        10,
        round(tradePoint * 0.5)
    );
}

function reversalBuffer(tradePoint) {
    return Math.max(
        10,
        round(tradePoint * 0.5)
    );
}

function getDirection(open, previousClose) {
    if (open > previousClose)
        return "UP";

    if (open < previousClose)
        return "DOWN";

    return "NEUTRAL";
}

function getInitialTarget(direction, indicators) {

    if (direction === "UP")
        return "UPPER_TDP";

    if (direction === "DOWN")
        return "LOWER_TDP";

    return "CLOSE";

}

function levelValue(target, indicators) {

    switch (target) {

        case "UPPER_TDP":
            return indicators.upperTDP;

        case "LOWER_TDP":
            return indicators.lowerTDP;

        case "SP":
            return indicators.SP;

        case "BP":
            return indicators.BP;

        default:
            return indicators.close;

    }

}

function nextTarget(target, event) {

    switch (target) {

        case "UPPER_TDP":

            if (event === "BREAKOUT")
                return "SP";

            if (event === "REVERSAL")
                return "CLOSE";

            break;

        case "LOWER_TDP":

            if (event === "BREAKDOWN")
                return "BP";

            if (event === "REVERSAL")
                return "CLOSE";

            break;

        case "SP":

            return "SP";

        case "BP":

            return "BP";

    }

    return target;

}

export function detectScenario({

    previousClose,

    open,

    currentPrice,

    indicators,

    tradePoint

}) {

    const direction =
        getDirection(
            open,
            previousClose
        );

    const watchZone =
        dynamicWatchZone(
            tradePoint
        );

    const breakout =
        breakoutBuffer(
            tradePoint
        );

    const reversal =
        reversalBuffer(
            tradePoint
        );

    const target =
        getInitialTarget(
            direction,
            indicators
        );

    const targetPrice =
        levelValue(
            target,
            indicators
        );

    const nearClose =
        abs(
            open - previousClose
        ) <= CLOSE_BUFFER;

    let state = "MOVING";

    let signal = "WAIT";

    let reason = "";

    let next = target;

    const diff =
        currentPrice - targetPrice;

    //------------------------------------------------
    // WATCH ZONE
    //------------------------------------------------

    if (
        abs(diff) <= watchZone
    ) {

        state = "WATCHING";

        reason =
            "Price entered watch zone.";

    }

    //------------------------------------------------
    // BREAKOUT
    //------------------------------------------------

    if (
        target === "UPPER_TDP" &&
        diff > breakout
    ) {

        state = "BREAKOUT";

        signal = "BUY";

        next =
            nextTarget(
                target,
                "BREAKOUT"
            );

        reason =
            "Upper TDP breakout confirmed.";

    }

    if (
        target === "LOWER_TDP" &&
        diff < -breakout
    ) {

        state = "BREAKDOWN";

        signal = "SELL";

        next =
            nextTarget(
                target,
                "BREAKDOWN"
            );

        reason =
            "Lower TDP breakdown confirmed.";

    }

    //------------------------------------------------
    // REVERSAL
    //------------------------------------------------

    if (
        target === "UPPER_TDP" &&
        diff < -reversal &&
        abs(diff) <= watchZone
    ) {

        state = "REVERSAL";

        signal = "SELL";

        next =
            nextTarget(
                target,
                "REVERSAL"
            );

        reason =
            "Rejected from Upper TDP.";

    }

    if (
        target === "LOWER_TDP" &&
        diff > reversal &&
        abs(diff) <= watchZone
    ) {

        state = "REVERSAL";

        signal = "BUY";

        next =
            nextTarget(
                target,
                "REVERSAL"
            );

        reason =
            "Rejected from Lower TDP.";

    }

    return {

        direction,

        nearClose,

        state,

        signal,

        target,

        targetPrice,

        nextTarget: next,

        watchZone,

        breakoutBuffer: breakout,

        reversalBuffer: reversal,

        reason,

        distances: {

            upperTDP:
                distance(
                    currentPrice,
                    indicators.upperTDP
                ),

            SP:
                distance(
                    currentPrice,
                    indicators.SP
                ),

            close:
                distance(
                    currentPrice,
                    indicators.close
                ),

            BP:
                distance(
                    currentPrice,
                    indicators.BP
                ),

            lowerTDP:
                distance(
                    currentPrice,
                    indicators.lowerTDP
                )

        }

    };

}
