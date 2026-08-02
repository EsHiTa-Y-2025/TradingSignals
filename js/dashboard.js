// ======================================================
// Reduction Tape Scanner Dashboard
// dashboard.js
// Part 1
// ======================================================

// --------------------------------------
// Backend URL
// --------------------------------------

const API = "https://tradingsignals-5g76.onrender.com";

// --------------------------------------
// Global Variables
// --------------------------------------

let currentSymbol = null;

let currentLevels = null;

let monitorTimer = null;

let searchTimer = null;

let searchResults = [];

let selectedSuggestion = -1;

// --------------------------------------
// Helper
// --------------------------------------

const $ = (id) => document.getElementById(id);

// --------------------------------------
// Cards
// --------------------------------------

const upperCard =
    document.querySelector(".upper");

const spCard =
    document.querySelector(".sp");

const closeCard =
    document.querySelector(".close");

const bpCard =
    document.querySelector(".bp");

const lowerCard =
    document.querySelector(".lower");

// --------------------------------------
// Inputs
// --------------------------------------

const symbolInput =
    $("symbolInput");

const suggestionBox =
    $("searchSuggestions");

const fromDate =
    $("fromDate");

const toDate =
    $("toDate");

// --------------------------------------
// Buttons
// --------------------------------------

const searchBtn =
    $("searchBtn");

const calculateBtn =
    $("calculateBtn");

const startMonitoringBtn =
    $("startMonitoring");

// --------------------------------------
// Event Listeners
// --------------------------------------

if(searchBtn){

    searchBtn.addEventListener(

        "click",

        ()=>{

            performSearch();

        }

    );

}

if(calculateBtn){

    calculateBtn.addEventListener(

        "click",

        calculateLevels

    );

}

if(startMonitoringBtn){

    startMonitoringBtn.addEventListener(

        "click",

        startMonitoring

    );

}

// --------------------------------------
// Search Input
// --------------------------------------

if(symbolInput){

    symbolInput.addEventListener(

        "input",

        handleTyping

    );

    symbolInput.addEventListener(

        "keydown",

        handleKeyboard

    );

}

// Close suggestions when clicking outside

document.addEventListener(

    "click",

    (e)=>{

        if(

            suggestionBox &&

            !suggestionBox.contains(e.target) &&

            e.target!==symbolInput

        ){

            hideSuggestions();

        }

    }

);

// ======================================================
// SEARCH
// ======================================================

async function handleTyping(){

    const query =
        symbolInput.value.trim();

    if(query.length<2){

        hideSuggestions();

        return;

    }

    clearTimeout(searchTimer);

    searchTimer = setTimeout(

        ()=>{

            performSearch();

        },

        300

    );

}

// --------------------------------------
// Search API
// --------------------------------------

async function performSearch(){

    const query =
        symbolInput.value.trim();

    if(!query)
        return;

    try{

        const response = await fetch(

            `${API}/api/search?q=${encodeURIComponent(query)}`

        );

        const data =
            await response.json();

        if(!data.success){

            alert(data.error);

            return;

        }

        searchResults =
            data.results || [];

        renderSuggestions();

    }

    catch(err){

        console.error(err);

    }

}

// ======================================================
// RENDER SEARCH SUGGESTIONS
// ======================================================

function renderSuggestions(){

    if(!suggestionBox)
        return;

    suggestionBox.innerHTML = "";

    selectedSuggestion = -1;

    if(searchResults.length===0){

        suggestionBox.classList.remove("show");

        return;

    }

    searchResults.forEach(

        (item,index)=>{

            const div =
                document.createElement("div");

            div.className =
                "suggestion";

            div.innerHTML = `

                <div class="suggestionTitle">

                    ${item.name}

                </div>

                <div class="suggestionSub">

                    ${item.symbol}
                    •
                    ${item.exchange}
                    •
                    ${item.type}

                </div>

            `;

            div.addEventListener(

                "click",

                ()=>{

                    chooseSuggestion(index);

                }

            );

            suggestionBox.appendChild(div);

        }

    );

    suggestionBox.classList.add("show");

}

// ======================================================
// SELECT A SUGGESTION
// ======================================================

function chooseSuggestion(index){

    currentSymbol =
        searchResults[index];

    if(!currentSymbol)
        return;

    symbolInput.value =

        `${currentSymbol.name} (${currentSymbol.symbol})`;

    hideSuggestions();

}

// ======================================================
// HIDE SUGGESTIONS
// ======================================================

