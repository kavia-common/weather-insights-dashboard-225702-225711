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
- Responsive, accessible UI

## Getting Started
```bash
npm install
npm start
```
Open http://localhost:3000

## Environment (optional)
Create `.env` from `.env.example` to override:
- `REACT_APP_API_BASE` (default: https://api.open-meteo.com)

## Notes
- No API key required.
- Data source: https://open-meteo.com/
