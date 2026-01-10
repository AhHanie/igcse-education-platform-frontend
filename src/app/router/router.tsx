import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "@pages/HomePage";
import AboutPage from "@pages/AboutPage";
import LoginPage from "@pages/LoginPage";
import SignupPage from "@pages/SignupPage";
import NotFoundPage from "@pages/NotFoundPage";
import routes from "../../routes";

export const AppRouter: React.FC = () => {

    const getRoutes = (routes: RoutesType[]): any => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };
  return (
    <Routes>
      {getRoutes(routes)}
     <Route path="/*" element={<Navigate to="/auth/not-found" replace />} />
    </Routes>
  );
};
