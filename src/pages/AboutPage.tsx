import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">About</h1>
      <p className="text-base text-foreground">
        This project is built with Vite, React, TypeScript, React Router,
        Zustand, and shadcn/ui.
      </p>
    </div>
  );
};

export default AboutPage;
