const API = window.API_BASE || "";

let currentLevels = null;
let currentSymbol = null;
let monitorTimer = null;

const $ = (id) => document.getElementById(id);

const upperCard = document.querySelector(".upper");
const spCard = document.querySelector(".sp");
const closeCard = document.querySelector(".close");
const bpCard = document.querySelector(".bp");
const lowerCard = document.querySelector(".lower");

$("#calculateBtn").addEventListener("click", calculateLevels);
$("#startMonitoring").addEventListener("click", startMonitoring);
$("#searchBtn").addEventListener("click", searchSymbol);

async function searchSymbol() {

    const query = $("#symbolInput").value.trim();

    if (!query) return;

    try {

        const res = await fetch(`${API}/search?q=${query}`);

        const data = await res.json();

        if (!data.length) {

            alert("Symbol not found");

            return;

        }

        currentSymbol = data[0];

        $("#symbolInput").value =
            currentSymbol.name + " (" + currentSymbol.symbol + ")";

    } catch (err) {

        console.log(err);

    }

}

async function calculateLevels() {

    if (!currentSymbol) {

        alert("Select a symbol first");

        return;

    }

    const from = $("#fromDate").value;

    const to = $("#toDate").value;

    if (!from || !to) {

        alert("Select dates");

        return;

    }

    try {

        const res = await fetch(

            `${API}/tape?symbol=${currentSymbol.symbol}&from=${from}&to=${to}`

        );

        currentLevels = await res.json();

        $("#upperTdp").innerText = currentLevels.upperTDP.toFixed(2);

        $("#sp").innerText = currentLevels.sp.toFixed(2);

        $("#close").innerText = currentLevels.close.toFixed(2);

        $("#bp").innerText = currentLevels.bp.toFixed(2);

        $("#lowerTdp").innerText = currentLevels.lowerTDP.toFixed(2);

    } catch (e) {

        console.log(e);

    }

}

async function startMonitoring() {

    if (!currentLevels) {

        alert("Calculate levels first.");

        return;

    }

    if (monitorTimer)

        clearInterval(monitorTimer);

    updateLive();

    monitorTimer = setInterval(updateLive, 2000);

}

async function updateLive() {

    try {

        const res = await fetch(

            `${API}/live?symbol=${currentSymbol.symbol}`

        );

        const data = await res.json();

        $("#livePrice").innerText = data.price.toFixed(2);

        $("#marketOpen").innerText = data.open.toFixed(2);

        determineScenario(data.open);

        determineSignal(data.price);

        updateDistances(data.price);

        highlightNearest(data.price);

    }

    catch(err){

        console.log(err);

    }

}

function determineScenario(open){

    let scenario="Case 1";

    if(open>currentLevels.upperTDP)

        scenario="Case 3 (Above Upper TDP)";

    else if(open<currentLevels.lowerTDP)

        scenario="Case 3 (Below Lower TDP)";

    else{

        const dClose=Math.abs(open-currentLevels.close);

        const dUpper=Math.abs(open-currentLevels.upperTDP);

        const dLower=Math.abs(open-currentLevels.lowerTDP);

        if(

            dClose<100 ||

            dUpper<100 ||

            dLower<100

        )

            scenario="Case 2";

    }

    $("#scenario").innerText=scenario;

}

function determineSignal(price){

    let signal="WAIT";

    let reason="Waiting for confirmation.";

    if(price>=currentLevels.upperTDP){

        signal="SELL";

        reason="Price reached Upper TDP.";

    }

    else if(price<=currentLevels.lowerTDP){

        signal="BUY";

        reason="Price reached Lower TDP.";

    }

    else if(price>=currentLevels.sp){

        signal="SELL";

        reason="Price approaching SP.";

    }

    else if(price<=currentLevels.bp){

        signal="BUY";

        reason="Price approaching BP.";

    }

    $("#signal").innerText=signal;

    $("#reason").innerText=reason;

    $("#signal").className=signal.toLowerCase();

}

function updateDistances(price){

    $("#distUpper").innerText=(currentLevels.upperTDP-price).toFixed(2);

    $("#distSP").innerText=(currentLevels.sp-price).toFixed(2);

    $("#distClose").innerText=(currentLevels.close-price).toFixed(2);

    $("#distBP").innerText=(currentLevels.bp-price).toFixed(2);

    $("#distLower").innerText=(currentLevels.lowerTDP-price).toFixed(2);

}

function highlightNearest(price){

    document

    .querySelectorAll(".levelCard")

    .forEach(card=>card.classList.remove("closest"));

    const distances=[

        {

            card:upperCard,

            d:Math.abs(price-currentLevels.upperTDP)

        },

        {

            card:spCard,

            d:Math.abs(price-currentLevels.sp)

        },

        {

            card:closeCard,

            d:Math.abs(price-currentLevels.close)

        },

        {

            card:bpCard,

            d:Math.abs(price-currentLevels.bp)

        },

        {

            card:lowerCard,

            d:Math.abs(price-currentLevels.lowerTDP)

        }

    ];

    distances.sort((a,b)=>a.d-b.d);

    distances[0].card.classList.add("closest");

}
