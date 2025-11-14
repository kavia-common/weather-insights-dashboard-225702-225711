//
// CRA-like service worker registration with safe controls
//

// PUBLIC_INTERFACE
export function register(config) {
  /** Registers the service worker located at /service-worker.js when in production builds.
   *
   * @param {Object} config - Optional lifecycle callbacks: onUpdate, onSuccess
   */
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Service worker won't work if PUBLIC_URL is on a different origin
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
      registerValidSW(swUrl, config);
    });
  }
}

// PUBLIC_INTERFACE
export function unregister() {
  /** Unregisters any existing service workers for this scope. */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister().catch(() => {});
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      if (config && typeof config.onSuccess === 'function') {
        registration.addEventListener('updatefound', () => {
          // noop; will trigger on update
        });
      }

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available; please refresh.
              config && config.onUpdate && config.onUpdate(registration);
            } else {
              // Content is cached for offline use.
              config && config.onSuccess && config.onSuccess(registration);
            }
          }
        };
      };
    })
    .catch(() => {
      // Silently ignore registration errors in UI
    });
}
