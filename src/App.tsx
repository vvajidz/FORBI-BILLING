import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Expenses from "./pages/Expenses";
import Barcode from "./pages/Barcode";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout><Dashboard /></AppLayout>} path="/" />
          <Route element={<AppLayout><Billing /></AppLayout>} path="/billing" />
          <Route element={<AppLayout><Products /></AppLayout>} path="/products" />
          <Route element={<AppLayout><Customers /></AppLayout>} path="/customers" />
          <Route element={<AppLayout><Suppliers /></AppLayout>} path="/suppliers" />
          <Route element={<AppLayout><Purchases /></AppLayout>} path="/purchases" />
          <Route element={<AppLayout><Inventory /></AppLayout>} path="/inventory" />
          <Route element={<AppLayout><Invoices /></AppLayout>} path="/invoices" />
          <Route element={<AppLayout><Payments /></AppLayout>} path="/payments" />
          <Route element={<AppLayout><Reports /></AppLayout>} path="/reports" />
          <Route element={<AppLayout><Expenses /></AppLayout>} path="/expenses" />
          <Route element={<AppLayout><Barcode /></AppLayout>} path="/barcode" />
          <Route element={<AppLayout><Settings /></AppLayout>} path="/settings" />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
