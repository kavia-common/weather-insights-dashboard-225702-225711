# Weather Dashboard (Open‑Meteo)

A modern React single‑page app showing current weather, a 7‑day forecast, and multiple hourly charts for searched cities. No login. The UI follows the “Ocean Professional” theme with light/dark support, accessibility enhancements, and offline caching.

## Features
- City search using Open‑Meteo Geocoding API (no API key)
- Current conditions card (icon, temperature, feels like, wind, humidity)
- 7‑day forecast grid
- Hourly temperature chart (line, Recharts)
- Hourly precipitation chart (bars + probability area) with 24/48h toggle
- Hourly wind chart (speed + gusts) with 24/48h toggle
- Favorites (add/remove) persisted in localStorage
- Units toggle (°C/°F, km/h|mph, mm|in) persisted in localStorage
- Optional `?city=` query pre‑selection hint
- Geolocation support (first‑load attempt + on‑demand “Use my location”)
- Theme toggle (light/dark) with persistence and OS preference fallback
- Service worker for offline support; “offline/cached” banner feedback
- Responsive, accessible UI with keyboard navigation and ARIA labeling

## Getting Started
```bash
npm install
npm start
```
Open http://localhost:3000

## New Charts and Units Handling
The dashboard now includes precipitation and wind charts alongside the temperature chart. These charts consume the normalized hourly points produced by the Open‑Meteo integration and display values according to the selected units:
- Hourly Precipitation (src/components/HourlyPrecipChart.jsx): Visualizes precipitation amount and probability over 24 or 48 hours. The units banner reflects the active unit for depth (“mm” or “in”) and “%” for probability. Buttons for “24h” and “48h” are accessible and track state via aria‑pressed.
- Hourly Wind (src/components/HourlyWindChart.jsx): Displays wind speed and gusts with a 24/48h toggle. The chart’s axis and tooltip show the correct wind unit (“km/h” or “mph”).

Unit selection is centralized in Open‑Meteo utilities (src/lib/openMeteo.js). The app maps:
- temperature: celsius|fahrenheit → temperature_unit=celsius|fahrenheit
- wind: kmh|mph → wind_speed_unit=kmh|mph
- precip: mm|inch → precipitation_unit=mm|inch

The Units toggle (src/components/UnitsToggle.jsx) switches all three units together and persists the preference in localStorage. Charts and cards consistently render formatted units derived from the active settings.

## Theme Toggle and Persistence
The app supports light and dark themes. The ThemeToggle component (src/components/ThemeToggle.jsx) stores the user’s preference in localStorage under “theme” and applies it by setting the [data‑theme] attribute on the root element. If the user has not yet selected a theme, the app falls back to the operating system preference using prefers‑color‑scheme. The current theme is announced via aria‑pressed and the control is fully keyboard accessible. Theme variables and styles are defined in src/styles/theme.css and complemented by component‑level styles.

## Offline Support via Service Worker
This app registers a service worker in production builds to enable offline usage and faster repeat visits.

- Registration: index.js calls register from src/serviceWorkerRegistration.js. In production, CRA’s service worker file (/service‑worker.js) is registered on window load.
- Caching strategy: Static assets are precached by the build pipeline. Network requests served by the service worker may be fulfilled from cache first; when cached content is used, the app dispatches a CustomEvent (“app:cache‑hit”) and shows a brief “cached content” banner. If the browser is fully offline, an “offline” banner appears and cached content is rendered where available.
- Enabling: Build the app with npm run build and serve the production output (e.g., via a static server). The service worker is only active in production.
- Refreshing updates: When new content is available, the registration triggers onUpdate; you can customize this callback in index.js to prompt users to refresh. A normal hard refresh will also pick up new assets after the service worker activates.
- Banner behavior: Home.jsx listens for connectivity changes and SW “cache‑hit” events to show a top banner indicating either “You are offline…” or “Showing cached content while updating…”. Users can dismiss the cached notice.

To disable offline behavior locally during development, no action is required; CRA does not register the service worker in development mode.

## Accessibility Improvements
The UI incorporates several accessibility improvements across core interactions:
- Search: The search input is labeled. Results are rendered in a listbox with role="listbox" and options with role="option". Keyboard users can navigate into the results and press Enter to select an item.
- Charts: Each chart container has a descriptive aria‑label or aria‑labelledby and the 24h/48h controls form an accessible toggle group with aria‑pressed and live unit hints. Axes and legend labels are descriptive and tooltips include units.
- Location Permission Modal: The modal (src/components/LocationPermissionModal.jsx) uses role="dialog" with aria‑modal, traps focus while open, supports ESC to close, and returns focus to the invoker when closed. It also provides an aria‑live region for status text and clear guidance when permissions are blocked.
- Keyboard navigation: All buttons and interactive elements show visible focus styles and can be activated via keyboard.

