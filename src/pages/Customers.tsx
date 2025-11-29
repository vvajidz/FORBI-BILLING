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
import { Plus, Search, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const customers = [
  {
    id: 1,
    name: "Rahul Sharma",
    phone: "9876543210",
    email: "rahul@example.com",
    totalBilling: 125000,
    outstanding: 12000,
    lastVisit: "2024-01-15",
  },
  {
    id: 2,
    name: "Priya Singh",
    phone: "9876543211",
    email: "priya@example.com",
    totalBilling: 89000,
    outstanding: 0,
    lastVisit: "2024-01-14",
  },
  {
    id: 3,
    name: "Amit Kumar",
    phone: "9876543212",
    email: "amit@example.com",
    totalBilling: 234000,
    outstanding: 45000,
    lastVisit: "2024-01-13",
  },
  {
    id: 4,
    name: "Sneha Patel",
    phone: "9876543213",
    email: "sneha@example.com",
    totalBilling: 67000,
    outstanding: 5000,
    lastVisit: "2024-01-12",
  },
  {
    id: 5,
    name: "Vikram Reddy",
    phone: "9876543214",
    email: "vikram@example.com",
    totalBilling: 156000,
    outstanding: 0,
    lastVisit: "2024-01-11",
  },
];

export default function Customers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage customer relationships and track payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or phone..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="high-due">High Due</SelectItem>
                <SelectItem value="frequent">Frequent Buyers</SelectItem>
                <SelectItem value="new">New Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Name</th>
                  <th className="text-left p-4 text-sm font-medium">Phone</th>
                  <th className="text-left p-4 text-sm font-medium">Email</th>
                  <th className="text-right p-4 text-sm font-medium">Total Billing</th>
                  <th className="text-right p-4 text-sm font-medium">Outstanding</th>
                  <th className="text-center p-4 text-sm font-medium">Last Visit</th>
                  <th className="text-center p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{customer.name}</div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {customer.phone}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {customer.email}
                    </td>
                    <td className="p-4 text-right font-medium">
                      ₹{customer.totalBilling.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      {customer.outstanding > 0 ? (
                        <Badge variant="destructive">
                          ₹{customer.outstanding.toLocaleString()}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Paid
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-center text-sm text-muted-foreground">
                      {new Date(customer.lastVisit).toLocaleDateString()}
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
              Showing {customers.length} of {customers.length} customers
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
