import React from 'react';

/**
 * LocationPermissionModal
 * Ocean Professional styled in-app prompt explaining the benefit of enabling location.
 * Shows primary CTA to trigger browser permission dialog and a secondary "Not now" option.
 *
 * Accessibility:
 * - Uses role="dialog" with aria-modal
 * - Focusable actions, ESC to close delegated to parent keyboard handling if needed
 */

// PUBLIC_INTERFACE
export default function LocationPermissionModal({
  open,
  onAllow,
  onSkip,
  onClose,
  blocked = false
}) {
  /** Renders a modal asking the user to enable location, with guidance if blocked.
   *
   * @param {boolean} open - Whether the modal is visible
   * @param {Function} onAllow - Called when the user clicks "Allow location"
   * @param {Function} onSkip - Called when the user clicks "Not now"
   * @param {Function} onClose - Called when the user dismisses the modal
   * @param {boolean} blocked - When true, show inline guidance for blocked/denied permissions
   */
  if (!open) return null;

  const helpUrl = 'https://support.google.com/chrome/answer/142065?hl=en#zippy=%2Callow-or-block-location-access-for-a-specific-site';

  return (
    <div
      className="modal-backdrop"
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target.classList.contains('modal-backdrop')) onClose?.();
      }}
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        aria-describedby="location-modal-desc"
      >
        <div className="modal-header">
          <div className="modal-icon" aria-hidden>📍</div>
          <h2 id="location-modal-title">Enable location for local weather</h2>
        </div>
        <p id="location-modal-desc" className="modal-desc">
          Get instant weather for where you are. We only use your location to load the current forecast in your browser.
          Nothing is stored on our servers.
        </p>

        {blocked && (
          <div className="modal-alert">
            We couldn’t access your location. It may be blocked in your browser settings.
            <br />
            <span className="muted">
              Tip: Enable location permissions for this site, then click “Allow location” again. See{' '}
              <a href={helpUrl} target="_blank" rel="noreferrer">how to enable location</a>.
            </span>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-primary" onClick={onAllow} aria-label="Allow location">
            Allow location
          </button>
          <button className="btn-ghost" onClick={onSkip} aria-label="Not now">
            Not now
          </button>
        </div>

        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  );
}
