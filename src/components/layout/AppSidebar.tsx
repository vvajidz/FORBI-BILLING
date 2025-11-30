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
  Settings,
  UserCog,
  Trash2,
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
    { title: "Employees", url: "/employees", icon: UserCog },
    { title: "Users & Roles", url: "/users", icon: Users },
    { title: "Barcode & Labels", url: "/barcode", icon: Barcode },
    { title: "Deleted Items", url: "/deleted", icon: Trash2 },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
};

import { useAuthStore } from "@/store/authStore";

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const filterItems = (items: any[]) => {
    if (!user) return [];

    // Legacy Admin Check
    if (user.role === 'admin') return items;

    // RBAC Check
    if (typeof user.role === 'object' && user.role !== null) {
      // If user has a role object, check permissions
      // Admin role (by name) gets everything
      if (user.role.name === 'Admin') return items;

      return items.filter(item => {
        const permissions = (user.role as any).permissions || {};

        // Map URLs to permission keys
        let permissionKey = '';
        if (item.url === '/') permissionKey = 'dashboard';
        else if (item.url === '/billing') permissionKey = 'billing';
        else if (item.url === '/invoices') permissionKey = 'invoices';
        else if (item.url === '/customers') permissionKey = 'customers';
        else if (item.url === '/payments') permissionKey = 'payments';
        else if (item.url === '/products') permissionKey = 'products';
        else if (item.url === '/purchases') permissionKey = 'purchases';
        else if (item.url === '/inventory') permissionKey = 'inventory';
        else if (item.url === '/suppliers') permissionKey = 'suppliers';
        else if (item.url === '/reports') permissionKey = 'reports';
        else if (item.url === '/expenses') permissionKey = 'expenses';
        else if (item.url === '/employees') permissionKey = 'employees';
        else if (item.url === '/settings') permissionKey = 'settings';
        else if (item.url === '/users') permissionKey = 'settings'; // Users page protected by settings permission for now
        else if (item.url === '/barcode') permissionKey = 'settings'; // Barcode protected by settings for now

        return permissions[permissionKey] === true;
      });
    }

    // Default: No access if no valid role found
    return [];
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {Object.entries(menuItems).map(([groupKey, items]) => {
          const filteredItems = filterItems(items);
          if (filteredItems.length === 0) return null;

          return (
            <SidebarGroup key={groupKey}>
              <SidebarGroupLabel className="uppercase text-xs text-sidebar-foreground/60">
                {groupKey}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => (
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
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
