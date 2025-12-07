import { useState, useCallback } from "react";

export const useThemeMode = () => {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return { mode, toggleMode };
};
