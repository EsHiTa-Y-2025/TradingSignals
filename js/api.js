// =========================================
// Reduction Tape API
// =========================================

const API_BASE =
    location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://tradingsignals-5g76.onrender.com";

window.API_BASE = "https://tradingsignals-5g76.onrender.com/api";

// =========================================
// Generic Request
// =========================================

async function request(url) {

    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Server Error");
    }

    return data;

}

// =========================================
// Search Company
// =========================================

async function searchCompany(query) {

    if (!query) return [];

    const data = await request(

        `${API_BASE}/api/search?q=${encodeURIComponent(query)}`

    );

    return data.results;

}

// =========================================
// Calculate Reduction Tape
// =========================================

async function calculateTape(

    symbol,

    start,

    end

) {

    return request(

        `${API_BASE}/api/tape?symbol=${symbol}&start=${start}&end=${end}`

    );

}

// =========================================
// Live Monitor
// =========================================

async function getLiveData(

    symbol,

    start,

    end

) {

    return request(

        `${API_BASE}/api/live?symbol=${symbol}&start=${start}&end=${end}`

    );

}
