import React, { useEffect, useRef, useCallback } from 'react';

/**
 * LocationPermissionModal
 * Ocean Professional styled in-app prompt explaining the benefit of enabling location.
 * Shows primary CTA to trigger browser permission dialog and a secondary "Not now" option.
 *
 * Accessibility:
 * - Uses role="dialog" with aria-modal
 * - Traps focus within the modal while open
 * - ESC to close
 * - Returns focus to the invoking control on close
 * - Announces status text via aria-live
 */

// PUBLIC_INTERFACE
function LocationPermissionModal({
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
  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Collect focusable elements inside panel
  const getFocusable = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return [];
    const selectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    return Array.from(panel.querySelectorAll(selectors)).filter(
      (el) => el.offsetParent !== null || el.getClientRects().length > 0
    );
  }, []);

  // Handle ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
      if (e.key === 'Tab') {
        // Focus trap
        const focusables = getFocusable();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onClose, getFocusable]);

  // Manage focus when opening/closing
  useEffect(() => {
    if (open) {
      // store invoker
      previouslyFocusedRef.current = document.activeElement;
      // move focus into the modal
      const focusables = getFocusable();
      const toFocus =
        focusables.find((el) => el.getAttribute('data-autofocus') === 'true') ||
        focusables[0];
      setTimeout(() => {
        toFocus?.focus();
      }, 0);
    } else {
      // return focus to invoker if exists
      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === 'function') {
        setTimeout(() => prev.focus(), 0);
      }
    }
  }, [open, getFocusable]);

  if (!open) return null;

  const helpUrl = 'https://support.google.com/chrome/answer/142065?hl=en#zippy=%2Callow-or-block-location-access-for-a-specific-site';

  return (
    <div
      className="modal-backdrop"
      aria-hidden={!open}
      onClick={(e) => {
        // click outside to close
        if (e.target.classList.contains('modal-backdrop')) onClose?.();
      }}
    >
      <div
        ref={panelRef}
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

        {/* Status region with aria-live for permission guidance */}
        <p id="location-modal-desc" className="modal-desc">
          Get instant weather for where you are. We only use your location to load the current forecast in your browser.
          Nothing is stored on our servers.
        </p>

        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-status"
          style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
        >
          {blocked ? 'Location permission appears blocked. Use browser settings to enable and try again.' : 'Location permission can be enabled.'}
        </div>

        {blocked && (
          <div className="modal-alert" role="status" aria-live="polite">
            We couldn’t access your location. It may be blocked in your browser settings.
            <br />
            <span className="muted">
              Tip: Enable location permissions for this site, then click “Allow location” again. See{' '}
              <a href={helpUrl} target="_blank" rel="noreferrer">how to enable location</a>.
            </span>
          </div>
        )}

        <div className="modal-actions" role="group" aria-label="Location permission actions">
          <button
            className="btn-primary"
            onClick={onAllow}
            aria-label="Allow location"
            data-autofocus="true"
          >
            Allow location
          </button>
          <button className="btn-ghost" onClick={onSkip} aria-label="Not now">
            Not now
          </button>
        </div>

        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close dialog"
          title="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default React.memo(LocationPermissionModal);
