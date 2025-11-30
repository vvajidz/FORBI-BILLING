import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, AlertCircle, Package, BarChart3, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/utils/apiConfig";

interface DashboardStats {
  kpi: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    totalProducts: number;
    totalCustomers: number;
    totalInvoices: number;
  };
  lowStockItems: { _id: string; name: string; stock: number; minStock: number }[];
  recentInvoices: { _id: string; invoiceNo: string; customer: { name: string }; grandTotal: number; createdAt: string; status: string }[];
  topProducts: { name: string; totalSold: number; revenue: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-center text-destructive">Failed to load dashboard data</div>;
  }

  const kpiCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.kpi.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-success",
      trend: "up"
    },
    {
      title: "Total Expenses",
      value: `₹${stats.kpi.totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: "text-destructive",
      trend: "down"
    },
    {
      title: "Net Profit",
      value: `₹${stats.kpi.totalProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: stats.kpi.totalProfit >= 0 ? "text-success" : "text-destructive",
      trend: stats.kpi.totalProfit >= 0 ? "up" : "down"
    },
    {
      title: "Total Products",
      value: stats.kpi.totalProducts,
      icon: Package,
      color: "text-blue-500",
      trend: "neutral"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Real-time business overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchStats}>Refresh</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Lifetime totals
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Recent Invoices - Takes up 4 columns */}
        <Card className="md:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent invoices</p>
              ) : (
                stats.recentInvoices.map((invoice) => (
                  <div key={invoice._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{invoice.customer?.name || "Walk-in Customer"}</p>
                        <p className="text-xs text-muted-foreground">{invoice.invoiceNo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{invoice.grandTotal?.toLocaleString() || 0}</p>
                      <p className="text-xs text-muted-foreground">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock & Top Products - Takes up 3 columns */}
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.lowStockItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">All stock levels healthy</p>
                ) : (
                  stats.lowStockItems.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Min: {item.minStock}</p>
                      </div>
                      <Badge variant="destructive">{item.stock} left</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
                ) : (
                  stats.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-4">#{index + 1}</span>
                        <p className="font-medium text-sm">{product.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold">{product.totalSold} sold</p>
                        <p className="text-[10px] text-muted-foreground">₹{product.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
