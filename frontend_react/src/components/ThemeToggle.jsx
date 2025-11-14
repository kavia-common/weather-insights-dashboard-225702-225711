import React, { useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * ThemeToggle
 * Toggle between light and dark themes, persisting preference and applying
 * the [data-theme] attribute on document.documentElement for CSS variables.
 *
 * Accessibility:
 * - Uses aria-pressed to announce current state
 * - Keyboard and focus-visible friendly with consistent styling from theme.css
 */

// PUBLIC_INTERFACE
export default function ThemeToggle() {
  /** Button to toggle site theme with persistence and OS preference fallback. */
  const [storedTheme, setStoredTheme] = useLocalStorage('theme', null);

  // Detect system preference only if user hasn't explicitly chosen
  const systemPrefersDark = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  const theme = storedTheme || (systemPrefersDark ? 'dark' : 'light');

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    } catch {
      // noop if running in non-DOM env
    }
  }, [theme]);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setStoredTheme(next);
  };

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  const icon = theme === 'dark' ? '🌙' : '☀️';
  const text = theme === 'dark' ? 'Dark' : 'Light';

  return (
    <button
      className="btn-ghost theme-toggle"
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      aria-label={label}
      title={label}
    >
      <span style={{ marginRight: 6 }} aria-hidden>{icon}</span>
      {text}
    </button>
  );
}