function hideSuggestions(){

    if(!suggestionBox)
        return;

    suggestionBox.classList.remove(
        "show"
    );

    suggestionBox.innerHTML = "";

    selectedSuggestion = -1;

}

// ======================================================
// KEYBOARD NAVIGATION
// ======================================================

function handleKeyboard(event){

    if(

        !suggestionBox ||

        !suggestionBox.classList.contains("show")

    ){

        return;

    }

    const items =

        suggestionBox.querySelectorAll(

            ".suggestion"

        );

    // -----------------------------
    // DOWN
    // -----------------------------

    if(event.key==="ArrowDown"){

        event.preventDefault();

        selectedSuggestion++;

        if(

            selectedSuggestion>=items.length

        ){

            selectedSuggestion=0;

        }

        updateSuggestionHighlight(items);

    }

    // -----------------------------
    // UP
    // -----------------------------

    else if(event.key==="ArrowUp"){

        event.preventDefault();

        selectedSuggestion--;

        if(selectedSuggestion<0){

            selectedSuggestion=

                items.length-1;

        }

        updateSuggestionHighlight(items);

    }

    // -----------------------------
    // ENTER
    // -----------------------------

    else if(event.key==="Enter"){

        event.preventDefault();

        if(

            selectedSuggestion>=0

        ){

            chooseSuggestion(

                selectedSuggestion

            );

        }

        else{

            performSearch();

        }

    }

    // -----------------------------
    // ESC
    // -----------------------------

    else if(event.key==="Escape"){

        hideSuggestions();

    }

}

// ======================================================
// UPDATE HIGHLIGHT
// ======================================================

function updateSuggestionHighlight(items){

    items.forEach(

        item=>item.classList.remove(

            "active"

        )

    );

    if(

        selectedSuggestion>=0 &&

        items[selectedSuggestion]

    ){

        items[selectedSuggestion]

        .classList

        .add("active");

        items[selectedSuggestion]

        .scrollIntoView({

            block:"nearest"

        });

    }

}


// ======================================================
// CALCULATE REDUCTION TAPE
// ======================================================

async function calculateLevels(){

    if(!currentSymbol){

        alert(
            "Please select a stock first."
        );

        return;

    }

    const start =
        fromDate.value;

    const end =
        toDate.value;

    if(!start || !end){

        alert(
            "Please select Start and End dates."
        );

        return;

    }

    try{

        calculateBtn.disabled = true;

        calculateBtn.innerText =
            "Calculating...";

        const response =
            await fetch(

                `${API}/api/tape?symbol=${encodeURIComponent(
                    currentSymbol.symbol
                )}&start=${start}&end=${end}`

            );

        const data =
            await response.json();

        if(!response.ok || !data.success){

            throw new Error(

                data.error ||

                "Unable to calculate tape."

            );

        }

        //--------------------------------------------------
        // Store indicators
        //--------------------------------------------------

        currentLevels =
            data.indicators;

        //--------------------------------------------------
        // Display Levels
        //--------------------------------------------------

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

        //--------------------------------------------------
        // Clear Previous Monitor
        //--------------------------------------------------

        $("livePrice").innerText = "-";

        $("marketOpen").innerText = "-";

        $("scenario").innerText = "-";

        $("signal").innerText = "WAIT";

        $("reason").innerText =

            "Waiting for monitoring...";

        $("distUpper").innerText = "-";

        $("distSP").innerText = "-";

        $("distClose").innerText = "-";

        $("distBP").innerText = "-";

        $("distLower").innerText = "-";

        //--------------------------------------------------
        // Remove Highlight
        //--------------------------------------------------

        document

            .querySelectorAll(".levelCard")

            .forEach(card=>{

                card.classList.remove(

                    "closest"

                );

            });

        console.log(

            "Tape Calculated",

            currentLevels

        );

    }

    catch(err){

        console.error(err);

        alert(

            err.message ||

            "Calculation failed."

        );

    }

    finally{

        calculateBtn.disabled = false;

        calculateBtn.innerText =

            "Calculate";

    }

}

// ======================================================
// START LIVE MONITORING
// ======================================================

function startMonitoring(){

    if(!currentSymbol){

        alert(
            "Please search and select a symbol."
        );

        return;

    }

    if(!currentLevels){

        alert(
            "Calculate the Reduction Tape first."
        );

        return;

    }

    if(monitorTimer){

        clearInterval(
            monitorTimer
        );

    }

    updateLive();

    monitorTimer = setInterval(

        updateLive,

        2000

    );

    console.log(
        "Live Monitoring Started"
    );

}

