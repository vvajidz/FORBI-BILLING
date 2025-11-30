import { Search, Bell, HelpCircle, User, Settings, Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { useState, useEffect } from "react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  priority: string;
  createdAt: string;
}

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [businessName, setBusinessName] = useState("FORBI");
  const [businessAddress, setBusinessAddress] = useState("Main Store");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.businessName) {
          setBusinessName(data.businessName);
        }
        if (data.address) {
          // Use first line of address or full address if short
          const addressLines = data.address.split('\n');
          setBusinessAddress(addressLines[0] || data.address);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  useEffect(() => {
    const isAdmin = user?.role === 'admin' || (typeof user?.role === 'object' && (user.role as any).name === 'Admin');
    if (isAdmin) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/notifications/unread");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PUT",
      });
      fetchNotifications();
      setNotificationsOpen(false);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'low_stock': return 'bg-destructive';
      case 'new_order': return 'bg-blue-500';
      case 'payment': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to clear cookie
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear local auth state
      logout();

      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });

      // Redirect to login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if API call fails
      logout();
      navigate("/login");
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center gap-4 px-4">
        <SidebarTrigger className="-ml-1" />

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            {businessName.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold">{businessName}</h1>
            <p className="text-xs text-muted-foreground">{businessAddress}</p>
          </div>
        </div>



        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications - Admin Only */}
          {(user?.role === 'admin' || (typeof user?.role === 'object' && (user.role as any).name === 'Admin')) && (
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={markAllAsRead}
                    >
                      Mark all read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification._id}
                        className="flex flex-col items-start p-3 cursor-pointer"
                        onClick={() => markAsRead(notification._id)}
                      >
                        <div className="flex items-start gap-2 w-full">
                          <div className={`h-2 w-2 rounded-full mt-1.5 ${getNotificationColor(notification.type)}`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(notification.createdAt)}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.username || 'User'}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.role === 'admin' || (typeof user?.role === 'object' && (user.role as any).name === 'Admin') ? 'Administrator' : 'Billing User'}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
