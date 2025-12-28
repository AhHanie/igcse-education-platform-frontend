import React from "react";
import { useLocation } from "react-router-dom";
import { AppRouter } from "./app/router/router";
import MainLayout from "./components/layout/MainLayout";
import { useThemeMode } from "./hooks/useThemeMode";

const App: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";

  // Initialize theme mode for all pages
  useThemeMode();

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
