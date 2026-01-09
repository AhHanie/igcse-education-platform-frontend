import "../assets/css/Sidebar.css";

import {
  ChevronLeft,
  ChevronRight,
  Users,
  LogOut,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "@app/store/useAppStore";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@components/ui/dropdown";
import { logout } from "@app/api/auth";

// Navigation item type
interface NavItem {
  name: string;
  icon: LucideIcon;
  route: string;
}

// Role-based navigation configuration
// TODO: Change this to be controller by the backend
const ROLE_NAV_ITEMS: Record<string, NavItem[]> = {
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

const Sidebar = (props: { collapsed: boolean; onToggle: () => void }) => {
  const { collapsed, onToggle } = props;
  const user = useAppStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const userDisplayName = user?.display_name || user?.username || "User";
  const userInitials = getInitials(user?.display_name);

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
    <div className={`sidebar font-primary ${collapsed ? "collapsed" : ""}`}>
      <button
        className="collapse-toggle"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className="logo">
        <div className="logo-icon">✨</div>
        {!collapsed && (
          <div>
            <h1>StudyAI</h1>
            <span>Student Companion</span>
          </div>
        )}
      </div>

      <ul className="nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.route;

          return (
            <li
              key={item.route}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.route)}
              title={item.name}
            >
              <span className="nav-icon">
                <Icon size={20} />
              </span>
              {!collapsed && <span className="nav-text">{item.name}</span>}
            </li>
          );
        })}
      </ul>

      <Dropdown>
        <DropdownTrigger asChild>
          <div className="user-card">
            <div className="avatar">{userInitials}</div>
            {!collapsed && (
              <div>
                <h4>{userDisplayName}</h4>
              </div>
            )}
          </div>
        </DropdownTrigger>
        <DropdownContent align="end" side="top">
          <DropdownItem onClick={handleLogout}>
            <LogOut />
            Logout
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  );
};

export default Sidebar;
