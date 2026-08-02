// const API = window.API_BASE || "";
const API = "https://tradingsignals-5g76.onrender.com";

let currentLevels = null;
let currentSymbol = null;
let monitorTimer = null;


const $ = (id) => document.getElementById(id);


// Cards
const upperCard = document.querySelector(".upper");
const spCard = document.querySelector(".sp");
const closeCard = document.querySelector(".close");
const bpCard = document.querySelector(".bp");
const lowerCard = document.querySelector(".lower");


// Safe event listeners
const calculateBtn = $("calculateBtn");
const startMonitoringBtn = $("startMonitoring");
const searchBtn = $("searchBtn");


if (calculateBtn) {
    calculateBtn.addEventListener(
        "click",
        calculateLevels
    );
}


if (startMonitoringBtn) {
    startMonitoringBtn.addEventListener(
        "click",
        startMonitoring
    );
}


if (searchBtn) {
    searchBtn.addEventListener(
        "click",
        searchSymbol
    );
}



// ===============================
// SEARCH SYMBOL
// ===============================

async function searchSymbol() {

    const input = $("symbolInput");

    if (!input) return;


    const query = input.value.trim();


    if (!query)
        return;


    try {

        const res = await fetch(
            `${API}/search?q=${query}`
        );


        const data = await res.json();


        if (!data.length) {

            alert("Symbol not found");

            return;

        }


        currentSymbol = data[0];


        input.value =
            `${currentSymbol.name} (${currentSymbol.symbol})`;


    }
    catch(err){

        console.log(err);

    }

}



// ===============================
// CALCULATE LEVELS
// ===============================

async function calculateLevels() {


    if(!currentSymbol){

        alert(
            "Select a symbol first"
        );

        return;

    }



    const from = $("fromDate")?.value;

    const to = $("toDate")?.value;



    if(!from || !to){

        alert(
            "Select dates"
        );

        return;

    }



    try{


        const res = await fetch(

            `${API}/tape?symbol=${currentSymbol.symbol}&from=${from}&to=${to}`

        );



        currentLevels = await res.json();



        if($("upperTdp"))
            $("upperTdp").innerText =
                currentLevels.upperTDP.toFixed(2);



        if($("sp"))
            $("sp").innerText =
                currentLevels.sp.toFixed(2);



        if($("close"))
            $("close").innerText =
                currentLevels.close.toFixed(2);



        if($("bp"))
            $("bp").innerText =
                currentLevels.bp.toFixed(2);



        if($("lowerTdp"))
            $("lowerTdp").innerText =
                currentLevels.lowerTDP.toFixed(2);



    }
    catch(err){

        console.log(err);

    }

}



// ===============================
// START MONITORING
// ===============================

function startMonitoring(){


    if(!currentLevels){

        alert(
            "Calculate levels first."
        );

        return;

    }



    if(monitorTimer)
        clearInterval(monitorTimer);



    updateLive();



    monitorTimer =
        setInterval(
            updateLive,
            2000
        );

}



// ===============================
// LIVE PRICE
// ===============================

async function updateLive(){


    if(!currentSymbol)
        return;



    try{


        const res = await fetch(

            `${API}/live?symbol=${currentSymbol.symbol}`

        );



        const data =
            await res.json();



        if($("livePrice"))
            $("livePrice").innerText =
                data.price.toFixed(2);



        if($("marketOpen"))
            $("marketOpen").innerText =
                data.open.toFixed(2);



        determineScenario(data.open);


        determineSignal(data.price);


        updateDistances(data.price);


        highlightNearest(data.price);



    }
    catch(err){

        console.log(err);

    }

}



// ===============================
// SCENARIO
// ===============================

function determineScenario(open){


    if(!currentLevels)
        return;



    let scenario =
        "Case 1";



    if(open > currentLevels.upperTDP)

        scenario =
        "Case 3 (Above Upper TDP)";



    else if(open < currentLevels.lowerTDP)

        scenario =
        "Case 3 (Below Lower TDP)";



    else{


        const dClose =
            Math.abs(
                open-currentLevels.close
            );


        const dUpper =
            Math.abs(
                open-currentLevels.upperTDP
            );


        const dLower =
            Math.abs(
                open-currentLevels.lowerTDP
            );



        if(
            dClose < 100 ||
            dUpper < 100 ||
            dLower < 100
        )

            scenario =
            "Case 2";

    }



    if($("scenario"))
        $("scenario").innerText =
            scenario;

}



// ===============================
// SIGNAL
// ===============================

function determineSignal(price){


    if(!currentLevels)
        return;



    let signal =
        "WAIT";


    let reason =
        "Waiting for confirmation.";



    if(price >= currentLevels.upperTDP){

        signal="SELL";

        reason =
        "Price reached Upper TDP.";

    }


    else if(price <= currentLevels.lowerTDP){

        signal="BUY";

        reason =
        "Price reached Lower TDP.";

    }


    else if(price >= currentLevels.sp){

        signal="SELL";

        reason =
        "Price approaching SP.";

    }


    else if(price <= currentLevels.bp){

        signal="BUY";

        reason =
        "Price approaching BP.";

    }



    if($("signal")){

        $("signal").innerText =
            signal;


        $("signal").className =
            signal.toLowerCase();

    }



    if($("reason"))
        $("reason").innerText =
            reason;


}



// ===============================
// DISTANCES
// ===============================

function updateDistances(price){


    if(!currentLevels)
        return;



    if($("distUpper"))
        $("distUpper").innerText =
        (currentLevels.upperTDP-price).toFixed(2);



    if($("distSP"))
        $("distSP").innerText =
        (currentLevels.sp-price).toFixed(2);



    if($("distClose"))
        $("distClose").innerText =
        (currentLevels.close-price).toFixed(2);



    if($("distBP"))
        $("distBP").innerText =
        (currentLevels.bp-price).toFixed(2);



    if($("distLower"))
        $("distLower").innerText =
        (currentLevels.lowerTDP-price).toFixed(2);


}



// ===============================
// HIGHLIGHT LEVEL
// ===============================

function highlightNearest(price){


    if(!currentLevels)
        return;



    document
    .querySelectorAll(".levelCard")
    .forEach(card =>
        card.classList.remove("closest")
    );



    const distances = [

        {
            card: upperCard,
            d: Math.abs(
                price-currentLevels.upperTDP
            )
        },

        {
            card: spCard,
            d: Math.abs(
                price-currentLevels.sp
            )
        },

        {
            card: closeCard,
            d: Math.abs(
                price-currentLevels.close
            )
        },

        {
            card: bpCard,
            d: Math.abs(
                price-currentLevels.bp
            )
        },

        {
            card: lowerCard,
            d: Math.abs(
                price-currentLevels.lowerTDP
            )
        }

    ];



    distances
    .filter(x => x.card)
    .sort(
        (a,b)=>a.d-b.d
    )[0]
    .card
    .classList
    .add("closest");

}
