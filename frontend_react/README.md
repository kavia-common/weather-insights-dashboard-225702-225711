# Weather Dashboard (Open‑Meteo)

A modern React single‑page app showing current weather, 7‑day forecast, and hourly chart for searched cities. No login. Ocean Professional theme.

## Features
- City search using Open‑Meteo Geocoding
- Current conditions card (icon, temp, feels like, wind, humidity)
- 7‑day forecast grid
- Hourly temperature line chart (Recharts)
- Favorites (add/remove) persisted in localStorage
- Units toggle (°C/°F, km/h|mph, mm|in) persisted in localStorage
- Optional `?city=` query pre-selection hint
- Geolocation support (auto-detect on first load + "Use my location" button)
- Responsive, accessible UI

## Getting Started
```bash
npm install
npm start
```
Open http://localhost:3000

## Geolocation
- On first load, the app attempts to detect your current location via the browser Geolocation API (over HTTPS). If allowed and successful, the dashboard will load weather for “My Location”.
- If permission is denied, unavailable, or times out, the app falls back silently without interruption; you can still search for a city manually.
- A “Use my location” button is available in the header to trigger detection on demand.
- No location data is persisted beyond local selection in your browser (localStorage). No external geolocation services are used.

## Environment (optional)
Create `.env` from `.env.example` to override:
- `REACT_APP_API_BASE` (default: https://api.open-meteo.com)

## Notes
- No API key required.
- Data source: https://open-meteo.com/
