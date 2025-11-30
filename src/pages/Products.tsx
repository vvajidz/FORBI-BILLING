import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Download, Upload, Edit, Trash2, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel, importFromExcel } from "@/utils/excel";
import { useRef } from "react";

interface Product {
  _id: string;
  name: string;
  barcode: string;
  category: string;
  stock: number;
  price: number;
  tax: number;
}

export default function Products() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category: "",
    price: "" as string | number,
    stock: "" as string | number,
    tax: "" as string | number,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleExport = () => {
    const exportData = products.map(p => ({
      Name: p.name,
      Barcode: p.barcode,
      Category: p.category,
      Price: p.price,
      Stock: p.stock,
      Tax: p.tax
    }));
    exportToExcel(exportData, 'products');
    toast({ title: "Success", description: "Products exported successfully" });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);

      // Validate and import products
      for (const row of data) {
        const productData = {
          name: row.Name || row.name,
          barcode: row.Barcode || row.barcode,
          category: row.Category || row.category,
          price: parseFloat(row.Price || row.price || 0),
          stock: parseInt(row.Stock || row.stock || 0),
          tax: parseFloat(row.Tax || row.tax || 0),
        };

        // Create product via API
        await fetch("http://localhost:5000/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      }

      toast({ title: "Success", description: `Imported ${data.length} products` });
      fetchProducts();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to import products" });
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode.includes(searchQuery)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Stock filter
    if (stockFilter === "in-stock") {
      filtered = filtered.filter((p) => p.stock > 10);
    } else if (stockFilter === "low-stock") {
      filtered = filtered.filter((p) => p.stock > 0 && p.stock <= 10);
    } else if (stockFilter === "out-of-stock") {
      filtered = filtered.filter((p) => p.stock === 0);
    }

    setFilteredProducts(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingProduct
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : "http://localhost:5000/api/products";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          stock: Number(formData.stock),
          price: Number(formData.price),
          tax: Number(formData.tax),
        }),
      });

      if (response.ok) {
        toast({
          title: editingProduct ? "Product Updated" : "Product Added",
          description: `${formData.name} has been ${editingProduct ? "updated" : "added"} successfully`,
        });

        setIsDialogOpen(false);
        resetForm();
        fetchProducts();
      } else {
        throw new Error("Failed to save product");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Product Deleted",
          description: "Product has been deleted successfully",
        });
        fetchProducts();
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      stock: product.stock,
      price: product.price,
      tax: product.tax,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      barcode: "",
      category: "",
      stock: "",
      price: "",
      tax: "",
    });
    setEditingProduct(null);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "Out of Stock", color: "text-destructive" };
    if (stock <= 10) return { text: "Low Stock", color: "text-yellow-600" };
    return { text: "In Stock", color: "text-green-600" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" onClick={handleImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update product information" : "Enter product details below"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax">Tax (%)</Label>
                    <Input
                      id="tax"
                      type="number"
                      step="0.01"
                      value={formData.tax}
                      onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or barcode..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="dresses">Dresses</SelectItem>
                <SelectItem value="biscuit">Biscuit</SelectItem>
                <SelectItem value="personal care">Personal Care</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Product Name</th>
                  <th className="text-left p-4 text-sm font-medium">Barcode</th>
                  <th className="text-left p-4 text-sm font-medium">Category</th>
                  <th className="text-center p-4 text-sm font-medium">Stock</th>
                  <th className="text-right p-4 text-sm font-medium">Price</th>
                  <th className="text-center p-4 text-sm font-medium">Tax</th>
                  <th className="text-center p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <tr key={product._id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{product.name}</div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {product.barcode}
                      </td>
                      <td className="p-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className={`font-medium ${stockStatus.color}`}>
                          {product.stock}
                        </div>
                        <div className={`text-xs ${stockStatus.color}`}>
                          {stockStatus.text}
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium">₹{product.price.toFixed(2)}</td>
                      <td className="p-4 text-center text-sm">{product.tax}%</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => confirmDelete(product._id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || categoryFilter !== "all" || stockFilter !== "all"
                ? "No products found matching your filters"
                : "No products found. Add your first product to get started."}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
