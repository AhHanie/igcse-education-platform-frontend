import React from "react";
import { AppRouter } from "./app/router/router";
import MainLayout from "./components/layout/MainLayout";

const App: React.FC = () => {
  return (
    <MainLayout>
      <AppRouter />
    </MainLayout>
  );
};

export default App;
