import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, AlertCircle, Package, BarChart3 } from "lucide-react";

const kpiCards = [
  {
    title: "Today's Sales",
    value: "₹45,231",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "This Month Sales",
    value: "₹8,92,450",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Pending Receivables",
    value: "₹1,24,500",
    change: "-5.3%",
    trend: "down",
    icon: AlertCircle,
  },
  {
    title: "Total Products",
    value: "1,248",
    change: "+24",
    trend: "up",
    icon: Package,
  },
];

const lowStockItems = [
  { name: "Parle-G Biscuit", current: 12, reorder: 50 },
  { name: "Dove Shampoo 200ml", current: 5, reorder: 20 },
  { name: "Lays Classic", current: 8, reorder: 30 },
  { name: "Colgate 100g", current: 3, reorder: 25 },
];

const recentInvoices = [
  { id: "INV-1024", customer: "Rahul Sharma", amount: "₹1,245", date: "Today, 2:45 PM" },
  { id: "INV-1023", customer: "Priya Singh", amount: "₹890", date: "Today, 1:30 PM" },
  { id: "INV-1022", customer: "Amit Kumar", amount: "₹2,340", date: "Today, 11:20 AM" },
  { id: "INV-1021", customer: "Sneha Patel", amount: "₹670", date: "Yesterday, 6:15 PM" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Today</Button>
          <Button variant="outline">7 Days</Button>
          <Button variant="outline">30 Days</Button>
          <Button variant="outline">Custom</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className={kpi.trend === "up" ? "text-success" : "text-destructive"}>
                  {kpi.change}
                </span>
                <span className="text-muted-foreground">from last period</span>
              </div>
            </CardContent>
            <div className={`absolute bottom-0 left-0 h-1 w-full ${kpi.trend === "up" ? "bg-success" : "bg-destructive"}`} />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Chart visualization will be added</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Chart visualization will be added</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Items</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Reorder level: {item.reorder} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-destructive">{item.current} left</p>
                    <Button size="sm" variant="outline" className="mt-1 h-7 text-xs">
                      Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium text-sm">{invoice.id}</p>
                    <p className="text-xs text-muted-foreground">{invoice.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{invoice.amount}</p>
                    <p className="text-xs text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
