import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
          </Button>
          <Link
            to="/"
            className="flex-1 text-lg font-semibold text-foreground no-underline hover:underline"
          >
            My Vite React App
          </Link>
          <Link
            to="/about"
            className="ml-4 text-sm text-foreground/80 no-underline hover:text-foreground hover:underline"
          >
            About
          </Link>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-6">{children}</main>

      <footer className="border-t bg-background py-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} My App
        </p>
      </footer>
    </div>
  );
};

export default MainLayout;
