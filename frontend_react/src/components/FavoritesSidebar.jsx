import React from 'react';

// PUBLIC_INTERFACE
function FavoritesSidebar({ favorites, onSelect, onRemove }) {
  /** Sidebar listing favorite locations with click-to-load and remove action. */
  return (
    <aside className="sidebar" aria-label="Favorite locations">
      <div className="sidebar-header">Favorites</div>
      {favorites.length === 0 ? (
        <div className="sidebar-empty">No favorites yet. Search and add.</div>
      ) : (
        <ul className="fav-list">
          {favorites.map((f) => {
            const label = `${f.name}${f.admin1 ? ', ' + f.admin1 : ''}${f.country ? ', ' + f.country : ''}`;
            return (
              <li key={`${f.name}-${f.latitude}-${f.longitude}`} className="fav-item">
                <button className="fav-select" onClick={() => onSelect(f)} aria-label={`Open ${label}`}>
                  {label}
                </button>
                <button className="fav-remove" onClick={() => onRemove(f)} aria-label={`Remove ${label}`}>
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export default React.memo(FavoritesSidebar);
