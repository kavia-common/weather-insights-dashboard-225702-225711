# Weather Dashboard (Open‑Meteo)

A modern React single‑page app showing current weather, 7‑day forecast, and hourly chart for searched cities. No login. Ocean Professional theme.

## Features
- City search using Open‑Meteo Geocoding API (no API key)
- Current conditions card (icon, temp, feels like, wind, humidity)
- 7‑day forecast grid
- Hourly temperature line chart (Recharts)
- Favorites (add/remove) persisted in localStorage
- Units toggle (°C/°F, km/h|mph, mm|in) persisted in localStorage
- Optional `?city=` query pre-selection hint
- Geolocation support (first‑load attempt + on‑demand "Use my location")
- Responsive, accessible UI

## Getting Started
```bash
npm install
npm start
```
Open http://localhost:3000

## Geolocation
- First visit only: If you have no saved city and no favorites, the app will attempt to detect your current location via the browser Geolocation API (over HTTPS). On success, “My Location” is selected and persisted.
- After you select any location (via geolocation or search), the app sets `localStorage.geo_onboarded=true` and persists the chosen location under `selected_location`. On subsequent loads the app will NOT auto‑retry geolocation; it sticks to your last selected city.
- If permission is denied, unavailable, or times out on first visit, the app shows a gentle prompt and you can still search manually. You can also skip, which sets `geo_onboarded=true` to avoid re‑prompting next time.
- The header still offers “📍 Use my location” to perform an on‑demand refresh using your current coordinates at any time. This does not change the default behavior besides updating the selected city.
- Data privacy: Location selection is stored only in your browser (localStorage). No external geolocation services are used.

### LocalStorage Keys
- `selected_location` — the last selected city object
- `favorites` — array of saved cities
- `units` — unit preferences
- `geo_onboarded` — `"true"` once first‑load geolocation onboarding has been completed or skipped
- `show_location_modal`, `location_blocked`, `location_banner_dismissed` — UI state for onboarding prompts

## Environment
Create `.env` from `.env.example` if needed and set:
- `REACT_APP_API_BASE` (optional; default: https://api.open-meteo.com)

Notes:
- Units mapping: the app maps °C/°F toggle to Open‑Meteo `temperature_unit=celsius|fahrenheit`, `wind_speed_unit=kmh|mph`, and `precipitation_unit=mm|inch`.
- Icons and condition labels use WMO weather codes from Open‑Meteo.
- Open‑Meteo requires no API key. If you see `REACT_APP_OPENWEATHER_API_KEY` in `.env.example`, it is unused when Open‑Meteo is active.
- Data source: https://open-meteo.com/
