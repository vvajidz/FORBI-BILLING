import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Eye, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const suppliers = [
  {
    id: 1,
    name: "ABC Traders",
    contact: "Rajesh Kumar",
    phone: "9876500001",
    email: "abc@traders.com",
    totalPurchased: 2450000,
    outstanding: 125000,
  },
  {
    id: 2,
    name: "XYZ Distributors",
    contact: "Suresh Patel",
    phone: "9876500002",
    email: "xyz@distributors.com",
    totalPurchased: 1890000,
    outstanding: 0,
  },
  {
    id: 3,
    name: "Premium Wholesale",
    contact: "Anita Verma",
    phone: "9876500003",
    email: "premium@wholesale.com",
    totalPurchased: 3240000,
    outstanding: 240000,
  },
  {
    id: 4,
    name: "Quality Suppliers Co",
    contact: "Mohan Singh",
    phone: "9876500004",
    email: "quality@suppliers.com",
    totalPurchased: 1670000,
    outstanding: 89000,
  },
];

export default function Suppliers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage supplier relationships and purchase tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search suppliers..." className="pl-10" />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Supplier Name</th>
                  <th className="text-left p-4 text-sm font-medium">Contact Person</th>
                  <th className="text-left p-4 text-sm font-medium">Contact Info</th>
                  <th className="text-right p-4 text-sm font-medium">Total Purchased</th>
                  <th className="text-right p-4 text-sm font-medium">Outstanding</th>
                  <th className="text-center p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{supplier.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{supplier.contact}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {supplier.phone}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {supplier.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium">
                      ₹{supplier.totalPurchased.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      {supplier.outstanding > 0 ? (
                        <Badge variant="destructive">
                          ₹{supplier.outstanding.toLocaleString()}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Settled
                        </Badge>
                      )}
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
              Showing {suppliers.length} of {suppliers.length} suppliers
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