// ======================================================
// STOP LIVE MONITORING
// ======================================================

function stopMonitoring(){

    if(monitorTimer){

        clearInterval(
            monitorTimer
        );

        monitorTimer = null;

    }

}

// ======================================================
// FETCH LIVE DATA
// ======================================================

async function updateLive(){

    if(
        !currentSymbol ||
        !currentLevels
    ){
        return;
    }

    const start =
        fromDate.value;

    const end =
        toDate.value;

    try{

        const response =
            await fetch(

                `${API}/api/live?symbol=${encodeURIComponent(
                    currentSymbol.symbol
                )}&start=${start}&end=${end}`

            );

        const data =
            await response.json();

        if(
            !response.ok ||
            !data.success
        ){

            throw new Error(

                data.error ||

                "Unable to fetch live data."

            );

        }

        //----------------------------------
        // Live Price
        //----------------------------------

        $("livePrice").innerText =

            Number(
                data.live.price
            ).toFixed(2);

        $("marketOpen").innerText =

            Number(
                data.live.open
            ).toFixed(2);

        //----------------------------------
        // Scenario
        //----------------------------------

        $("scenario").innerText =

            data.monitor.scenario;

        //----------------------------------
        // Signal
        //----------------------------------

        $("signal").innerText =

            data.monitor.signal;

        $("signal").className =

            data.monitor.signal.toLowerCase();

        //----------------------------------
        // Reason
        //----------------------------------

        $("reason").innerText =

            data.monitor.reason;

        //----------------------------------
        // Distances
        //----------------------------------

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

        //----------------------------------
        // Highlight nearest level
        //----------------------------------

        highlightNearest(

            data.live.price

        );

    }

    catch(err){

        console.error(err);

    }

}

// ======================================================
// HIGHLIGHT NEAREST LEVEL
// ======================================================

function highlightNearest(price){

    if(!currentLevels)
        return;

    document

        .querySelectorAll(".levelCard")

        .forEach(card=>{

            card.classList.remove(
                "closest"
            );

        });

    const levels=[

        {

            card:upperCard,

            value:currentLevels.upperTDP

        },

        {

            card:spCard,

            value:currentLevels.SP

        },

        {

            card:closeCard,

            value:currentLevels.close

        },

        {

            card:bpCard,

            value:currentLevels.BP

        },

        {

            card:lowerCard,

            value:currentLevels.lowerTDP

        }

    ];

    let nearest=null;

    let nearestDistance=Infinity;

    levels.forEach(level=>{

        if(!level.card)
            return;

        const distance=Math.abs(

            price-level.value

        );

        if(distance<nearestDistance){

            nearestDistance=distance;

            nearest=level;

        }

    });

    if(nearest){

        nearest.card.classList.add(

            "closest"

        );

    }

}

// ======================================================
// RESET DASHBOARD
// ======================================================

function resetDashboard(){

    stopMonitoring();

    currentLevels=null;

    currentSymbol=null;

    if(symbolInput)
        symbolInput.value="";

    const ids=[

        "upperTdp",

        "sp",

        "close",

        "bp",

        "lowerTdp",

        "livePrice",

        "marketOpen",

        "scenario",

        "reason",

        "distUpper",

        "distSP",

        "distClose",

        "distBP",

        "distLower"

    ];

    ids.forEach(id=>{

        const element=$(id);

        if(element){

            element.innerText="—";

        }

    });

    if($("signal")){

        $("signal").innerText="WAIT";

        $("signal").className="wait";

    }

    document

        .querySelectorAll(".levelCard")

        .forEach(card=>{

            card.classList.remove(

                "closest"

            );

        });

}

// ======================================================
// AUTO PAUSE WHEN TAB IS HIDDEN
// ======================================================

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(document.hidden){

            stopMonitoring();

        }

        else if(currentLevels){

            startMonitoring();

        }

    }

);

// ======================================================
// DEFAULT DATES
// ======================================================

window.addEventListener(

    "load",

    ()=>{

        const today=new Date();

        const previous=new Date();

        previous.setMonth(

            previous.getMonth()-1

        );

        if(fromDate){

            fromDate.value=

                previous

                .toISOString()

                .slice(0,10);

        }

        if(toDate){

            toDate.value=

                today

                .toISOString()

                .slice(0,10);

        }

        console.log(

            "================================"

        );

        console.log(

            "Reduction Tape Scanner Loaded"

        );

        console.log(

            "Backend:",

            API

        );

        console.log(

            "================================"

        );

    }

);

// ======================================================
// END OF dashboard.js
// ======================================================
