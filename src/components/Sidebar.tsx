import {
  Users,
  LogOut,
  BookOpen,
  FileText,
  Sparkles,
  ChevronUp,
  PanelLeftClose,
  type LucideIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "@app/store/useAppStore";
import { logout } from "@app/api/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@components/ui/dropdown";
import { Button } from "@/components/ui/button";

// Navigation item type
interface NavItem {
  name: string;
  icon: LucideIcon;
  route: string;
}

// Role-based navigation configuration
// TODO: Change this to be controlled by the backend
export const ROLE_NAV_ITEMS: Record<string, NavItem[]> = {
  Student: [
    {
      name: "AI Tools",
      icon: Sparkles,
      route: "/ai-tools",
    },
  ],
  "School Admin": [
    {
      name: "Student Management",
      icon: Users,
      route: "/students/management",
    },
  ],
  "System Admin": [
    {
      name: "Subject Management",
      icon: BookOpen,
      route: "/subjects/management",
    },
    {
      name: "Document Management",
      icon: FileText,
      route: "/documents/management",
    },
  ],
};

// Helper function to generate initials from display name
const getInitials = (displayName: string | null | undefined): string => {
  if (!displayName) return "U";

  const names = displayName.trim().split(/\s+/);
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase();
  }

  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const AppSidebar = () => {
  const user = useAppStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const { state, toggleSidebar, setOpen } = useSidebar();

  const userDisplayName = user?.display_name || user?.username || "User";
  const userInitials = getInitials(user?.display_name);
  const isCollapsed = state === "collapsed";

  const handleLogoClick = () => {
    if (isCollapsed) {
      setOpen(true);
    }
  };

  // Get all nav items for user's roles
  const navItems: NavItem[] = [];
  const userRoles = user?.roles || [];

  // Concatenate nav items from all user roles
  userRoles.forEach((role) => {
    const roleNavItems = ROLE_NAV_ITEMS[role.name];
    if (roleNavItems) {
      navItems.push(...roleNavItems);
    }
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b-0">
        <div className="flex items-center justify-between w-full">
          <SidebarMenuButton
            size="lg"
            className={isCollapsed ? "cursor-pointer flex-1" : "hover:bg-transparent cursor-default flex-1"}
            onClick={handleLogoClick}
          >
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg">
              ✨
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-bold text-base">StudyAI</span>
              <span className="text-xs text-muted-foreground">
                Companion
              </span>
            </div>
          </SidebarMenuButton>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 group-data-[collapsible=icon]:hidden"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.route;

                return (
                  <SidebarMenuItem key={item.route}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigate(item.route)}
                      tooltip={item.name}
                    >
                      <Icon />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Dropdown>
              <DropdownTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-sm">
                    {userInitials}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {userDisplayName}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownTrigger>
              <DropdownContent
                className="w-[--radix-popper-anchor-width] min-w-56"
                side={isCollapsed ? "right" : "top"}
                align={isCollapsed ? "end" : "end"}
                sideOffset={4}
              >
                <DropdownItem onClick={handleLogout}>
                  <LogOut />
                  Logout
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  );
};

export default AppSidebar;
