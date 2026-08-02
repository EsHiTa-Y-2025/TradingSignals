// ============================================
// Dashboard
// ============================================

let selectedSymbol = null;
let liveTimer = null;

// --------------------------------------------
// Elements
// --------------------------------------------

const symbolInput = document.getElementById("symbolInput");
const searchButton = document.getElementById("searchButton");
const searchResults = document.getElementById("searchResults");

const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");

const calculateButton = document.getElementById("calculateButton");

// Calculation Card

const high = document.getElementById("high");
const low = document.getElementById("low");
const spread = document.getElementById("spread");
const root = document.getElementById("root");
const tradePoint = document.getElementById("tradePoint");
const close = document.getElementById("close");
const upper = document.getElementById("upper");
const lower = document.getElementById("lower");
const sp = document.getElementById("sp");
const bp = document.getElementById("bp");

// Live Card

const livePrice = document.getElementById("livePrice");
const scenario = document.getElementById("scenario");
const signal = document.getElementById("signal");
const reason = document.getElementById("reason");

const distUpper = document.getElementById("distUpper");
const distLower = document.getElementById("distLower");
const distSP = document.getElementById("distSP");
const distBP = document.getElementById("distBP");

// --------------------------------------------
// Default Dates
// --------------------------------------------

(function () {

    const today = new Date();

    const past = new Date();

    past.setMonth(today.getMonth() - 1);

    endDate.value = today.toISOString().split("T")[0];

    startDate.value = past.toISOString().split("T")[0];

})();

// --------------------------------------------
// Search
// --------------------------------------------

searchButton.addEventListener("click", performSearch);

symbolInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        performSearch();

    }

});

async function performSearch() {

    const query = symbolInput.value.trim();

    if (!query) return;

    searchResults.innerHTML = "Searching...";

    try {

        const results = await searchCompany(query);

        renderResults(results);

    }

    catch (err) {

        alert(err.message);

    }

}

function renderResults(results) {

    searchResults.innerHTML = "";

    if (results.length === 0) {

        searchResults.innerHTML = "<p>No symbols found.</p>";

        return;

    }

    results.forEach(item => {

        const div = document.createElement("div");

        div.className = "result-item";

        div.innerHTML = `

            <strong>${item.symbol}</strong>

            <br>

            ${item.name}

            <br>

            <small>${item.exchange}</small>

        `;

        div.onclick = () => {

            selectedSymbol = item.symbol;

            symbolInput.value = item.name;

            searchResults.innerHTML = "";

        };

        searchResults.appendChild(div);

    });

}

// --------------------------------------------
// Calculate
// --------------------------------------------

calculateButton.addEventListener("click", calculate);

async function calculate() {

    if (!selectedSymbol) {

        alert("Please choose a symbol.");

        return;

    }

    calculateButton.disabled = true;

    try {

        const data = await calculateTape(

            selectedSymbol,

            startDate.value,

            endDate.value

        );

        updateCalculationCard(data);

        startLiveMonitoring();

    }

    catch (err) {

        alert(err.message);

    }

    calculateButton.disabled = false;

}

// --------------------------------------------
// Calculation Card
// --------------------------------------------

function updateCalculationCard(data) {

    const calc = data.calculation;

    const ind = data.indicators;

    high.textContent = calc.high;

    low.textContent = calc.low;

    spread.textContent = calc.spread;

    root.textContent = calc.digitalRoot;

    tradePoint.textContent = calc.tradePoint;

    close.textContent = ind.close;

    upper.textContent = ind.upperTDP;

    lower.textContent = ind.lowerTDP;

    sp.textContent = ind.SP;

    bp.textContent = ind.BP;

}

// --------------------------------------------
// Live Monitor
// --------------------------------------------

function startLiveMonitoring() {

    if (liveTimer) {

        clearInterval(liveTimer);

    }

    updateLive();

    liveTimer = setInterval(

        updateLive,

        1000

    );

}

async function updateLive() {

    if (!selectedSymbol) return;

    try {

        const data = await getLiveData(

            selectedSymbol,

            startDate.value,

            endDate.value

        );

        const monitor = data.monitor;

        livePrice.textContent = data.live.price;

        scenario.textContent = monitor.scenario;

        signal.textContent = monitor.signal;

        reason.textContent = monitor.reason;

        distUpper.textContent = monitor.distances.upperTDP;

        distLower.textContent = monitor.distances.lowerTDP;

        distSP.textContent = monitor.distances.SP;

        distBP.textContent = monitor.distances.BP;

        signal.className = "";

        switch (monitor.signal) {

            case "BUY":

                signal.classList.add("buy");

                break;

            case "SELL":

                signal.classList.add("sell");

                break;

            default:

                signal.classList.add("wait");

        }

    }

    catch (err) {

        console.error(err);

    }

}
