import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "@pages/HomePage";
import AboutPage from "@pages/AboutPage";
import LoginPage from "@pages/LoginPage";
import SignupPage from "@pages/SignupPage";
import NotFoundPage from "@pages/NotFoundPage";
import StudentManagementPage from "@/pages/StudentManagementPage";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/students/management" element={<StudentManagementPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
