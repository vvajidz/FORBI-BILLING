import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Receipt, 
  BarChart3,
  Package,
  Download,
  Printer
} from "lucide-react";

const reportCategories = [
  {
    title: "Sales Reports",
    icon: ShoppingCart,
    reports: [
      "Sales Summary",
      "Sales by Item",
      "Sales by Customer",
      "Sales by Category",
      "Daily Sales Report",
    ],
  },
  {
    title: "Purchase Reports",
    icon: Package,
    reports: [
      "Purchase Summary",
      "Purchase by Supplier",
      "Purchase by Item",
      "Purchase Orders",
    ],
  },
  {
    title: "Financial Reports",
    icon: TrendingUp,
    reports: [
      "Profit & Loss Statement",
      "Cash Flow Report",
      "Balance Sheet",
      "GST/Tax Report",
      "Expense Report",
    ],
  },
  {
    title: "Inventory Reports",
    icon: BarChart3,
    reports: [
      "Stock Valuation",
      "Low Stock Report",
      "Stock Movement",
      "Inventory Aging",
    ],
  },
  {
    title: "Customer Reports",
    icon: Users,
    reports: [
      "Customer List",
      "Customer Ledger",
      "Top Customers",
      "Outstanding Receivables",
    ],
  },
  {
    title: "Tax Reports",
    icon: Receipt,
    reports: [
      "GST Summary",
      "GST Returns (GSTR-1)",
      "GST Returns (GSTR-3B)",
      "Tax Collection Report",
    ],
  },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Business analytics and detailed reports</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reportCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className="h-5 w-5 text-primary" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.reports.map((report) => (
                  <div
                    key={report}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{report}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Printer className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Custom Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Input placeholder="Select report type" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-primary">
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
