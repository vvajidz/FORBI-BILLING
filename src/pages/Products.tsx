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
import { Plus, Search, Download, Upload, Edit, Printer } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Parle-G Biscuit",
    barcode: "8901063101012",
    category: "Biscuit",
    stock: 120,
    price: 25,
    tax: 18,
  },
  {
    id: 2,
    name: "Dove Shampoo 200ml",
    barcode: "8901030741234",
    category: "Personal Care",
    stock: 30,
    price: 120,
    tax: 18,
  },
  {
    id: 3,
    name: "Lays Classic",
    barcode: "8901234567890",
    category: "Snacks",
    stock: 85,
    price: 20,
    tax: 18,
  },
  {
    id: 4,
    name: "Colgate 100g",
    barcode: "8901234509876",
    category: "Personal Care",
    stock: 45,
    price: 45,
    tax: 18,
  },
];

export default function Products() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or barcode..." className="pl-10" />
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
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Name</th>
                  <th className="text-left p-4 text-sm font-medium">Barcode/SKU</th>
                  <th className="text-left p-4 text-sm font-medium">Category</th>
                  <th className="text-right p-4 text-sm font-medium">Stock</th>
                  <th className="text-right p-4 text-sm font-medium">Price</th>
                  <th className="text-center p-4 text-sm font-medium">Tax</th>
                  <th className="text-center p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{product.name}</div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {product.barcode}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`font-medium ${
                          product.stock < 20
                            ? "text-destructive"
                            : product.stock < 50
                            ? "text-warning"
                            : "text-success"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium">₹{product.price}</td>
                    <td className="p-4 text-center text-sm text-muted-foreground">
                      {product.tax}%
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Printer className="h-4 w-4" />
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
              Showing {products.length} of {products.length} products
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
