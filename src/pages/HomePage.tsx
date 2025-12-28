import React from "react";

const HomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Home</h1>
      <p className="text-base text-foreground">
        This is the home page. Below is a simple counter implemented with
        Zustand and shadcn/ui.
      </p>
    </div>
  );
};

export default HomePage;
