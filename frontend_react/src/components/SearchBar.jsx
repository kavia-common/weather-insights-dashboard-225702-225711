import React, { useEffect, useRef, useState } from 'react';
import { geocodeCity } from '../lib/openMeteo.js';

// PUBLIC_INTERFACE
function SearchBar({ onSelect, initialQuery = '' }) {
  /** Search bar hitting geocoding API and allowing selection of top results. */
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    const id = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const r = await geocodeCity(query, 5);
        setResults(r);
        setOpen(true);
      } catch (e) {
        setError('Unable to search. Press Enter to retry.');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      try {
        setLoading(true);
        const r = await geocodeCity(query, 5);
        setResults(r);
        setOpen(true);
      } catch {
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelect = (geo) => {
    setQuery(`${geo.name}${geo.admin1 ? ', ' + geo.admin1 : ''}${geo.country ? ', ' + geo.country : ''}`);
    setOpen(false);
    onSelect(geo);
  };

  return (
    <div className="searchbar">
      <input
        aria-label="Search city"
        className="search-input"
        type="text"
        placeholder="Search city..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length && setOpen(true)}
      />
      <div className="search-status">
        {loading && <span className="muted">Searching…</span>}
        {error && <span className="error">{error}</span>}
      </div>
      {open && results.length > 0 && (
        <ul className="results" ref={listRef} role="listbox" aria-label="Search results">
          {results.map((r) => {
            const label = `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}${r.country ? ', ' + r.country : ''}`;
            return (
              <li
                key={`${r.latitude},${r.longitude},${r.name}`}
                role="option"
                tabIndex={0}
                onClick={() => handleSelect(r)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(r)}
              >
                <div className="result-title">{label}</div>
                <div className="result-sub">Lat {Number(r.latitude).toFixed(2)}, Lon {Number(r.longitude).toFixed(2)}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default React.memo(SearchBar);
