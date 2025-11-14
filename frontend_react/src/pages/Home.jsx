import React, { useEffect, useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import UnitsToggle from '../components/UnitsToggle';
import FavoritesSidebar from '../components/FavoritesSidebar';
import CurrentWeatherCard from '../components/CurrentWeatherCard';
import DailyForecast from '../components/DailyForecast';
import HourlyChart from '../components/HourlyChart';
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

  // Initial behavior: Do not auto-trigger geolocation; instead show modal if no selected.
  useEffect(() => {
    if (!selected) {
      setShowLocationModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const locationLabel = selected
    ? `${selected.name}${selected.admin1 ? ', ' + selected.admin1 : ''}${selected.country ? ', ' + selected.country : ''}`
    : '—';

  const handleAddFavorite = () => {
    if (!selected) return;
    const exists = favorites.some(f => f.name === selected.name && f.latitude === selected.latitude && f.longitude === selected.longitude);
    if (!exists) setFavorites([selected, ...favorites].slice(0, 12));
  };
  const handleRemoveFavorite = (geo: GeoResult) => {
    setFavorites(favorites.filter(f => !(f.latitude === geo.latitude && f.longitude === geo.longitude && f.name === geo.name)));
  };

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
    } catch (e) {
      // If error code is PERMISSION_DENIED or message indicates blocked, keep modal with guidance and keep banner available
      setGeoMessage('Location unavailable or permission denied.');
      setPermissionBlocked(true);
      // keep modal open to show guidance
      setTimeout(() => setGeoMessage(''), 4000);
    } finally {
      setLocating(false);
    }
  };

  const handleUseMyLocation = async () => {
    // header "Use my location" button preserved
    await attemptDetectLocation();
  };

  const handleAllowFromModal = async () => {
    await attemptDetectLocation();
  };

  const handleSkipFromModal = () => {
    // Let user proceed without location; keep banner available
    setShowLocationModal(false);
    setDismissedBanner(false);
  };

  const showBanner = !selected && !dismissedBanner;

  return (
    <div>
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
              <SearchBar onSelect={(g) => setSelected(g)} />
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
          onSelect={(g) => setSelected(g)}
          onRemove={handleRemoveFavorite}
        />

        <section className="content-grid" aria-live="polite">
          {error && <div className="card"><div className="error">{error}</div></div>}
          {loading && <div className="card"><div className="muted">Loading weather…</div></div>}

          <CurrentWeatherCard locationLabel={locationLabel} current={forecast?.current || null} units={normalizedUnits} />

          <div className="row-2">
            <DailyForecast items={forecast?.daily || []} units={normalizedUnits} />
            <HourlyChart points={forecast?.hourly || []} units={normalizedUnits} />
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
