import { useState, useEffect } from "react";
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
import { Plus, Search, Eye, Trash2, Save, X, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/utils/excel";

interface Purchase {
  _id: string;
  supplier: { _id: string; name: string };
  items: {
    product: { _id: string; name: string; barcode: string };
    quantity: number;
    costPrice: number;
    total: number
  }[];
  totalAmount: number;
  status: string;
  date: string;
  invoiceNumber?: string;
}

interface Supplier {
  _id: string;
  name: string;
  contact: string;
}

interface Product {
  _id: string;
  name: string;
  barcode: string;
}

export default function Purchases() {
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // View & Delete State
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);

  // New Purchase Form State
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);

  // Current Item State
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [costPrice, setCostPrice] = useState(0);

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/purchases");
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      }
    } catch (error) {
      console.error("Failed to fetch purchases:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/suppliers");
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

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

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0 || costPrice < 0) {
      toast({ variant: "destructive", title: "Invalid Item", description: "Please check product, quantity and price" });
      return;
    }

    const product = products.find(p => p._id === selectedProduct);
    if (!product) return;

    const newItem = {
      product: product._id,
      productName: product.name,
      quantity,
      costPrice,
      total: quantity * costPrice
    };

    setPurchaseItems([...purchaseItems, newItem]);
    // Reset item fields
    setSelectedProduct("");
    setQuantity(1);
    setCostPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...purchaseItems];
    newItems.splice(index, 1);
    setPurchaseItems(newItems);
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async () => {
    if (!selectedSupplier || purchaseItems.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Please select supplier and add items" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplier: selectedSupplier,
        items: purchaseItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
          costPrice: item.costPrice,
          total: item.total
        })),
        totalAmount: calculateTotal(),
        status: "completed"
      };

      const response = await fetch("http://localhost:5000/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Purchase order created successfully" });
        setIsAddDialogOpen(false);
        setPurchaseItems([]);
        setSelectedSupplier("");
        fetchPurchases();
      } else {
        throw new Error("Failed to create purchase");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create purchase order" });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setPurchaseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!purchaseToDelete) return;
    try {
      const response = await fetch(`http://localhost:5000/api/purchases/${purchaseToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Success", description: "Purchase order deleted successfully" });
        fetchPurchases();
      } else {
        throw new Error("Failed to delete purchase");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete purchase order" });
    } finally {
      setDeleteDialogOpen(false);
      setPurchaseToDelete(null);
    }
  };

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filteredPurchases.map(p => ({
      PONumber: p._id.slice(-6).toUpperCase(),
      Supplier: p.supplier?.name || "Unknown",
      Date: new Date(p.date).toLocaleDateString(),
      Items: p.items.length,
      TotalAmount: p.totalAmount,
      Status: p.status,
      InvoiceNumber: p.invoiceNumber || "N/A"
    }));
    exportToExcel(exportData, 'purchase_orders');
    toast({ title: "Success", description: "Purchase orders exported successfully" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">Track and manage purchase orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => setIsAddDialogOpen(true)}>
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
              <Input
                placeholder="Search by PO number or supplier..."
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
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No purchase orders found
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr key={purchase._id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-xs">{purchase._id.slice(-6).toUpperCase()}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{purchase.supplier?.name || "Unknown"}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          {purchase.items.length} items
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium">
                        ₹{purchase.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          {purchase.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-center text-sm text-muted-foreground">
                        {new Date(purchase.date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setViewPurchase(purchase)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => confirmDelete(purchase._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Purchase Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
            <DialogDescription>Create a new purchase order to add stock</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Supplier Selection */}
            <div className="space-y-2">
              <Label>Select Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add Items Section */}
            <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
              <h3 className="font-medium text-sm">Add Items</h3>
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5 space-y-1">
                  <Label className="text-xs">Product</Label>
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
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Qty</Label>
                  <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} />
                </div>
                <div className="col-span-3 space-y-1">
                  <Label className="text-xs">Cost Price</Label>
                  <Input type="number" min="0" value={costPrice} onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-2">
                  <Button onClick={handleAddItem} className="w-full" variant="secondary">Add</Button>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="border rounded-md max-h-48 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-2">Product</th>
                    <th className="text-center p-2">Qty</th>
                    <th className="text-right p-2">Price</th>
                    <th className="text-right p-2">Total</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseItems.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{item.productName}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">₹{item.costPrice}</td>
                      <td className="p-2 text-right">₹{item.total}</td>
                      <td className="p-2 text-center">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveItem(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {purchaseItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground text-xs">No items added</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Total Items: {purchaseItems.length}
              </div>
              <div className="text-xl font-bold">
                Total: ₹{calculateTotal().toLocaleString()}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading || purchaseItems.length === 0}>
              {loading ? "Creating..." : "Create Purchase Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Purchase Dialog */}
      <Dialog open={!!viewPurchase} onOpenChange={(open) => !open && setViewPurchase(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>PO #{viewPurchase?._id.slice(-6).toUpperCase()}</DialogDescription>
          </DialogHeader>

          {viewPurchase && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Supplier</Label>
                  <div className="font-medium text-lg">{viewPurchase.supplier?.name}</div>
                </div>
                <div className="text-right">
                  <Label className="text-muted-foreground">Date</Label>
                  <div className="font-medium">{new Date(viewPurchase.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Invoice Number</Label>
                  <div className="font-medium">{viewPurchase.invoiceNumber || "N/A"}</div>
                </div>
                <div className="text-right">
                  <Label className="text-muted-foreground">Status</Label>
                  <div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {viewPurchase.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Product</th>
                      <th className="text-center p-3 font-medium">Quantity</th>
                      <th className="text-right p-3 font-medium">Unit Cost</th>
                      <th className="text-right p-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewPurchase.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">
                          <div className="font-medium">{item.product?.name || "Unknown Product"}</div>
                          <div className="text-xs text-muted-foreground">{item.product?.barcode}</div>
                        </td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">₹{item.costPrice.toLocaleString()}</td>
                        <td className="p-3 text-right font-medium">₹{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/50 font-medium">
                    <tr>
                      <td colSpan={3} className="p-3 text-right">Total Amount</td>
                      <td className="p-3 text-right text-lg">₹{viewPurchase.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewPurchase(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the purchase order and
              <span className="font-bold text-destructive"> REVERSE the stock additions </span>
              associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete & Revert Stock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
