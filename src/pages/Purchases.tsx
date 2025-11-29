import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const purchases = [
  {
    id: "PO-1001",
    supplier: "ABC Traders",
    items: 24,
    amount: 125000,
    status: "completed",
    date: "2024-01-10",
  },
  {
    id: "PO-1002",
    supplier: "XYZ Distributors",
    items: 18,
    amount: 89000,
    status: "completed",
    date: "2024-01-12",
  },
  {
    id: "PO-1003",
    supplier: "Premium Wholesale",
    items: 32,
    amount: 240000,
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "PO-1004",
    supplier: "Quality Suppliers Co",
    items: 15,
    amount: 67000,
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "PO-1005",
    supplier: "ABC Traders",
    items: 20,
    amount: 98000,
    status: "draft",
    date: "2024-01-16",
  },
];

const statusColors = {
  completed: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  draft: "bg-muted text-muted-foreground border-border",
};

export default function Purchases() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">Track and manage purchase orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Order
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by PO number or supplier..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="abc">ABC Traders</SelectItem>
                <SelectItem value="xyz">XYZ Distributors</SelectItem>
                <SelectItem value="premium">Premium Wholesale</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">PO No</th>
                  <th className="text-left p-4 text-sm font-medium">Supplier</th>
                  <th className="text-center p-4 text-sm font-medium">Items</th>
                  <th className="text-right p-4 text-sm font-medium">Amount</th>
                  <th className="text-center p-4 text-sm font-medium">Status</th>
                  <th className="text-center p-4 text-sm font-medium">Date</th>
                  <th className="text-center p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{purchase.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{purchase.supplier}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                        {purchase.items} items
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium">
                      ₹{purchase.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline" className={statusColors[purchase.status as keyof typeof statusColors]}>
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4 text-center text-sm text-muted-foreground">
                      {new Date(purchase.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {purchases.length} of {purchases.length} purchase orders
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
