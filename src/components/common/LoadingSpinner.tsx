import React from "react";
import { Spinner } from "@/components/ui/spinner";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center py-16">
      <Spinner size="lg" />
    </div>
  );
};

export default LoadingSpinner;
