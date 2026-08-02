/*
========================================================

Reduction Tape Scanner

WebSocket Placeholder

Currently the application refreshes every second using
HTTP requests.

In Version 2 this file can be replaced with a WebSocket
or Server Sent Events implementation so the dashboard
updates instantly whenever the market price changes.

========================================================
*/

let websocket = null;

export function connectWebSocket() {

    console.log("WebSocket module loaded.");

    // Future implementation:
    //
    // websocket = new WebSocket("wss://your-backend/live");
    //
    // websocket.onopen = () => {
    //     console.log("Connected");
    // };
    //
    // websocket.onmessage = (event) => {
    //     const data = JSON.parse(event.data);
    //     updateDashboard(data);
    // };
    //
    // websocket.onerror = (err) => {
    //     console.error(err);
    // };
    //
    // websocket.onclose = () => {
    //     console.log("Disconnected");
    // };

}

export function disconnectWebSocket() {

    if (websocket) {

        websocket.close();

        websocket = null;

    }

}
