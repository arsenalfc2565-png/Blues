import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'blues_theme_preference';
const THEME_CHANGE_EVENT = 'blues_theme_changed';

/**
 * Returns the stored theme preference or 'system' by default.
 */
export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch (e) {
    console.error('Error reading theme from localStorage', e);
  }
  return 'light'; // Default to clean light mode for B2B storefront
}

/**
 * Resolves whether the current active theme is light or dark.
 */
export function getEffectiveTheme(theme: ThemeMode = getStoredTheme()): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  return theme;
}

/**
 * Applies the dark class to document.documentElement and stores preference.
 */
export function applyTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    console.error('Error saving theme to localStorage', e);
  }

  const effective = getEffectiveTheme(theme);
  const root = document.documentElement;

  if (effective === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Dispatch custom event so all reactive components update
  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, {
      detail: { theme, effective },
    })
  );
}

/**
 * Toggles between light and dark modes.
 */
export function toggleTheme(): 'light' | 'dark' {
  const currentEffective = getEffectiveTheme();
  const nextTheme: ThemeMode = currentEffective === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  return nextTheme;
}

/**
 * Initializes theme on initial script execution.
 */
export function initTheme(): void {
  if (typeof window === 'undefined') return;
  const stored = getStoredTheme();
  applyTheme(stored);

  // Listen to system preference changes if in system mode
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (getStoredTheme() === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener?.('change', handleChange);
  }
}

/**
 * React Hook for theme management
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme());
  const [isDark, setIsDark] = useState<boolean>(() => getEffectiveTheme() === 'dark');

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      const detail = e.detail || { theme: getStoredTheme(), effective: getEffectiveTheme() };
      setThemeState(detail.theme);
      setIsDark(detail.effective === 'dark');
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    applyTheme(newTheme);
  };

  const toggle = () => {
    toggleTheme();
  };

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme: toggle,
  };
}
