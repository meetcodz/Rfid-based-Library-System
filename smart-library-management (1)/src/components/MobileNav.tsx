import { NavLink } from "react-router-dom";
import { LayoutDashboard, AlertTriangle, Library } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Sessions" },
  { to: "/shelves", icon: Library, label: "Shelves" },
  { to: "/missing", icon: AlertTriangle, label: "Missing" },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all text-xs font-medium ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-sidebar-muted hover:text-sidebar-foreground"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
