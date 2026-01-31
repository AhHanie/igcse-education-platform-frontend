import React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useAppStore } from "@app/store/useAppStore";
import AppSidebar from "@/components/Sidebar";
import "@/assets/css/App.css";
import { useSearchParams, useLocation } from "react-router-dom";
import { getToolById } from "@app/config/tools";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { mode, toggleMode } = useThemeMode();
  const user = useAppStore((state) => state.user);
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <nav className="header flex items-center gap-2">
          <div className="flex-1 min-w-0">
            {isOnChatPage && selectedTool ? (
              <>
                <div className="flex items-center gap-2 leading-none">
                  <div
                    className={`w-5 h-5 rounded ${selectedTool.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <selectedTool.icon className="h-3 w-3" />
                  </div>
                  <h1 className="text-lg font-bold leading-none">
                    {selectedTool.name}
                  </h1>
                </div>
                <p className="text-xs text-muted-foreground leading-none mt-0.5">
                  {selectedTool.description}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-lg font-bold leading-none">
                  Welcome back, {getFirstName()}! 👋
                </h1>
                <p className="text-xs text-muted-foreground leading-none mt-0.5">
                  Ready to continue your learning journey?
                </p>
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
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
