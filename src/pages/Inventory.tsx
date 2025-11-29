import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, TrendingUp, AlertTriangle, Package as PackageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const inventoryItems = [
  {
    id: 1,
    name: "Parle-G Biscuit",
    sku: "8901063101012",
    category: "Biscuit",
    currentStock: 120,
    minStock: 50,
    location: "Aisle A1",
    value: 3000,
  },
  {
    id: 2,
    name: "Dove Shampoo 200ml",
    sku: "8901030741234",
    category: "Personal Care",
    currentStock: 8,
    minStock: 20,
    location: "Aisle B2",
    value: 960,
  },
  {
    id: 3,
    name: "Lays Classic",
    sku: "8901234567890",
    category: "Snacks",
    currentStock: 85,
    minStock: 30,
    location: "Aisle A2",
    value: 1700,
  },
  {
    id: 4,
    name: "Colgate 100g",
    sku: "8901234509876",
    category: "Personal Care",
    currentStock: 3,
    minStock: 25,
    location: "Aisle B1",
    value: 135,
  },
];

const totalStockValue = inventoryItems.reduce((sum, item) => sum + item.value, 0);
const lowStockCount = inventoryItems.filter((item) => item.currentStock < item.minStock).length;
const outOfStockCount = inventoryItems.filter((item) => item.currentStock === 0).length;

export default function Inventory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock / Inventory</h1>
          <p className="text-muted-foreground">Monitor and manage inventory levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Adjust Stock
          </Button>
          <Button variant="outline">Stock Transfer</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Items need reorder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out of Stock
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Items unavailable</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search items..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="biscuit">Biscuit</SelectItem>
                <SelectItem value="personal">Personal Care</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Item Name</th>
                  <th className="text-left p-4 text-sm font-medium">SKU</th>
                  <th className="text-right p-4 text-sm font-medium">Current Stock</th>
                  <th className="text-right p-4 text-sm font-medium">Min Stock</th>
                  <th className="text-center p-4 text-sm font-medium">Location</th>
                  <th className="text-right p-4 text-sm font-medium">Value</th>
                  <th className="text-center p-4 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item) => {
                  const isLowStock = item.currentStock < item.minStock;
                  const isOutOfStock = item.currentStock === 0;
                  
                  return (
                    <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {item.sku}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`font-bold ${
                            isOutOfStock
                              ? "text-destructive"
                              : isLowStock
                              ? "text-warning"
                              : "text-success"
                          }`}
                        >
                          {item.currentStock}
                        </span>
                      </td>
                      <td className="p-4 text-right text-sm text-muted-foreground">
                        {item.minStock}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          {item.location}
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium">
                        ₹{item.value.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        {isOutOfStock ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : isLowStock ? (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            In Stock
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {inventoryItems.length} of {inventoryItems.length} items
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
