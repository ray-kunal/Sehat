import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Search,
  Bell,
  User,
  Heart,
  LayoutDashboard,
  UserPlus,
  FileText,
  Worm,
  TrendingUp,
  BarChart3,
  Plus,
  AlertTriangle,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Patient Registration", href: "/patient-registration", icon: UserPlus },
    { name: "Health Records", href: "/health-records", icon: FileText },
    { name: "Disease Tracking", href: "/disease-tracking", icon: Worm },
    { name: "Surveillance", href: "/surveillance", icon: TrendingUp },
    { name: "Reports", href: "/reports", icon: BarChart3 },
  ];

  const NavigationItems = () => (
    <>
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Main Menu
        </h2>
      </div>
      
      {navigation.map((item) => {
        const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
        const Icon = item.icon;
        
        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start mb-1 ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => isMobile && setSidebarOpen(false)}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Button>
          </Link>
        );
      })}
      
      <div className="pt-6 mt-6 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <Button
          variant="ghost"
          className="w-full justify-start mb-1 text-accent hover:bg-muted"
          data-testid="button-new-patient"
        >
          <Plus className="w-5 h-5 mr-3" />
          New Patient
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
          data-testid="button-report-alert"
        >
          <AlertTriangle className="w-5 h-5 mr-3" />
          Report Alert
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* Mobile menu trigger */}
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="p-4 space-y-2">
                    <NavigationItems />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="text-primary-foreground text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">HealthTrack Kerala</h1>
                <p className="text-sm text-muted-foreground">Digital Health Record Management</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            {!isMobile && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search patients..."
                  className="pl-10 pr-4 py-2 w-80 bg-muted"
                  data-testid="input-search"
                />
              </div>
            )}
            
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              {!isMobile && (
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
                    Dr. Priya Nair
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid="text-user-role">
                    Public Health Officer
                  </p>
                </div>
              )}
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <User className="text-secondary-foreground w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar - Desktop */}
        {!isMobile && (
          <aside className="w-64 bg-card border-r border-border shadow-sm">
            <nav className="p-4 space-y-2">
              <NavigationItems />
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-accent text-accent-foreground"
          data-testid="button-floating-add"
        >
          <Plus className="text-xl w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
