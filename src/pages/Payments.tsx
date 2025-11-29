import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, DollarSign, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const receivables = [
  {
    id: 1,
    customer: "Rahul Sharma",
    totalDue: 12000,
    oldestDue: "2024-01-05",
    lastPayment: "2024-01-10",
    overdue: true,
  },
  {
    id: 2,
    customer: "Amit Kumar",
    totalDue: 45000,
    oldestDue: "2024-01-08",
    lastPayment: "2024-01-12",
    overdue: true,
  },
  {
    id: 3,
    customer: "Sneha Patel",
    totalDue: 5000,
    oldestDue: "2024-01-12",
    lastPayment: "2024-01-13",
    overdue: false,
  },
];

const payables = [
  {
    id: 1,
    supplier: "ABC Traders",
    totalDue: 125000,
    oldestDue: "2024-01-03",
    lastPayment: "2024-01-08",
    overdue: true,
  },
  {
    id: 2,
    supplier: "Premium Wholesale",
    totalDue: 240000,
    oldestDue: "2024-01-10",
    lastPayment: "2024-01-14",
    overdue: false,
  },
  {
    id: 3,
    supplier: "Quality Suppliers Co",
    totalDue: 89000,
    oldestDue: "2024-01-11",
    lastPayment: "2024-01-15",
    overdue: false,
  },
];

export default function Payments() {
  const totalReceivables = receivables.reduce((sum, item) => sum + item.totalDue, 0);
  const totalPayables = payables.reduce((sum, item) => sum + item.totalDue, 0);
  const overdueReceivables = receivables.filter((item) => item.overdue).length;
  const overduePayables = payables.filter((item) => item.overdue).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">Track receivables and payables</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Receivables
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ₹{totalReceivables.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Due from customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Receivables
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueReceivables}</div>
            <p className="text-xs text-muted-foreground mt-1">Customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payables
            </CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              ₹{totalPayables.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Due to suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Payables
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overduePayables}</div>
            <p className="text-xs text-muted-foreground mt-1">Suppliers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="receivables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receivables">Receivables (Customer Dues)</TabsTrigger>
          <TabsTrigger value="payables">Payables (Supplier Dues)</TabsTrigger>
        </TabsList>

        <TabsContent value="receivables">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search customers..." className="pl-10" />
                </div>
                <Button variant="outline">Overdue Only</Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Customer</th>
                      <th className="text-right p-4 text-sm font-medium">Total Due</th>
                      <th className="text-center p-4 text-sm font-medium">Oldest Due Date</th>
                      <th className="text-center p-4 text-sm font-medium">Last Payment</th>
                      <th className="text-center p-4 text-sm font-medium">Status</th>
                      <th className="text-center p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivables.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{item.customer}</div>
                        </td>
                        <td className="p-4 text-right font-bold text-destructive">
                          ₹{item.totalDue.toLocaleString()}
                        </td>
                        <td className="p-4 text-center text-sm text-muted-foreground">
                          {new Date(item.oldestDue).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center text-sm text-muted-foreground">
                          {new Date(item.lastPayment).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center">
                          {item.overdue ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <Button size="sm" className="bg-accent hover:bg-accent/90">
                            Record Payment
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search suppliers..." className="pl-10" />
                </div>
                <Button variant="outline">Overdue Only</Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Supplier</th>
                      <th className="text-right p-4 text-sm font-medium">Total Due</th>
                      <th className="text-center p-4 text-sm font-medium">Oldest Due Date</th>
                      <th className="text-center p-4 text-sm font-medium">Last Payment</th>
                      <th className="text-center p-4 text-sm font-medium">Status</th>
                      <th className="text-center p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payables.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{item.supplier}</div>
                        </td>
                        <td className="p-4 text-right font-bold text-warning">
                          ₹{item.totalDue.toLocaleString()}
                        </td>
                        <td className="p-4 text-center text-sm text-muted-foreground">
                          {new Date(item.oldestDue).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center text-sm text-muted-foreground">
                          {new Date(item.lastPayment).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center">
                          {item.overdue ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <Button size="sm" className="bg-accent hover:bg-accent/90">
                            Make Payment
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
