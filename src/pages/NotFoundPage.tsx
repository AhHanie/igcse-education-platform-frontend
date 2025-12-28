import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-start space-y-4">
      <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
      <p className="text-base text-foreground">
        The page you are looking for does not exist.
      </p>
      <Button onClick={() => navigate("/")}>Go Home</Button>
    </div>
  );
};

export default NotFoundPage;