## Tests
Run tests with:
```bash
npm test
```

The test suite covers:
- Charts render paths and controls:
  - src/__tests__/test_HourlyChart_render.test.jsx
  - src/__tests__/test_HourlyPrecipChart_render.test.jsx
  - src/__tests__/test_HourlyWindChart_render.test.jsx
- Accessibility and interactions:
  - src/__tests__/test_LocationPermissionModal_a11y.test.jsx (focus trap, ESC, focus return, blocked guidance)
  - src/__tests__/test_SearchBar_interactions.test.jsx (debounce timing, Enter to search, keyboard selection)
- Unit normalization:
  - src/__tests__/test_openMeteo_units.test.js

Setup notes:
- Jest DOM matchers are initialized in src/setupTests.js.
- If your environment lacks ResizeObserver and you later introduce chart sizing logic that depends on it, you may need to provide a test‑only mock in setupTests.js. The current tests do not require it because Recharts is wrapped in a fixed‑size container.

## Feature Flags and Environment Variables
Create `.env` from `.env.example` if needed. The container defines these environment variables (some are standard CRA/env placeholders, not all are used):

- REACT_APP_API_BASE: Optional. Base for Open‑Meteo API (default https://api.open-meteo.com). Used by src/lib/openMeteo.js.
- REACT_APP_BACKEND_URL, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED: Present for broader tooling compatibility; not currently consumed by this app’s code.
- REACT_APP_REACT_APP_OPENWEATHER_API_KEY: If integrating the optional OpenWeather backend (see src/lib/openWeather.js), set an API key here. The primary path uses Open‑Meteo and does not require any key.

Optional integrations and flags:
- Places/Alternate provider: The codebase includes an optional OpenWeather integration (src/lib/openWeather.js). By default, the app uses Open‑Meteo. If you switch to OpenWeather, you must set REACT_APP_REACT_APP_OPENWEATHER_API_KEY and wire the openWeather client where appropriate. When using OpenWeather, unit mapping behaves differently internally but charts and UI still show the normalized units.
- Feature flags: If you decide to gate features, you can leverage REACT_APP_FEATURE_FLAGS as a JSON string and parse it at runtime; this repository does not currently read it.

## Performance Optimizations
Several techniques are used to keep the UI responsive and reduce network overhead:
- In‑memory caching with TTL: src/lib/cache.js provides a lightweight cache used by Open‑Meteo client functions to avoid repeated network calls for the same inputs within a short window.
- In‑flight request de‑duplication: Identical concurrent requests are coalesced to a single fetch and shared response.
- Lazy loading of heavy components: Hourly charts are loaded via React.lazy and Suspense to minimize initial bundle size.
- Unit normalization and stable cache keys: Requests are keyed on coordinates and unit selections to maximize cache hit rate when toggling between metric/imperial.
- Service worker caching: Static assets are precached for faster reloads and limited offline capability.

Caveats:
- Cached responses may persist for a short period (default five minutes) and may not reflect immediate weather changes until the TTL expires or a hard refresh occurs.
- The service worker only runs in production; local development always hits the network unless the browser is offline and serving from previous caches.

## Geolocation
- First visit only: If you have no saved city and no favorites, the app will attempt to detect your current location via the browser Geolocation API (over HTTPS). On success, “My Location” is selected and persisted.
- After you select any location (via geolocation or search), the app sets `localStorage.geo_onboarded=true` and persists the chosen location under `selected_location`. On subsequent loads the app will not auto‑retry geolocation; it sticks to your last selected city.
- If permission is denied, unavailable, or times out on first visit, the app shows a gentle prompt and you can still search manually. You can also skip, which sets `geo_onboarded=true` to avoid re‑prompting next time.
- The header also offers “📍 Use my location” to perform an on‑demand refresh using your current coordinates at any time.
- Data privacy: Location selection is stored only in your browser (localStorage). No external geolocation services are used.

### LocalStorage Keys
- `selected_location` — the last selected city object
- `favorites` — array of saved cities
- `units` — unit preferences
- `theme` — light or dark
- `geo_onboarded` — `"true"` once first‑load geolocation onboarding has been completed or skipped
- `show_location_modal`, `location_blocked`, `location_banner_dismissed` — UI state for onboarding and banner prompts

## Environment Summary
- Units mapping: the app maps °C/°F to Open‑Meteo `temperature_unit=celsius|fahrenheit`, wind to `wind_speed_unit=kmh|mph`, and precipitation to `precipitation_unit=mm|inch`.
- Icons and condition labels use WMO weather codes from Open‑Meteo.
- Open‑Meteo requires no API key. If you see OpenWeather variables, they are optional for an alternate provider.
- Data source: https://open-meteo.com/
