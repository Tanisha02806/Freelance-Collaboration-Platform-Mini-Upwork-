import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, MessageSquare, Plus, Menu, X } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) {
        base44.entities.UserProfile.filter({ user_id: u.id }).then(profiles => {
          if (profiles.length > 0) setProfile(profiles[0]);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const handleLogout = () => base44.auth.logout("/");

  const navLinks = [
    { to: "/browse-projects", label: "Browse Projects" },
    { to: "/find-freelancers", label: "Find Freelancers" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold font-lora">FF</span>
          </div>
          <span className="font-lora font-bold text-lg text-foreground hidden sm:block">FreelanceFlow</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`text-sm font-medium transition-colors ${location.pathname === l.to ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/post-project">
                <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" /> Post Project
                </Button>
              </Link>
              <Link to="/messages">
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageSquare className="w-4 h-4" /> Messages
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary hover:bg-primary/20 transition-colors">
                    {profile?.display_name?.charAt(0) || user.full_name?.charAt(0) || "U"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">{profile?.display_name || user.full_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{profile?.role || "user"}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/dashboard" className="flex items-center gap-2 cursor-pointer"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/profile" className="flex items-center gap-2 cursor-pointer"><User className="w-4 h-4" /> My Profile</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer flex items-center gap-2"><LogOut className="w-4 h-4" /> Log Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => base44.auth.redirectToLogin()}>Log In</Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => base44.auth.redirectToLogin()}>Sign Up</Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 space-y-3">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>{l.label}</Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/messages" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Messages</Link>
              <Link to="/post-project" className="block text-sm py-2 text-primary font-semibold" onClick={() => setMobileOpen(false)}>Post Project</Link>
              <button onClick={handleLogout} className="block text-sm py-2 text-destructive">Log Out</button>
            </>
          ) : (
            <Button className="w-full bg-primary" onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
          )}
        </div>
      )}
    </nav>
  );
}