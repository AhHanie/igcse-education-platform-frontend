import React from "react";
import { useLocation } from "react-router-dom";
import { AppRouter } from "./app/router/router";
import MainLayout from "./components/layout/MainLayout";
import { useThemeMode } from "./hooks/useThemeMode";
import { useAppStore } from "@/app/store/useAppStore";

const App: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";

  // Initialize theme mode for all pages
  useThemeMode();

  // Initialize app store - hydrates user state from storage on mount
  const fetchCurrentUser = useAppStore((state) => state.fetchCurrentUser);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Fetch current user on mount if we think we're authenticated
  React.useEffect(() => {
    if (isAuthenticated && !isLoginPage && !isSignupPage) {
      fetchCurrentUser().catch(() => {
        // If fetch fails, user will be cleared by fetchCurrentUser
        console.error("Failed to fetch current user");
      });
    }
  }, []);

  // Don't wrap login page with MainLayout
  if (isLoginPage || isSignupPage) {
    return <AppRouter />;
  }

  return (
    <MainLayout>
      <AppRouter />
    </MainLayout>
  );
};

export default App;
