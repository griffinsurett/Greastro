// src/hooks/useTheme.ts
import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { getStorageItem } from '@/utils/storage';

export type Theme = 'light' | 'dark';

/**
 * Theme hook for managing light/dark mode
 * 
 * Features:
 * - Sets `data-theme` and `color-scheme` on <html>
 * - Updates <meta name="theme-color"> from computed --color-bg
 * - Persists user choice via localStorage
 * - Follows OS preference when no stored preference exists
 * - Syncs across browser tabs
 */
export function useTheme() {
  // Get initial theme: localStorage > OS preference > 'light' fallback
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    
    try {
      const stored = getStorageItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      
      // No stored preference - check OS preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  };

  const [theme, setTheme] = useLocalStorage<Theme>(
    'theme',
    getInitialTheme,
    { 
      raw: true, 
      validate: (v): v is Theme => v === 'light' || v === 'dark',
      syncTabs: true
    }
  );

  // Apply theme to DOM
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;

    // 1) Set data-theme attribute for CSS
    root.setAttribute('data-theme', theme);
    
    // 2) Set color-scheme for native browser elements
    root.style.colorScheme = theme;

    // 3) Update theme-color meta tag from CSS variable
    try {
      const bgColor = getComputedStyle(root)
        .getPropertyValue('--color-bg')
        .trim();

      if (bgColor) {
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'theme-color');
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', bgColor);
      }
    } catch (error) {
      console.warn('Failed to update theme-color meta tag:', error);
    }
  }, [theme]);

  // Listen to OS preference changes (only when no explicit user preference)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const stored = getStorageItem('theme');
        // Only auto-switch if user hasn't explicitly set a preference
        if (stored !== 'light' && stored !== 'dark') {
          setTheme(e.matches ? 'dark' : 'light');
        }
      } catch {
        // Ignore errors
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [setTheme]);

  // Utility function to toggle theme
  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark'
  };
}