'use client';

import React, { useState, useEffect } from 'react';
import { ThemeContext } from '../themeContext';

const THEME_STORAGE_KEY = 'vidmetrics-theme';

export function ThemeLayout({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={`min-h-screen font-sans ${isDarkMode ? 'dark bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-950'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
