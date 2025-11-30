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
import { Plus, Search, Download, Eye, Edit, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel, importFromExcel } from "@/utils/excel";
import { useRef } from "react";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  creditPoints: number;
}

export default function Customers() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchQuery]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  const handleExport = () => {
    const exportData = customers.map(c => ({
      Name: c.name,
      Phone: c.phone,
      Email: c.email,
      CreditPoints: c.creditPoints || 0
    }));
    exportToExcel(exportData, 'customers');
    toast({ title: "Success", description: "Customers exported successfully" });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);

      // Validate and import customers
      for (const row of data) {
        const customerData = {
          name: row.Name || row.name,
          phone: row.Phone || row.phone,
          email: row.Email || row.email,
          creditPoints: parseInt(row.CreditPoints || row.creditPoints || 0)
        };

        // Create customer via API
        await fetch("http://localhost:5000/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerData),
        });
      }

      toast({ title: "Success", description: `Imported ${data.length} customers` });
      fetchCustomers();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to import customers" });
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCustomer
        ? `http://localhost:5000/api/customers/${editingCustomer._id}`
        : "http://localhost:5000/api/customers";

      const method = editingCustomer ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: editingCustomer ? "Customer Updated" : "Customer Added",
          description: `${formData.name} has been ${editingCustomer ? "updated" : "added"} successfully`,
        });

        setIsDialogOpen(false);
        resetForm();
        fetchCustomers();
      } else {
        throw new Error("Failed to save customer");
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
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/customers/${customerToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Customer Deleted",
          description: "Customer has been deleted successfully",
        });
        fetchCustomers();
      } else {
        throw new Error("Failed to delete customer");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
    });
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage customer relationships and track payments</p>
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
                New Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                <DialogDescription>
                  {editingCustomer ? "Update customer information" : "Enter customer details below"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingCustomer ? "Update Customer" : "Add Customer"}
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
                placeholder="Search by name, phone or email..."
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
                  <th className="text-left p-4 text-sm font-medium">Name</th>
                  <th className="text-left p-4 text-sm font-medium">Phone</th>
                  <th className="text-left p-4 text-sm font-medium">Email</th>
                  <th className="text-center p-4 text-sm font-medium">Credit Points</th>
                  <th className="text-center p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{customer.name}</div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {customer.phone}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {customer.email}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {customer.creditPoints || 0} pts
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => confirmDelete(customer._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No customers found matching your search"
                : "No customers found. Add your first customer to get started."}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer record from the database.
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
