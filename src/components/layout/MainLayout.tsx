import React, { useState } from "react";
// import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useAppStore } from "@app/store/useAppStore";
import Sidebar from "@/components/Sidebar";
import "@/assets/css/App.css";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { mode, toggleMode } = useThemeMode();
  const user = useAppStore((state) => state.user);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Extract first name from display_name or use username as fallback
  const getFirstName = () => {
    if (user?.display_name) {
      return user.display_name.split(/\s+/)[0];
    }
    return user?.username || "there";
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div
        className="flex flex-col main"
        style={{
          marginLeft: sidebarCollapsed ? "100px" : "260px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <nav className="header">
          <div className="flex-1 min-w-0">
            <h1>Welcome back, {getFirstName()}! 👋</h1>
            <p>Ready to continue your learning journey?</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMode}
            className="ml-4 flex-shrink-0"
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
