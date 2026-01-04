import React from "react";
// import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/hooks/useThemeMode";
import  Sidebar  from "../sideBar";
import "@/assets/css/App.css";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { mode, toggleMode } = useThemeMode();

  return (
    <div className=" min-h-screen flex">
      <Sidebar open={true} onClose={() => {}} />
      <div className="flex flex-col w-full main">
      <nav className="header">
        <div>
        <h1>Welcome back, Omar! 👋</h1>
        <p>Ready to continue your learning journey?</p>
        </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMode}
            className="ml-4"
            aria-label="Toggle theme"
          >
            {mode === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
      </nav>

      <main className="content">{children}</main>
      </div>

      {/* <footer className="border-t bg-background py-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} My App
        </p>
      </footer> */}
    </div>
  );
};

export default MainLayout;
