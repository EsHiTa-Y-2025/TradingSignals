// calculations/reduction.js

export function round(value) {

    return Number(

        Number(value).toFixed(2)

    );

}

// -----------------------------------------------------
// Digital Root
// -----------------------------------------------------

export function digitalRoot(number) {

    let n = Math.abs(

        Math.round(number)

    );

    const steps = [];

    while (n >= 10) {

        steps.push(n);

        n = n
            .toString()
            .split("")
            .reduce(

                (sum, digit) =>

                    sum + Number(digit),

                0

            );

    }

    steps.push(n);

    return {

        value: n,

        steps

    };

}

// -----------------------------------------------------
// Trade Point Calculation
// -----------------------------------------------------

export function calculateTradePoint(

    high,

    low

) {

    const spread =

        round(high - low);

    const root =

        digitalRoot(spread);

    const tradePoint =

        round(

            spread /

            root.value

        );

    return {

        high: round(high),

        low: round(low),

        spread,

        digitalRoot:
            root.value,

        reductionSteps:
            root.steps,

        tradePoint

    };

}
