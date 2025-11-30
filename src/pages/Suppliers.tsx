import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Eye, Phone, Mail, Trash2, Edit, Upload } from "lucide-react";
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
import { exportToExcel, importFromExcel } from "@/utils/excel";

interface Supplier {
  _id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  totalPurchased: number;
  outstanding: number;
}

export default function Suppliers() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

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

  const handleExport = () => {
    const exportData = suppliers.map(s => ({
      Name: s.name,
      Contact: s.contact,
      Phone: s.phone,
      Email: s.email,
      TotalPurchased: s.totalPurchased || 0,
      Outstanding: s.outstanding || 0
    }));
    exportToExcel(exportData, 'suppliers');
    toast({ title: "Success", description: "Suppliers exported successfully" });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);

      // Validate and import suppliers
      for (const row of data) {
        const supplierData = {
          name: row.Name || row.name,
          contact: row.Contact || row.contact,
          phone: row.Phone || row.phone,
          email: row.Email || row.email
        };

        // Create supplier via API
        await fetch("http://localhost:5000/api/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(supplierData),
        });
      }

      toast({ title: "Success", description: `Imported ${data.length} suppliers` });
      fetchSuppliers();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to import suppliers" });
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Supplier added successfully" });
        setIsAddDialogOpen(false);
        setFormData({ name: "", contact: "", phone: "", email: "" });
        fetchSuppliers();
      } else {
        throw new Error("Failed to add supplier");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add supplier" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSupplier) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/suppliers/${currentSupplier._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Supplier updated successfully" });
        setIsEditDialogOpen(false);
        setCurrentSupplier(null);
        fetchSuppliers();
      } else {
        throw new Error("Failed to update supplier");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update supplier" });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      email: supplier.email,
    });
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setSupplierToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    try {
      const response = await fetch(`http://localhost:5000/api/suppliers/${supplierToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Success", description: "Supplier deleted successfully" });
        fetchSuppliers();
      } else {
        throw new Error("Failed to delete supplier");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete supplier" });
    } finally {
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage supplier relationships and purchase tracking</p>
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
          <Button className="bg-accent hover:bg-accent/90" onClick={() => setIsAddDialogOpen(true)}>
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
              <Input
                placeholder="Search suppliers..."
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
                  <th className="text-left p-4 text-sm font-medium">Supplier Name</th>
                  <th className="text-left p-4 text-sm font-medium">Contact Person</th>
                  <th className="text-left p-4 text-sm font-medium">Contact Info</th>
                  <th className="text-right p-4 text-sm font-medium">Total Purchased</th>
                  <th className="text-right p-4 text-sm font-medium">Outstanding</th>
                  <th className="text-center p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier._id} className="border-t hover:bg-muted/30 transition-colors">
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
                          {supplier.email && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {supplier.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium">
                        ₹{(supplier.totalPurchased || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        {(supplier.outstanding || 0) > 0 ? (
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
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(supplier)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => confirmDelete(supplier._id)}>
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

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>Enter supplier details below</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name</Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Person</Label>
              <Input id="contact" value={formData.contact} onChange={handleInputChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Supplier"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>Update supplier details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name</Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Person</Label>
              <Input id="contact" value={formData.contact} onChange={handleInputChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Supplier"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier.
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
