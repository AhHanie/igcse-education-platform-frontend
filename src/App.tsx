import React, { type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppRouter } from "./app/router/router";
import MainLayout from "./components/layout/MainLayout";
import { useThemeMode } from "./hooks/useThemeMode";
import AuthLayout from "./components/layout/AuthLayout";

const App: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";

  // Initialize theme mode for all pages
  useThemeMode();

  interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  // const auth = localStorage.getItem("token");
  const auth = true ; // Replace with actual authentication logic
  return auth ? <>{children}</> : <Navigate to="/auth/sign-in" replace />;
};


  // Don't wrap login page with MainLayout
  if (isLoginPage || isSignupPage) {
    return <AppRouter />;
  }

  return (
    <Routes>
      <Route path="auth/*" element={<AuthLayout />} />
      <Route
          path="admin/*"
          element={
            <PrivateRoute>
              <MainLayout>
                <AppRouter />
              </MainLayout>
            </PrivateRoute>
          }
        />
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="admin/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/*" element={<Navigate to="/auth/not-found" replace />} />

    </Routes>
  );
};

export default App;
