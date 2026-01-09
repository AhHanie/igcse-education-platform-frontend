import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetError }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (resetError) {
      resetError();
    }
    navigate("/");
  };

  const handleRefresh = () => {
    if (resetError) {
      resetError();
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          Something went wrong
        </h1>

        <p className="text-muted-foreground mb-8">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium transition-colors hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </button>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background text-foreground px-6 py-3 font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </button>
        </div>

        {process.env.NODE_ENV === "development" && error?.stack && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Error Details (Development Only)
            </summary>
            <pre className="mt-4 overflow-auto rounded-md bg-muted p-4 text-xs text-left">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
