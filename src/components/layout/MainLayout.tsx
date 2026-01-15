import React, { useState } from "react";
// import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useAppStore } from "@app/store/useAppStore";
import Sidebar from "@/components/Sidebar";
import "@/assets/css/App.css";
import { useSearchParams, useLocation } from "react-router-dom";
import { getToolById } from "@app/config/tools";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { mode, toggleMode } = useThemeMode();
  const user = useAppStore((state) => state.user);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Get tool info from query parameter if on chat page
  const toolId = searchParams.get("toolId");
  const selectedTool = toolId ? getToolById(toolId) : null;
  const isOnChatPage = location.pathname === "/chat";

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
            {isOnChatPage && selectedTool ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-10 h-10 rounded-lg ${selectedTool.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <selectedTool.icon className="h-5 w-5" />
                  </div>
                  <h1 className="text-xl font-bold">{selectedTool.name}</h1>
                </div>
                <p className="text-muted-foreground">
                  {selectedTool.description}
                </p>
              </>
            ) : (
              <>
                <h1>Welcome back, {getFirstName()}! 👋</h1>
                <p>Ready to continue your learning journey?</p>
              </>
            )}
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
