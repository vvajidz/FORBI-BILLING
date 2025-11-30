import { useState, useEffect } from "react";
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
import { Search, RefreshCw, TrendingUp, AlertTriangle, Package as PackageIcon, History, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportToExcel } from "@/utils/excel";

interface Product {
  _id: string;
  name: string;
  barcode: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  location: string;
}

interface StockAdjustment {
  _id: string;
  product: { _id: string; name: string; barcode: string };
  type: 'add' | 'remove' | 'set';
  quantity: number;
  reason: string;
  date: string;
}

export default function Inventory() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Stats
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  // Adjust Stock Dialog
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchAdjustments();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [products]);

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

  const fetchAdjustments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/stock/adjustments");
      if (response.ok) {
        const data = await response.json();
        setAdjustments(data);
      }
    } catch (error) {
      console.error("Failed to fetch adjustments:", error);
    }
  };

  const calculateStats = () => {
    const totalValue = products.reduce((sum, item) => sum + (item.stock * item.price), 0);
    const lowStock = products.filter((item) => item.stock > 0 && item.stock < (item.minStock || 10)).length;
    const outOfStock = products.filter((item) => item.stock === 0).length;

    setTotalStockValue(totalValue);
    setLowStockCount(lowStock);
    setOutOfStockCount(outOfStock);
  };

  const handleAdjustStock = async () => {
    if (!selectedProduct || quantity <= 0 || !reason) {
      toast({ variant: "destructive", title: "Error", description: "Please fill all fields correctly" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: selectedProduct,
          type: adjustmentType,
          quantity,
          reason
        }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Stock adjusted successfully" });
        setIsAdjustDialogOpen(false);
        // Reset form
        setSelectedProduct("");
        setQuantity(0);
        setReason("");
        setAdjustmentType("add");
        // Refresh data
        fetchProducts();
        fetchAdjustments();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to adjust stock");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filteredProducts.map(p => ({
      Name: p.name,
      Barcode: p.barcode,
      Category: p.category,
      Stock: p.stock,
      MinStock: p.minStock || 10,
      Price: p.price,
      Value: p.stock * p.price,
      Location: p.location || "Store",
      Status: p.stock === 0 ? "Out of Stock" : (p.stock < (p.minStock || 10) ? "Low Stock" : "In Stock")
    }));
    exportToExcel(exportData, 'inventory_status');
    toast({ title: "Success", description: "Inventory status exported successfully" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock / Inventory</h1>
          <p className="text-muted-foreground">Monitor and manage inventory levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Inventory
          </Button>
          <Button variant="outline" onClick={() => setIsAdjustDialogOpen(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Adjust Stock
          </Button>
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
            <div className="text-2xl font-bold">{products.length}</div>
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

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
          <TabsTrigger value="history">Adjustment History</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items by name, SKU or category..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Item Name</th>
                      <th className="text-left p-4 text-sm font-medium">SKU / Barcode</th>
                      <th className="text-right p-4 text-sm font-medium">Current Stock</th>
                      <th className="text-right p-4 text-sm font-medium">Min Stock</th>
                      <th className="text-center p-4 text-sm font-medium">Location</th>
                      <th className="text-right p-4 text-sm font-medium">Value</th>
                      <th className="text-center p-4 text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No products found
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((item) => {
                        const isLowStock = item.stock > 0 && item.stock < (item.minStock || 10);
                        const isOutOfStock = item.stock === 0;

                        return (
                          <tr key={item._id} className="border-t hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.category}</div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {item.barcode}
                            </td>
                            <td className="p-4 text-right">
                              <span
                                className={`font-bold ${isOutOfStock
                                  ? "text-destructive"
                                  : isLowStock
                                    ? "text-warning"
                                    : "text-success"
                                  }`}
                              >
                                {item.stock}
                              </span>
                            </td>
                            <td className="p-4 text-right text-sm text-muted-foreground">
                              {item.minStock || 10}
                            </td>
                            <td className="p-4 text-center">
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                                {item.location || "Store"}
                              </span>
                            </td>
                            <td className="p-4 text-right font-medium">
                              ₹{(item.stock * item.price).toLocaleString()}
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
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Stock Adjustment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Date</th>
                      <th className="text-left p-4 text-sm font-medium">Product</th>
                      <th className="text-center p-4 text-sm font-medium">Type</th>
                      <th className="text-right p-4 text-sm font-medium">Quantity</th>
                      <th className="text-left p-4 text-sm font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No adjustments found
                        </td>
                      </tr>
                    ) : (
                      adjustments.map((adj) => (
                        <tr key={adj._id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(adj.date).toLocaleString()}
                          </td>
                          <td className="p-4 font-medium">
                            {adj.product?.name || "Unknown Product"}
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant="outline" className={
                              adj.type === 'add' ? "bg-success/10 text-success" :
                                adj.type === 'remove' ? "bg-destructive/10 text-destructive" :
                                  "bg-blue-500/10 text-blue-500"
                            }>
                              {adj.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 text-right font-bold">
                            {adj.quantity}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {adj.reason}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>Manually update stock levels</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock (+)</SelectItem>
                  <SelectItem value="remove">Remove Stock (-)</SelectItem>
                  <SelectItem value="set">Set Exact Stock (=)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input
                placeholder="e.g., Damaged, Found, Correction"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustStock} disabled={loading}>
              {loading ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
