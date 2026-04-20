import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  MapPin,
  ArrowLeftRight,
  Bell,
  BarChart3,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/tracking", icon: MapPin, label: "Track" },
  { to: "/issue-return", icon: ArrowLeftRight, label: "Issue" },
  { to: "/alerts", icon: Bell, label: "Alerts" },
  { to: "/analytics", icon: BarChart3, label: "Stats" },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-2 py-1.5">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
