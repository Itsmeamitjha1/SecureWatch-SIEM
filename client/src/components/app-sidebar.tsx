import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Activity,
  Bug,
  ClipboardCheck,
  TrendingUp,
  User,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Security Events",
    url: "/events",
    icon: Activity,
  },
  {
    title: "Alerts",
    url: "/alerts",
    icon: AlertTriangle,
  },
  {
    title: "Incidents",
    url: "/incidents",
    icon: Bug,
  },
  {
    title: "GRC Compliance",
    url: "/grc",
    icon: ClipboardCheck,
  },
  {
    title: "Risk Assessment",
    url: "/risk",
    icon: TrendingUp,
  },
  {
    title: "ZAP Scanner",
    url: "/zap",
    icon: Shield,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
  });

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || user?.lastName || user?.email?.split("@")[0] || "User";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">SecureWatch</h1>
            <p className="text-xs text-muted-foreground">SIEM Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide">
            Security Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Separator className="mb-4" />
        {isLoading ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ) : isAuthenticated && user ? (
          <div className="space-y-3">
            <Link href="/profile">
              <div 
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover-elevate"
                data-testid="link-user-profile"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user.profileImageUrl || undefined} 
                    alt={displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium" data-testid="text-sidebar-username">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground" data-testid="text-sidebar-email">
                    {user.email || "Security Analyst"}
                  </p>
                </div>
              </div>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-sidebar-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full justify-start" 
            asChild
            data-testid="button-sidebar-login"
          >
            <a href="/api/login">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </a>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
