import { useState, useEffect, useRef } from "react";
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
import { Plus, Search, Download, Upload, Edit, Trash2 } from "lucide-react";
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
import { DatePicker } from "@/components/ui/date-picker";

interface Expense {
  _id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMode: string;
}

const categoryColors: Record<string, string> = {
  Rent: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Salary: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Electricity: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Marketing: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  Maintenance: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Transportation: "bg-green-500/10 text-green-500 border-green-500/20",
  Miscellaneous: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function Expenses() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form State
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    date: new Date(),
    category: "",
    description: "",
    amount: "",
    paymentMode: "Cash",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/expenses");
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  const handleExport = () => {
    const exportData = expenses.map(e => ({
      Date: new Date(e.date).toLocaleDateString(),
      Category: e.category,
      Description: e.description,
      Amount: e.amount,
      PaymentMode: e.paymentMode
    }));
    exportToExcel(exportData, 'expenses');
    toast({ title: "Success", description: "Expenses exported successfully" });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);

      // Validate and import expenses
      for (const row of data) {
        const expenseData = {
          date: row.Date ? new Date(row.Date).toISOString() : new Date().toISOString(),
          category: row.Category || row.category || 'Miscellaneous',
          description: row.Description || row.description || '',
          amount: parseFloat(row.Amount || row.amount || 0),
          paymentMode: row.PaymentMode || row.paymentMode || 'Cash'
        };

        // Create expense via API
        await fetch("http://localhost:5000/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expenseData),
        });
      }

      toast({ title: "Success", description: `Imported ${data.length} expenses` });
      fetchExpenses();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to import expenses" });
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      const url = isEditDialogOpen && currentExpense
        ? `http://localhost:5000/api/expenses/${currentExpense._id}`
        : "http://localhost:5000/api/expenses";

      const method = isEditDialogOpen ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({ title: "Success", description: `Expense ${isEditDialogOpen ? "updated" : "added"} successfully` });
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
        resetForm();
        fetchExpenses();
      } else {
        throw new Error("Failed to save expense");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save expense" });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (expense: Expense) => {
    setCurrentExpense(expense);
    setFormData({
      date: new Date(expense.date),
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      paymentMode: expense.paymentMode,
    });
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (expense: Expense) => {
    setCurrentExpense(expense);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!currentExpense) return;
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${currentExpense._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({ title: "Success", description: "Expense deleted successfully" });
        fetchExpenses();
      } else {
        throw new Error("Failed to delete expense");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete expense" });
    } finally {
      setDeleteDialogOpen(false);
      setCurrentExpense(null);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date(),
      category: "",
      description: "",
      amount: "",
      paymentMode: "Cash",
    });
    setCurrentExpense(null);
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || expense.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage business expenses</p>
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
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
              <p className="text-3xl font-bold text-destructive">
                ₹{totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-8 w-8 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
                <SelectItem value="Salary">Salary</SelectItem>
                <SelectItem value="Electricity">Electricity</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Date</th>
                  <th className="text-left p-4 text-sm font-medium">Category</th>
                  <th className="text-left p-4 text-sm font-medium">Description</th>
                  <th className="text-right p-4 text-sm font-medium">Amount</th>
                  <th className="text-center p-4 text-sm font-medium">Payment Mode</th>
                  <th className="text-center p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No expenses found
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={categoryColors[expense.category] || categoryColors["Miscellaneous"]}>
                          {expense.category}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{expense.description}</div>
                      </td>
                      <td className="p-4 text-right font-bold text-destructive">
                        ₹{expense.amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          {expense.paymentMode}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => confirmDelete(expense)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Add/Edit Expense Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "Edit Expense" : "Add New Expense"}</DialogTitle>
            <DialogDescription>Enter expense details below</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker
                  date={formData.date}
                  onDateChange={(date) => date && setFormData({ ...formData, date })}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" min="0" value={formData.amount} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(val) => handleSelectChange("category", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Electricity">Electricity</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={formData.description} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select value={formData.paymentMode} onValueChange={(val) => handleSelectChange("paymentMode", val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Expense"}
              </Button>
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
              This action cannot be undone. This will permanently delete the expense record.
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

function TrendingDown({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
