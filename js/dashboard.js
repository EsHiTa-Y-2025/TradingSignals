const API = "https://tradingsignals-5g76.onrender.com/api";

let currentSymbol = null;
let tapeData = null;
let monitorTimer = null;

const $ = id => document.getElementById(id);

const upperCard = document.querySelector(".upper");
const spCard = document.querySelector(".sp");
const closeCard = document.querySelector(".close");
const bpCard = document.querySelector(".bp");
const lowerCard = document.querySelector(".lower");

$("#searchBtn")?.addEventListener("click", searchSymbol);
$("#calculateBtn")?.addEventListener("click", calculateTape);
$("#startMonitoring")?.addEventListener("click", startMonitoring);

async function searchSymbol() {

    const query = $("#symbolInput").value.trim();

    if (!query) return;

    try {

        const res = await fetch(

            `${API}/search?q=${encodeURIComponent(query)}`

        );

        const json = await res.json();

        if (!json.success || !json.results.length) {

            alert("Symbol not found");

            return;

        }

        currentSymbol = json.results[0];

        $("#symbolInput").value =
            `${currentSymbol.name} (${currentSymbol.symbol})`;

    }

    catch (err) {

        console.log(err);

        alert("Search failed");

    }

}

async function calculateTape() {

    if (!currentSymbol) {

        alert("Search a symbol first.");

        return;

    }

    const start = $("#fromDate").value;

    const end = $("#toDate").value;

    if (!start || !end) {

        alert("Choose a date range.");

        return;

    }

    try {

        const res = await fetch(

            `${API}/tape?symbol=${currentSymbol.symbol}&start=${start}&end=${end}`

        );

        tapeData = await res.json();

        if (!tapeData.success) {

            alert(tapeData.error);

            return;

        }

        loadLevels();

        if (tapeData.historicalMode) {

            showHistoricalPrediction();

        }

    }

    catch (err) {

        console.log(err);

    }

}

function loadLevels() {

    const L = tapeData.indicators;

    $("#upperTdp").innerText = L.upperTDP.toFixed(2);

    $("#sp").innerText = L.SP.toFixed(2);

    $("#close").innerText = L.close.toFixed(2);

    $("#bp").innerText = L.BP.toFixed(2);

    $("#lowerTdp").innerText = L.lowerTDP.toFixed(2);

}

function showHistoricalPrediction() {

    const engine = tapeData.prediction;

    if (!engine) return;

    $("#livePrice").innerText =
        tapeData.nextOpen.toFixed(2);

    $("#marketOpen").innerText =
        tapeData.nextOpen.toFixed(2);

    $("#scenario").innerText =
        engine.state;

    $("#signal").innerText =
        engine.signal;

    $("#reason").innerText =
        engine.reason;

    $("#signal").className =
        engine.signal.toLowerCase();

    updateDistances(engine.distances);

    highlightTarget(engine.target);

}

function startMonitoring() {

    if (!tapeData) {

        alert("Calculate levels first.");

        return;

    }

    if (tapeData.historicalMode) {

        alert(
            "Historical Mode selected.\nLive monitoring is disabled."
        );

        return;

    }

    if (monitorTimer) {

        clearInterval(monitorTimer);

    }

    updateLive();

    monitorTimer = setInterval(

        updateLive,

        2000

    );

}

async function updateLive() {

    try {

        const start =
            $("#fromDate").value;

        const end =
            $("#toDate").value;

        const res = await fetch(

            `${API}/live?symbol=${currentSymbol.symbol}&start=${start}&end=${end}`

        );

        const json = await res.json();

        if (!json.success) {

            console.log(json.error);

            return;

        }

        $("#livePrice").innerText =
            json.live.price.toFixed(2);

        $("#marketOpen").innerText =
            json.live.open.toFixed(2);

        $("#scenario").innerText =
            json.engine.state;

        $("#signal").innerText =
            json.engine.signal;

        $("#reason").innerText =
            json.engine.reason;

        $("#signal").className =
            json.engine.signal.toLowerCase();

        updateDistances(
            json.distances
        );

        highlightTarget(
            json.engine.target
        );

    }

    catch (err) {

        console.log(err);

    }

}

function updateDistances(distances) {

    if (!distances) return;

    $("#distUpper").innerText =
        distances.upperTDP.toFixed(2);

    $("#distSP").innerText =
        distances.SP.toFixed(2);

    $("#distClose").innerText =
        distances.close.toFixed(2);

    $("#distBP").innerText =
        distances.BP.toFixed(2);

    $("#distLower").innerText =
        distances.lowerTDP.toFixed(2);

}

function resetCards() {

    document

        .querySelectorAll(".levelCard")

        .forEach(card =>

            card.classList.remove("closest")

        );

}

function highlightTarget(target) {

    resetCards();

    switch (target) {

        case "UPPER_TDP":

            upperCard?.classList.add("closest");

            break;

        case "SP":

            spCard?.classList.add("closest");

            break;

        case "CLOSE":

            closeCard?.classList.add("closest");

            break;

        case "BP":

            bpCard?.classList.add("closest");

            break;

        case "LOWER_TDP":

            lowerCard?.classList.add("closest");

            break;

    }

}

function clearMonitor() {

    if (monitorTimer) {

        clearInterval(monitorTimer);

        monitorTimer = null;

    }

}

//-----------------------------------------------------
// Auto Stop Monitoring
//-----------------------------------------------------

function isTodaySelected() {

    const end = $("#toDate").value;

    if (!end) return false;

    const today = new Date()
        .toISOString()
        .slice(0, 10);

    return end === today;

}

function canStartMonitoring() {

    if (!tapeData)
        return false;

    if (tapeData.historicalMode)
        return false;

    return isTodaySelected();

}

//-----------------------------------------------------
// Refresh Timer
//-----------------------------------------------------

function restartMonitoring() {

    clearMonitor();

    if (!canStartMonitoring())
        return;

    updateLive();

    monitorTimer = setInterval(

        updateLive,

        2000

    );

}

//-----------------------------------------------------
// Date Change
//-----------------------------------------------------

$("#fromDate")?.addEventListener(

    "change",

    clearMonitor

);

$("#toDate")?.addEventListener(

    "change",

    clearMonitor

);

//-----------------------------------------------------
// Symbol Change
//-----------------------------------------------------

$("#symbolInput")?.addEventListener(

    "input",

    () => {

        clearMonitor();

        currentSymbol = null;

    }

);

//-----------------------------------------------------
// Window Focus
//-----------------------------------------------------

window.addEventListener(

    "focus",

    () => {

        if (canStartMonitoring())

            restartMonitoring();

    }

);

//-----------------------------------------------------
// Window Blur
//-----------------------------------------------------

window.addEventListener(

    "blur",

    () => {

        clearMonitor();

    }

);

//-----------------------------------------------------
// Page Load
//-----------------------------------------------------

window.addEventListener(

    "load",

    () => {

        clearMonitor();

        console.log(

            "Reduction Tape Scanner Ready"

        );

    }

);

//-----------------------------------------------------
// Before Unload
//-----------------------------------------------------

window.addEventListener(

    "beforeunload",

    clearMonitor

);
