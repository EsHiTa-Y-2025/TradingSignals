// ==========================================
// Reduction Tape Dashboard
// Version 2 - Compatible with Render Backend
// ==========================================

const API = "https://tradingsignals-5g76.onrender.com";

let currentSymbol = null;
let currentLevels = null;
let monitorTimer = null;

const $ = (id) => document.getElementById(id);

// -------------------------
// Cards
// -------------------------

const upperCard = document.querySelector(".upper");
const spCard = document.querySelector(".sp");
const closeCard = document.querySelector(".close");
const bpCard = document.querySelector(".bp");
const lowerCard = document.querySelector(".lower");

// -------------------------
// Buttons
// -------------------------

$("searchBtn")?.addEventListener("click", searchSymbol);
$("calculateBtn")?.addEventListener("click", calculateLevels);
$("startMonitoring")?.addEventListener("click", startMonitoring);

// =========================================
// SEARCH SYMBOL
// =========================================

async function searchSymbol() {

    const query = $("symbolInput")?.value.trim();

    if (!query) {
        alert("Enter a stock name.");
        return;
    }

    try {

        const response = await fetch(
            `${API}/api/search?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        if (!data.success || data.results.length === 0) {

            alert("No matching symbol found.");

            return;

        }

        currentSymbol = data.results[0];

        $("symbolInput").value =
            `${currentSymbol.name} (${currentSymbol.symbol})`;

    }

    catch (err) {

        console.error(err);

        alert("Unable to search symbol.");

    }

}

// =========================================
// CALCULATE TAPE
// =========================================

async function calculateLevels() {

    if (!currentSymbol) {

        alert("Search and select a symbol first.");

        return;

    }

    const start = $("fromDate").value;

    const end = $("toDate").value;

    if (!start || !end) {

        alert("Please choose both dates.");

        return;

    }

    try {

        const response = await fetch(

            `${API}/api/tape?symbol=${encodeURIComponent(currentSymbol.symbol)}&start=${start}&end=${end}`

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.error);

            return;

        }

        currentLevels = data.indicators;

        $("upperTdp").innerText =
            currentLevels.upperTDP.toFixed(2);

        $("sp").innerText =
            currentLevels.SP.toFixed(2);

        $("close").innerText =
            currentLevels.close.toFixed(2);

        $("bp").innerText =
            currentLevels.BP.toFixed(2);

        $("lowerTdp").innerText =
            currentLevels.lowerTDP.toFixed(2);

    }

    catch (err) {

        console.error(err);

        alert("Calculation failed.");

    }

}

// =========================================
// START LIVE MONITOR
// =========================================

function startMonitoring() {

    if (!currentLevels) {

        alert("Calculate tape first.");

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

// =========================================
// LIVE PRICE UPDATE
// =========================================

async function updateLive() {

    if (!currentSymbol)
        return;

    const start = $("fromDate").value;
    const end = $("toDate").value;

    try {

        const response = await fetch(

            `${API}/api/live?symbol=${encodeURIComponent(currentSymbol.symbol)}&start=${start}&end=${end}`

        );

        const data = await response.json();

        if (!data.success) {

            console.error(data.error);

            return;

        }

        // -----------------------
        // Live Market Data
        // -----------------------

        $("livePrice").innerText =
            data.live.price.toFixed(2);

        $("marketOpen").innerText =
            data.live.open.toFixed(2);

        // -----------------------
        // Scenario
        // -----------------------

        $("scenario").innerText =
            data.monitor.scenario;

        // -----------------------
        // Signal
        // -----------------------

        $("signal").innerText =
            data.monitor.signal;

        $("reason").innerText =
            data.monitor.reason;

        // Signal colours

        $("signal").classList.remove(
            "buy",
            "sell",
            "wait"
        );

        switch (data.monitor.signal) {

            case "BUY":
                $("signal").classList.add("buy");
                break;

            case "SELL":
                $("signal").classList.add("sell");
                break;

            default:
                $("signal").classList.add("wait");

        }

        // -----------------------
        // Distance Table
        // -----------------------

        $("distUpper").innerText =
            data.monitor.distances.upperTDP.toFixed(2);

        $("distSP").innerText =
            data.monitor.distances.SP.toFixed(2);

        $("distClose").innerText =
            data.monitor.distances.close.toFixed(2);

        $("distBP").innerText =
            data.monitor.distances.BP.toFixed(2);

        $("distLower").innerText =
            data.monitor.distances.lowerTDP.toFixed(2);

        // -----------------------
        // Highlight nearest level
        // -----------------------

        highlightNearest(
            data.live.price
        );

    }

    catch (err) {

        console.error(err);

    }

}

// =========================================
// HIGHLIGHT NEAREST LEVEL
// =========================================

function highlightNearest(price) {

    if (!currentLevels)
        return;

    document
        .querySelectorAll(".levelCard")
        .forEach(card =>
            card.classList.remove("closest")
        );

    const levels = [

        {
            card: upperCard,
            value: currentLevels.upperTDP
        },

        {
            card: spCard,
            value: currentLevels.SP
        },

        {
            card: closeCard,
            value: currentLevels.close
        },

        {
            card: bpCard,
            value: currentLevels.BP
        },

        {
            card: lowerCard,
            value: currentLevels.lowerTDP
        }

    ];

    let nearest = null;
    let minDistance = Number.MAX_VALUE;

    for (const level of levels) {

        if (!level.card)
            continue;

        const distance = Math.abs(price - level.value);

        if (distance < minDistance) {

            minDistance = distance;

            nearest = level;

        }

    }

    if (nearest) {

        nearest.card.classList.add("closest");

    }

}

// =========================================
// RESET DASHBOARD
// =========================================

function resetDashboard() {

    currentLevels = null;

    if (monitorTimer) {

        clearInterval(monitorTimer);

        monitorTimer = null;

    }

    [
        "upperTdp",
        "sp",
        "close",
        "bp",
        "lowerTdp",
        "livePrice",
        "marketOpen",
        "scenario",
        "signal",
        "reason",
        "distUpper",
        "distSP",
        "distClose",
        "distBP",
        "distLower"
    ].forEach(id => {

        const element = $(id);

        if (element)
            element.innerText = "-";

    });

    document
        .querySelectorAll(".levelCard")
        .forEach(card =>
            card.classList.remove("closest")
        );

}

// =========================================
// ENTER KEY SUPPORT
// =========================================

$("symbolInput")?.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        searchSymbol();

    }

});

// =========================================
// AUTO STOP WHEN TAB HIDDEN
// =========================================

document.addEventListener("visibilitychange", () => {

    if (document.hidden && monitorTimer) {

        clearInterval(monitorTimer);

    }

    else if (
        !document.hidden &&
        currentLevels
    ) {

        monitorTimer = setInterval(
            updateLive,
            2000
        );

    }

});

// =========================================
// STARTUP
// =========================================

window.addEventListener("load", () => {

    console.log("====================================");
    console.log(" Reduction Tape Dashboard Loaded");
    console.log(" Backend:", API);
    console.log("====================================");

});
