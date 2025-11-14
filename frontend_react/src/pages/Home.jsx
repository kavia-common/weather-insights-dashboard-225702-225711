import React, { useEffect, useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import UnitsToggle from '../components/UnitsToggle';
import FavoritesSidebar from '../components/FavoritesSidebar';
import CurrentWeatherCard from '../components/CurrentWeatherCard';
import DailyForecast from '../components/DailyForecast';
import HourlyChart from '../components/HourlyChart';
import HourlyPrecipChart from '../components/HourlyPrecipChart';
import HourlyWindChart from '../components/HourlyWindChart';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchForecast, normalizeUnits, defaultUnits } from '../lib/openMeteo.js';
import { detectMyLocation } from '../lib/geolocation.js';
import LocationPermissionModal from '../components/LocationPermissionModal';

export default function Home() {
  /** Main dashboard page: header, sidebar, content panels. */
  const [units, setUnits] = useLocalStorage('units', defaultUnits);
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [selected, setSelected] = useLocalStorage('selected_location', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forecast, setForecast] = useState(null);

  // Geolocation transient UI state
  const [locating, setLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState('');

  // In-app location modal and banner state
  const [showLocationModal, setShowLocationModal] = useLocalStorage('show_location_modal', true);
  const [permissionBlocked, setPermissionBlocked] = useLocalStorage('location_blocked', false);
  const [dismissedBanner, setDismissedBanner] = useLocalStorage('location_banner_dismissed', false);

  // Offline / cached banner state
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [servedFromCache, setServedFromCache] = useState(false);

  // One-time onboarding flag: avoid auto geolocation after first-run
  const [geoOnboarded, setGeoOnboarded] = useState(() => {
    try {
      return window.localStorage.getItem('geo_onboarded') === 'true';
    } catch {
      return false;
    }
  });

  const normalizedUnits = useMemo(() => normalizeUnits(units), [units]);

  // Restore from ?city= query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    if (city && !selected) {
      // If city provided, just set a display placeholder; user should search to resolve coords.
      setError(`Tip: Use the search bar to resolve "${city}" and select the result.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // First-load only geolocation attempt when no selected and no favorites and not onboarded
  useEffect(() => {
    const shouldAttempt =
      !geoOnboarded &&
      !selected &&
      (!favorites || favorites.length === 0);

    if (!shouldAttempt) {
      // If a location already exists or we've onboarded, don't prompt automatically
      if (!selected) {
        // For new users without auto attempt, show modal gently
        setShowLocationModal(true);
      }
      return;
    }

    // Attempt geolocation silently on first load
    const run = async () => {
      try {
        setLocating(true);
        setGeoMessage('Detecting location…');
        const my = await detectMyLocation({
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60000,
          label: 'My Location'
        });
        setSelected(my); // Persisted by hook
        setPermissionBlocked(false);
        setShowLocationModal(false);
        setDismissedBanner(true);
        setGeoMessage('');
      } catch (e) {
        // Do not block; show modal/banner for manual enable
        setGeoMessage('Location unavailable or permission denied.');
        setPermissionBlocked(true);
        setShowLocationModal(true);
        setTimeout(() => setGeoMessage(''), 3000);
      } finally {
        setLocating(false);
        try {
          window.localStorage.setItem('geo_onboarded', 'true');
        } catch {
          // ignore
        }
        setGeoOnboarded(true);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount for first-load behavior

  // Fetch on selected or units change
  useEffect(() => {
    const doFetch = async () => {
      if (!selected) return;
      try {
        setLoading(true);
        setError('');
        const data = await fetchForecast(selected.latitude, selected.longitude, normalizedUnits);
        setForecast(data);
      } catch {
        setError('Failed to load weather. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    doFetch();
  }, [selected, normalizedUnits]);

  // Listen for online/offline changes to surface offline banner
  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to SW cache-hit messages to show "served from cache" banner briefly
  useEffect(() => {
    const onCacheHit = (e) => {
      // If the message is for Open‑Meteo resource or same-origin static, show a banner
      setServedFromCache(true);
      // Auto hide after 4 seconds
      const id = setTimeout(() => setServedFromCache(false), 4000);
      return () => clearTimeout(id);
    };
    window.addEventListener('app:cache-hit', onCacheHit);
    return () => window.removeEventListener('app:cache-hit', onCacheHit);
  }, []);

  const locationLabel = selected
    ? `${selected.name}${selected.admin1 ? ', ' + selected.admin1 : ''}${selected.country ? ', ' + selected.country : ''}`
    : '—';

  const persistGeoOnboarded = () => {
    try {
      window.localStorage.setItem('geo_onboarded', 'true');
    } catch {
      // ignore
    }
    setGeoOnboarded(true);
  };

  const handleAddFavorite = () => {
    if (!selected) return;
    const exists = favorites.some(f => f.name === selected.name && f.latitude === selected.latitude && f.longitude === selected.longitude);
    if (!exists) setFavorites([selected, ...favorites].slice(0, 12));
  };
  const handleRemoveFavorite = (geo: GeoResult) => {
    setFavorites(favorites.filter(f => !(f.latitude === geo.latitude && f.longitude === geo.longitude && f.name === geo.name)));
  };

  // On-demand location detection (header button) — does not alter onboarding policy
  const attemptDetectLocation = async () => {
    try {
      setLocating(true);
      setGeoMessage('Detecting location…');
      const my = await detectMyLocation({ enableHighAccuracy: false, timeout: 8000, maximumAge: 60000, label: 'My Location' });
      setSelected(my);
      setGeoMessage('');
      setPermissionBlocked(false);
      setShowLocationModal(false);
      setDismissedBanner(true); // user enabled successfully; hide banner
      persistGeoOnboarded(); // mark as onboarded so we don't auto-prompt next loads
    } catch (e) {
      setGeoMessage('Location unavailable or permission denied.');
      setPermissionBlocked(true);
      setTimeout(() => setGeoMessage(''), 4000);
    } finally {
      setLocating(false);
    }
  };

  const handleUseMyLocation = async () => {
    // header "Use my location" button preserved — on-demand refresh
    await attemptDetectLocation();
  };

  const handleAllowFromModal = async () => {
    await attemptDetectLocation();
  };

  const handleSkipFromModal = () => {
    // Let user proceed without location; keep banner available
    setShowLocationModal(false);
    setDismissedBanner(false);
    persistGeoOnboarded(); // avoid re-prompting in subsequent loads
  };

  const showBanner = !selected && !dismissedBanner;

  return (
    <div>
      {/* Offline/Cached banner */}
      {(offline || servedFromCache) && (
        <div className="top-banner" role="region" aria-label="Offline status banner">
          <div className="inner">
            <div className="msg">
              <span aria-hidden>⚡</span>
              <span>
                {offline
                  ? 'You are offline. Showing cached content where available.'
                  : 'Showing cached content while updating in the background.'}
              </span>
            </div>
            {!offline && (
              <div className="actions">
                <button className="link" onClick={() => setServedFromCache(false)} aria-label="Dismiss cached notice">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top banner keeps CTA accessible when modal is dismissed or permission denied */}
      {showBanner && (
        <div className="top-banner" role="region" aria-label="Location enable banner">
          <div className="inner">
            <div className="msg">
              <span aria-hidden>📍</span>
              <span>Enable location for faster local weather.</span>
            </div>
            <div className="actions">
              <button className="btn-outline" onClick={() => setShowLocationModal(true)} aria-label="Enable location">
                Enable location
              </button>
              <button className="link" onClick={() => setDismissedBanner(true)} aria-label="Dismiss">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="header">
        <div className="header-inner">
          <div className="brand">Weather Dashboard</div>
          <div className="header-actions">
            <div style={{ minWidth: 260 }}>
              <SearchBar onSelect={(g) => { setSelected(g); persistGeoOnboarded(); }} />
              <div className="search-status" aria-live="polite">
                {locating && <span className="muted">Detecting location…</span>}
                {!locating && geoMessage && <span className="error">{geoMessage}</span>}
              </div>
            </div>
            {/* Keep header CTA accessible */}
            <button
              className="btn-outline"
              onClick={() => setShowLocationModal(true)}
              aria-label="Enable location"
              title="Enable location"
            >
              Enable location
            </button>
            <button
              className="btn"
              onClick={handleUseMyLocation}
              aria-label="Use my current location"
              disabled={locating}
              title="Use my location"
            >
              📍 Use my location
            </button>
            <ThemeToggle />
            <UnitsToggle units={normalizedUnits} onChange={setUnits} />
            <button className="btn" onClick={handleAddFavorite} aria-label="Add to favorites" disabled={!selected}>
              ☆ Favorite
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <FavoritesSidebar
          favorites={favorites}
          onSelect={(g) => { setSelected(g); persistGeoOnboarded(); }}
          onRemove={handleRemoveFavorite}
        />

        <section className="content-grid" aria-live="polite">
          {error && <div className="card"><div className="error">{error}</div></div>}
          {loading && <div className="card"><div className="muted">Loading weather…</div></div>}

          <CurrentWeatherCard locationLabel={locationLabel} current={forecast?.current || null} units={normalizedUnits} />

          <div className="row-2">
            <DailyForecast
              items={forecast?.daily || []}
              units={normalizedUnits}
            />
            <HourlyChart
              points={forecast?.hourly || []}
              units={normalizedUnits}
            />
            <HourlyPrecipChart
              points={forecast?.hourly || []}
              units={normalizedUnits}
            />
            <HourlyWindChart
              points={forecast?.hourly || []}
              units={normalizedUnits}
            />
          </div>
        </section>
      </main>

      <LocationPermissionModal
        open={showLocationModal && !selected}
        blocked={permissionBlocked}
        onAllow={handleAllowFromModal}
        onSkip={handleSkipFromModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}
