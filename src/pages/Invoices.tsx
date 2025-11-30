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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Eye, Printer, Download, Send, X, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { exportToExcel } from "@/utils/excel";
import { DatePicker } from "@/components/ui/date-picker";
import { API_BASE_URL } from "@/utils/apiConfig";

interface InvoiceItem {
  product: string;
  name: string;
  qty: number;
  price: number;
  tax: number;
  discount: number;
}

interface Invoice {
  _id: string;
  invoiceNo: string;
  customerName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  grandTotal: number;
  paymentMode: string;
  amountPaid: number;
  balance: number;
  createdAt: string;
}

interface Settings {
  businessName: string;
  gstNumber: string;
  logo: string;
  invoiceFooterText: string;
  currencySymbol: string;
  showLogo: boolean;
  showGSTIN: boolean;
}

const statusColors = {
  paid: "bg-success/10 text-success border-success/20",
  unpaid: "bg-destructive/10 text-destructive border-destructive/20",
  partial: "bg-warning/10 text-warning border-warning/20",
};

export default function Invoices() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchQuery, dateFilter, statusFilter, paymentFilter]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter) {
      const filterDateStr = dateFilter.toISOString().split('T')[0];
      filtered = filtered.filter(
        (inv) => inv.date === filterDateStr
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => getStatus(inv) === statusFilter);
    }

    // Payment mode filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(
        (inv) => inv.paymentMode.toLowerCase() === paymentFilter.toLowerCase()
      );
    }

    setFilteredInvoices(filtered);
  };

  const getStatus = (invoice: Invoice): string => {
    if (invoice.balance === 0) return "paid";
    if (invoice.amountPaid === 0) return "unpaid";
    return "partial";
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handlePrint = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
    // Trigger print after a short delay to ensure dialog is rendered
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDownload = async (invoice: Invoice) => {
    toast({
      title: "Download Started",
      description: `Invoice ${invoice.invoiceNo} is being downloaded`,
    });
    // In a real app, this would generate and download a PDF
  };

  const handleSendEmail = async (invoice: Invoice) => {
    toast({
      title: "Email Sent",
      description: `Invoice ${invoice.invoiceNo} sent to customer`,
    });
  };

  const confirmDelete = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceToDelete._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Invoice Deleted",
          description: `Invoice ${invoiceToDelete.invoiceNo} deleted successfully`,
        });
        fetchInvoices();
        setDeleteDialogOpen(false);
        setInvoiceToDelete(null);
        setViewDialogOpen(false);
      } else {
        throw new Error("Failed to delete invoice");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete invoice",
      });
    }
  };

  const handleNewInvoice = () => {
    navigate("/billing");
  };

  const handleExport = () => {
    const exportData = filteredInvoices.map(inv => ({
      InvoiceNo: inv.invoiceNo,
      Customer: inv.customerName,
      Date: new Date(inv.date).toLocaleDateString(),
      Amount: inv.grandTotal,
      Status: getStatus(inv),
      PaymentMode: inv.paymentMode,
      Paid: inv.amountPaid,
      Balance: inv.balance
    }));
    exportToExcel(exportData, 'invoices');
    toast({ title: "Success", description: "Invoices exported successfully" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">View and manage sales invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={handleNewInvoice}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice no or customer..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DatePicker
              date={dateFilter}
              onDateChange={setDateFilter}
              placeholder="Filter by date"
              className="w-[180px]"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Invoice No</th>
                  <th className="text-left p-4 text-sm font-medium">Customer</th>
                  <th className="text-right p-4 text-sm font-medium">Amount</th>
                  <th className="text-center p-4 text-sm font-medium">Status</th>
                  <th className="text-center p-4 text-sm font-medium">Payment Mode</th>
                  <th className="text-center p-4 text-sm font-medium">Date & Time</th>
                  <th className="text-center p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const status = getStatus(invoice);
                  return (
                    <tr key={invoice._id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{invoice.invoiceNo}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{invoice.customerName}</div>
                      </td>
                      <td className="p-4 text-right font-bold">
                        ₹{invoice.grandTotal.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant="outline" className={statusColors[status as keyof typeof statusColors]}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {invoice.paymentMode}
                        </span>
                      </td>
                      <td className="p-4 text-center text-sm text-muted-foreground">
                        <div>{new Date(invoice.date).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(invoice.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleView(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePrint(invoice)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownload(invoice)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSendEmail(invoice)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => confirmDelete(invoice)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || dateFilter || statusFilter !== "all" || paymentFilter !== "all"
                ? "No invoices found matching your filters"
                : "No invoices found. Create your first invoice from the Billing page."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Invoice Details</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              View complete invoice information
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="border-b pb-4">
                {/* Business Info */}
                {settings && (
                  <div className="mb-4">
                    {settings.showLogo && settings.logo && (
                      <img src={settings.logo} alt="Logo" className="h-16 mb-2" />
                    )}
                    <h1 className="text-xl font-bold">{settings.businessName}</h1>
                    {settings.showGSTIN && settings.gstNumber && (
                      <p className="text-sm text-muted-foreground">GSTIN: {settings.gstNumber}</p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedInvoice.invoiceNo}</h2>
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date(selectedInvoice.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusColors[getStatus(selectedInvoice) as keyof typeof statusColors]}
                  >
                    {getStatus(selectedInvoice).toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p className="text-sm">Name: {selectedInvoice.customerName}</p>
                <p className="text-sm">Payment Mode: {selectedInvoice.paymentMode}</p>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3">#</th>
                        <th className="text-left p-3">Item</th>
                        <th className="text-center p-3">Qty</th>
                        <th className="text-right p-3">Price</th>
                        <th className="text-right p-3">Tax</th>
                        <th className="text-right p-3">Discount</th>
                        <th className="text-right p-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, index) => {
                        const subtotal = item.qty * item.price;
                        const taxAmount = (subtotal * item.tax) / 100;
                        const discountAmount = (subtotal * item.discount) / 100;
                        const total = subtotal + taxAmount - discountAmount;
                        return (
                          <tr key={index} className="border-t">
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3">{item.name}</td>
                            <td className="p-3 text-center">{item.qty}</td>
                            <td className="p-3 text-right">₹{item.price.toFixed(2)}</td>
                            <td className="p-3 text-right">{item.tax}%</td>
                            <td className="p-3 text-right">{item.discount}%</td>
                            <td className="p-3 text-right font-medium">₹{total.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">₹{selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Tax:</span>
                  <span className="font-medium">₹{selectedInvoice.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium text-destructive">-₹{selectedInvoice.totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Grand Total:</span>
                  <span className="text-primary">₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-medium">₹{selectedInvoice.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance:</span>
                  <span className="font-medium">₹{selectedInvoice.balance.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer Text */}
              {settings && settings.invoiceFooterText && (
                <div className="border-t pt-4 text-center text-sm text-muted-foreground italic">
                  {settings.invoiceFooterText}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end border-t pt-4">
                <Button variant="outline" onClick={() => handlePrint(selectedInvoice)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" onClick={() => handleDownload(selectedInvoice)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button onClick={() => handleSendEmail(selectedInvoice)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => confirmDelete(selectedInvoice)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice
              and reverse all stock and customer balance changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvoice} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
