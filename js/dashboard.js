// dashboard.js
// PART 1/6

const API = "https://tradingsignals-5g76.onrender.com/api";

let currentSymbol = null;
let tapeData = null;
let monitorTimer = null;
let searchTimer = null;

const $ = id => document.getElementById(id);

const upperCard = document.querySelector(".upper");
const spCard = document.querySelector(".sp");
const closeCard = document.querySelector(".close");
const bpCard = document.querySelector(".bp");
const lowerCard = document.querySelector(".lower");

document.addEventListener("DOMContentLoaded", () => {

    $("#searchBtn")?.addEventListener("click", searchSymbol);

    $("#calculateBtn")?.addEventListener("click", calculateLevels);

    $("#startMonitoring")?.addEventListener("click", startMonitoring);

    $("#symbolInput")?.addEventListener("input", handleSearchTyping);

    $("#symbolInput")?.addEventListener("keydown", e => {

        if (e.key === "Enter") {

            e.preventDefault();

            searchSymbol();

        }

    });

});

function clearMonitor() {

    if (monitorTimer) {

        clearInterval(monitorTimer);

        monitorTimer = null;

    }

}

function clearSearchResults() {

    const box = $("#searchResults");

    if (box)

        box.innerHTML = "";

}

function showMessage(text) {

    console.log(text);

}

async function handleSearchTyping() {

    clearTimeout(searchTimer);

    const query = $("#symbolInput").value.trim();

    if (query.length < 2) {

        clearSearchResults();

        return;

    }

    searchTimer = setTimeout(() => {

        searchAutocomplete(query);

    }, 250);

}

// dashboard.js
// PART 2/6

async function searchAutocomplete(query) {

    try {

        const res = await fetch(

            `${API}/search?q=${encodeURIComponent(query)}`

        );

        const json = await res.json();

        if (!json.success) return;

        renderSearchResults(json.results);

    }

    catch (err) {

        console.error(err);

    }

}

function renderSearchResults(results) {

    const box = $("#searchResults");

    if (!box) return;

    box.innerHTML = "";

    if (!results.length) {

        box.innerHTML = `
            <div class="searchItem">
                No results found
            </div>
        `;

        return;

    }

    results.forEach(item => {

        const div = document.createElement("div");

        div.className = "searchItem";

        div.innerHTML = `

            <div class="symbol">

                ${item.symbol}

            </div>

            <div class="name">

                ${item.name}

            </div>

            <div class="exchange">

                ${item.exchange}

            </div>

        `;

        div.onclick = () => {

            currentSymbol = item;

            $("#symbolInput").value =
                `${item.name} (${item.symbol})`;

            clearSearchResults();

        };

        box.appendChild(div);

    });

}

async function searchSymbol() {

    const query = $("#symbolInput").value.trim();

    if (!query) return;

    try {

        const res = await fetch(

            `${API}/search?q=${encodeURIComponent(query)}`

        );

        const json = await res.json();

        if (!json.success) {

            alert("Search failed.");

            return;

        }

        if (!json.results.length) {

            alert("No matching symbol found.");

            return;

        }

        currentSymbol = json.results[0];

        $("#symbolInput").value =
            `${currentSymbol.name} (${currentSymbol.symbol})`;

        clearSearchResults();

    }

    catch (err) {

        console.error(err);

        alert("Unable to search symbol.");

    }

}

// dashboard.js
// PART 3/6

async function calculateLevels() {

    if (!currentSymbol) {

        alert("Select a symbol first.");

        return;

    }

    const start = $("#fromDate").value;

    const end = $("#toDate").value;

    if (!start || !end) {

        alert("Select a date range.");

        return;

    }

    clearMonitor();

    try {

        const res = await fetch(

            `${API}/tape?symbol=${encodeURIComponent(currentSymbol.symbol)}&start=${start}&end=${end}`

        );

        const json = await res.json();

        if (!json.success) {

            alert(json.error);

            return;

        }

        tapeData = json;

        const i = json.indicators;

        $("#upperTdp").innerText = i.upperTDP.toFixed(2);

        $("#sp").innerText = i.SP.toFixed(2);

        $("#close").innerText = i.close.toFixed(2);

        $("#bp").innerText = i.BP.toFixed(2);

        $("#lowerTdp").innerText = i.lowerTDP.toFixed(2);

        if (json.historicalMode) {

            showHistoricalPrediction();

            return;

        }

        restartMonitoring();

    }

    catch (err) {

        console.error(err);

        alert("Calculation failed.");

    }

}

function showHistoricalPrediction() {

    const p = tapeData.prediction;

    if (!p) return;

    $("#direction").innerText = p.direction;

    $("#scenario").innerText = p.state;

    $("#currentTarget").innerText = p.target;

    $("#nextTarget").innerText = p.nextTarget;

    $("#watchZone").innerText = p.watchZone;

    $("#breakoutBuffer").innerText = p.breakoutBuffer;

    $("#reversalBuffer").innerText = p.reversalBuffer;

    $("#livePrice").innerText =
        tapeData.nextOpen.toFixed(2);

    $("#marketOpen").innerText =
        tapeData.nextOpen.toFixed(2);

    $("#signal").innerText =
        p.signal;

    $("#signal").className =
        p.signal.toLowerCase();

    $("#reason").innerText =
        p.reason;

    updateDistances(p.distances);

    highlightTarget(p.target);

}

