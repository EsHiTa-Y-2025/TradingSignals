# Reduction Tape Scanner

A lightweight trading scanner that calculates the Reduction Tape values from any stock or index using Yahoo Finance and continuously monitors live market prices to detect predefined reversal scenarios.

---

# Features

- Search stocks by company name
- Historical OHLC download from Yahoo Finance
- Custom date-range calculations
- Automatic Trade Point calculation
- Digital Root calculation
- Upper TDP
- Lower TDP
- SP
- BP
- Live market monitoring
- Scenario detection
- BUY / SELL / WAIT signals
- Fast in-memory caching
- Deployable on Render + GitHub Pages

---

# Tech Stack

## Frontend

- HTML5
- CSS3
- Vanilla JavaScript

## Backend

- Node.js
- Express

## Data Provider

Yahoo Finance

---

# Project Structure

```
ReductionTape/

backend/

    config/
        constants.js

    cache/
        cache.js

    calculations/
        reduction.js
        indicators.js
        scenarios.js

    services/
        yahoo.js
        livePrice.js

    routes/
        search.js
        tape.js
        live.js

    server.js
    package.json


frontend/

    css/
        style.css

    js/
        api.js
        dashboard.js
        websocket.js

    index.html

README.md
```

---

# Installation

Clone the repository

```
git clone YOUR_REPOSITORY_URL
```

Install dependencies

```
cd backend

npm install
```

Run backend

```
npm start
```

Backend runs on

```
http://localhost:3000
```

---

# Frontend

Simply open

```
frontend/index.html
```

or deploy the frontend to GitHub Pages.

---

# API Endpoints

## Search

```
GET

/api/search?q=apple
```

Returns

```
Apple

↓

AAPL
```

---

## Tape

```
GET

/api/tape

Parameters

symbol

start

end
```

Returns

- High
- Low
- Spread
- Digital Root
- Trade Point
- Upper TDP
- Lower TDP
- SP
- BP

---

## Live

```
GET

/api/live

Parameters

symbol

start

end
```

Returns

- Live Price
- Scenario
- BUY / SELL
- Distance from Upper
- Distance from Lower
- Distance from SP
- Distance from BP

---

# Deployment

Backend

Deploy to

Render

After deployment copy the Render URL.

Example

```
https://reduction-tape-api.onrender.com
```

Replace

```
const API_BASE =
"https://YOUR-RENDER-BACKEND.onrender.com"
```

inside

```
frontend/js/api.js
```

---

Frontend

Deploy

```
frontend/
```

to

GitHub Pages

---

# Future Improvements

- Multiple stock monitoring
- Watchlists
- Alerts
- Email notifications
- Telegram notifications
- WebSocket streaming
- TradingView overlay
- Historical signal backtesting
- Strategy statistics

---
