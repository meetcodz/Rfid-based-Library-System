import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  MapPin,
  ArrowLeftRight,
  Bell,
  BarChart3,
  BookOpen,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/search", icon: Search, label: "Book Search" },
  { to: "/tracking", icon: MapPin, label: "Live Tracking" },
  { to: "/issue-return", icon: ArrowLeftRight, label: "Issue / Return" },
  { to: "/alerts", icon: Bell, label: "Alerts" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

export function AppSidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground">SmartLib</h1>
          <p className="text-[10px] text-sidebar-muted font-medium tracking-widest uppercase">RFID System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20"
                  : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* RFID Status */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-lg bg-sidebar-accent">
        <div className="flex items-center gap-2 mb-1">
          <span className="status-dot bg-success rfid-pulse" />
          <span className="text-xs font-semibold text-sidebar-foreground">RFID Scanners Active</span>
        </div>
        <p className="text-[10px] text-sidebar-muted">4 readers connected • Last scan 2s ago</p>
      </div>

      {/* Theme Toggle */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </aside>
  );
}
