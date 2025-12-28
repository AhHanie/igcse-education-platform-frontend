import { useState, useCallback, useEffect } from "react";

const THEME_STORAGE_KEY = "theme-mode";

const getInitialTheme = (): "light" | "dark" => {
  // Check localStorage first
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Fall back to system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
};

export const useThemeMode = () => {
  const [mode, setMode] = useState<"light" | "dark">(() => getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme class to HTML element
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Persist to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setTheme = useCallback((theme: "light" | "dark") => {
    setMode(theme);
  }, []);

  return { mode, toggleMode, setTheme };
};
