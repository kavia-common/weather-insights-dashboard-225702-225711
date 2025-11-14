import React, { useEffect, useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import UnitsToggle from '../components/UnitsToggle';
import FavoritesSidebar from '../components/FavoritesSidebar';
import CurrentWeatherCard from '../components/CurrentWeatherCard';
import DailyForecast from '../components/DailyForecast';
import HourlyChart from '../components/HourlyChart';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { fetchForecast, normalizeUnits, defaultUnits } from '../lib/openMeteo.js';

export default function Home() {
  /** Main dashboard page: header, sidebar, content panels. */
  const [units, setUnits] = useLocalStorage('units', defaultUnits);
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [selected, setSelected] = useLocalStorage('selected_location', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forecast, setForecast] = useState(null);

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

  return (
    <div>
      <header className="header">
        <div className="header-inner">
          <div className="brand">Weather Dashboard</div>
          <div className="header-actions">
            <div style={{ minWidth: 260 }}>
              <SearchBar onSelect={(g) => setSelected(g)} />
            </div>
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
    </div>
  );
}
