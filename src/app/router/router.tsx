import React from "react";
import { Routes, Route } from "react-router-dom";
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
      {/* <Route path="/" element={<HomePage />} /> */}
      {/* <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<NotFoundPage />} /> */}
      {getRoutes(routes)}
    </Routes>
  );
};