// dashboard.js
// PART 4/6

function restartMonitoring() {

    clearMonitor();

    updateLive();

    monitorTimer = setInterval(

        updateLive,

        2000

    );

}

async function updateLive() {

    if (!currentSymbol) return;

    try {

        const start = $("#fromDate").value;
        const end = $("#toDate").value;

        const res = await fetch(

            `${API}/live?symbol=${encodeURIComponent(currentSymbol.symbol)}&start=${start}&end=${end}`

        );

        const json = await res.json();

        if (!json.success) return;

        $("#livePrice").innerText =
            json.live.price.toFixed(2);

        $("#marketOpen").innerText =
            json.live.open.toFixed(2);

        $("#direction").innerText =
            json.engine.direction;

        $("#scenario").innerText =
            json.engine.state;

        $("#currentTarget").innerText =
            json.engine.target;

        $("#nextTarget").innerText =
            json.engine.nextTarget;

        $("#watchZone").innerText =
            json.engine.watchZone;

        $("#breakoutBuffer").innerText =
            json.engine.breakoutBuffer;

        $("#reversalBuffer").innerText =
            json.engine.reversalBuffer;

        $("#signal").innerText =
            json.engine.signal;

        $("#signal").className =
            json.engine.signal.toLowerCase();

        $("#reason").innerText =
            json.engine.reason;

        updateDistances(

            json.distances

        );

        highlightTarget(

            json.engine.target

        );

    }

    catch (err) {

        console.error(err);

    }

}

function startMonitoring() {

    if (!tapeData) {

        alert("Calculate levels first.");

        return;

    }

    restartMonitoring();

}

// dashboard.js
// PART 5/6

function updateDistances(distances) {

    if (!distances) return;

    if ($("#distUpper"))
        $("#distUpper").innerText =
            distances.upperTDP.toFixed(2);

    if ($("#distSP"))
        $("#distSP").innerText =
            distances.SP.toFixed(2);

    if ($("#distClose"))
        $("#distClose").innerText =
            distances.close.toFixed(2);

    if ($("#distBP"))
        $("#distBP").innerText =
            distances.BP.toFixed(2);

    if ($("#distLower"))
        $("#distLower").innerText =
            distances.lowerTDP.toFixed(2);

}

function highlightTarget(target) {

    document
        .querySelectorAll(".levelCard")
        .forEach(card =>
            card.classList.remove("closest")
        );

    switch (target) {

        case "Upper TDP":

            upperCard?.classList.add("closest");

            break;

        case "SP":

            spCard?.classList.add("closest");

            break;

        case "Close":

            closeCard?.classList.add("closest");

            break;

        case "BP":

            bpCard?.classList.add("closest");

            break;

        case "Lower TDP":

            lowerCard?.classList.add("closest");

            break;

    }

}

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

// dashboard.js
// PART 6/6

$("#fromDate")?.addEventListener(

    "change",

    () => {

        clearMonitor();

    }

);

$("#toDate")?.addEventListener(

    "change",

    () => {

        clearMonitor();

    }

);

$("#symbolInput")?.addEventListener(

    "input",

    () => {

        clearMonitor();

        currentSymbol = null;

    }

);

window.addEventListener(

    "focus",

    () => {

        if (canStartMonitoring())

            restartMonitoring();

    }

);

window.addEventListener(

    "blur",

    () => {

        clearMonitor();

    }

);

window.addEventListener(

    "beforeunload",

    () => {

        clearMonitor();

    }

);

window.addEventListener(

    "load",

    () => {

        clearMonitor();

        console.log(

            "Reduction Tape Scanner Ready"

        );

    }

);

// ------------------------------------
// Utility
// ------------------------------------

function formatNumber(value) {

    if (

        value === undefined ||

        value === null ||

        isNaN(value)

    )

        return "—";

    return Number(value).toFixed(2);

}

function setText(id, value) {

    const el = $(id);

    if (!el) return;

    el.innerText = value;

}

function resetDashboard() {

    [

        "upperTdp",

        "sp",

        "close",

        "bp",

        "lowerTdp",

        "livePrice",

        "marketOpen",

        "direction",

        "scenario",

        "currentTarget",

        "nextTarget",

        "watchZone",

        "breakoutBuffer",

        "reversalBuffer",

        "distUpper",

        "distSP",

        "distClose",

        "distBP",

        "distLower"

    ].forEach(id => {

        setText(id, "—");

    });

    setText("signal", "WAIT");

    setText("reason", "Waiting...");

    document

        .querySelectorAll(".levelCard")

        .forEach(card =>

            card.classList.remove("closest")

        );

}

resetDashboard();
