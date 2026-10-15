import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Activity, BarChart3, History, LayoutDashboard, Moon, Sun, Wind, LogOut, LogIn, User, Users, Map, Bell, Hospital, Shield, AlertOctagon, TrendingUp, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import TnCModal from "@/components/TnCModal";
import { EvaProvider } from "@/context/EvaContext";
import EvaButton from "@/components/eva/EvaButton";
import EvaPanel from "@/components/eva/EvaPanel";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/alerts", label: "Events & Alerts", icon: Bell },
  { to: "/facility-dashboard", label: "Facilities", icon: Hospital },
  { to: "/gis-map", label: "GPS Map", icon: Map },
  { to: "/predict", label: "Predict", icon: Activity },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/history", label: "History", icon: History },
];

export default function AppLayout() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tncOpen, setTncOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <EvaProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
          <div className="container flex h-16 items-center justify-between">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-sky shadow-elegant overflow-hidden">
                <img
                  src="/logo.png"
                  alt="UAQI logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    // Fallback: hide broken image, show Wind icon via CSS
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute('hidden');
                  }}
                />
                <Wind className="h-5 w-5 text-primary-foreground" hidden />
              </span>
              <span className="text-lg font-bold tracking-wide">UAQI</span>
            </NavLink>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-smooth",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {user ? (
                /* Logged-in: show name, admin button + logout */
                <>
                  {user.role === 'ADMIN' && (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-600 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-smooth"
                        )
                      }
                    >
                      <Shield className="h-3.5 w-3.5" />
                      Admin
                    </NavLink>
                  )}
                  <div className="hidden sm:flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm bg-secondary/50">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium max-w-[120px] truncate">{user.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout" title="Log out">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                /* Guest: show Login button */
                <Button variant="outline" size="sm" onClick={() => navigate("/login")} className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 animate-fade-in">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden sticky bottom-0 border-t bg-background/95 backdrop-blur">
          <div className="flex overflow-x-auto justify-between px-2 py-1 gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn("flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium min-w-[56px]", isActive ? "text-primary font-bold" : "text-muted-foreground")
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="truncate max-w-[64px]">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <footer className="hidden md:block border-t py-4 text-center text-xs text-muted-foreground">
          UAQI · Powered by OpenWeather · Data is informational, not medical advice.{" "}
          <button
            onClick={() => setTncOpen(true)}
            className="underline underline-offset-2 hover:text-foreground transition-colors ml-1"
          >
            Terms &amp; Data Guide
          </button>
        </footer>

        <TnCModal open={tncOpen} onClose={() => setTncOpen(false)} />

        {/* Global EVA AI Assistant Launcher & Panel */}
        <EvaButton />
        <EvaPanel />
      </div>
    </EvaProvider>
  );
}
