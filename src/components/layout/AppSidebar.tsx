import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck,
  ShoppingBag,
  FileText,
  CreditCard,
  BarChart3,
  Receipt,
  Barcode,
  Settings
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = {
  main: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Billing / POS", url: "/billing", icon: ShoppingCart },
  ],
  sales: [
    { title: "Invoices", url: "/invoices", icon: FileText },
    { title: "Customers", url: "/customers", icon: Users },
    { title: "Payments", url: "/payments", icon: CreditCard },
  ],
  inventory: [
    { title: "Products", url: "/products", icon: Package },
    { title: "Purchases", url: "/purchases", icon: ShoppingBag },
    { title: "Stock", url: "/inventory", icon: Package },
    { title: "Suppliers", url: "/suppliers", icon: Truck },
  ],
  analytics: [
    { title: "Reports", url: "/reports", icon: BarChart3 },
    { title: "Expenses", url: "/expenses", icon: Receipt },
  ],
  system: [
    { title: "Barcode & Labels", url: "/barcode", icon: Barcode },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
};

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {Object.entries(menuItems).map(([groupKey, items]) => (
          <SidebarGroup key={groupKey}>
            <SidebarGroupLabel className="uppercase text-xs text-sidebar-foreground/60">
              {groupKey}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/"} 
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
