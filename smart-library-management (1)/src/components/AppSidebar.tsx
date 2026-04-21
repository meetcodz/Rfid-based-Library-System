import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  BookOpen,
  Sun,
  Moon,
  Library,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api-service";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Scan Sessions" },
  { to: "/shelves", icon: Library, label: "All Shelves" },
  { to: "/missing", icon: AlertTriangle, label: "Missing Reports" },
];

export function AppSidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const { data: sessions } = useQuery({
    queryKey: ["sessions"],
    queryFn: api.getSessions,
  });

  const { data: missing } = useQuery({
    queryKey: ["missingReports"],
    queryFn: api.getMissingReports,
  });

  const activeSessions = sessions?.filter((s) => s.status === "in_progress") ?? [];
  const unresolvedMissing = missing?.filter((m) => !m.resolved_at) ?? [];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Radio className="w-5 h-5 text-primary-foreground" />
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
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20"
                  : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </span>
              {item.to === "/" && activeSessions.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-success text-white">
                  {activeSessions.length}
                </span>
              )}
              {item.to === "/missing" && unresolvedMissing.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive text-white">
                  {unresolvedMissing.length}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Live status */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-lg bg-sidebar-accent">
        <div className="flex items-center gap-2 mb-1">
          <span className={`status-dot rfid-pulse ${activeSessions.length > 0 ? "bg-success" : "bg-muted-foreground"}`} />
          <span className="text-xs font-semibold text-sidebar-foreground">
            {activeSessions.length > 0 ? `${activeSessions.length} Scan Active` : "No Active Scans"}
          </span>
        </div>
        <p className="text-[10px] text-sidebar-muted">
          {unresolvedMissing.length} unresolved missing book{unresolvedMissing.length !== 1 ? "s" : ""}
        </p>
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
