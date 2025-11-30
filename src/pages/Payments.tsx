import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, DollarSign, AlertCircle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { exportToExcel } from "@/utils/excel";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/utils/apiConfig";

interface Invoice {
  invoiceNo: string;
  invoiceId: string;
  date: string;
  grandTotal: number;
  amountPaid: number;
  balance: number;
}

interface Receivable {
  customerId: string;
  customerName: string;
  customerPhone: string;
  totalDue: number;
  invoices: Invoice[];
  oldestDue: string;
  lastPayment: string;
  overdue: boolean;
  daysSinceOldest: number;
}

export default function Payments() {
  const { toast } = useToast();
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [filteredReceivables, setFilteredReceivables] = useState<Receivable[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");

  useEffect(() => {
    fetchReceivables();
  }, []);

  useEffect(() => {
    filterReceivables();
  }, [receivables, searchQuery, showOverdueOnly]);

  const fetchReceivables = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/receivables`);
      if (response.ok) {
        const data = await response.json();
        setReceivables(data);
      }
    } catch (error) {
      console.error("Failed to fetch receivables:", error);
    }
  };

  const filterReceivables = () => {
    let filtered = [...receivables];

    if (searchQuery) {
      filtered = filtered.filter((r) =>
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (showOverdueOnly) {
      filtered = filtered.filter((r) => r.overdue);
    }

    setFilteredReceivables(filtered);
  };

  const handleRecordPayment = (receivable: Receivable) => {
    setSelectedReceivable(receivable);
    // Default to first invoice
    if (receivable.invoices.length > 0) {
      setSelectedInvoice(receivable.invoices[0]);
      setPaymentAmount(receivable.invoices[0].balance.toString());
    }
    setPaymentDialogOpen(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedInvoice || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Payment",
        description: "Please enter a valid payment amount",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice.invoiceId,
          amount: parseFloat(paymentAmount),
          paymentMode,
        }),
      });

      if (response.ok) {
        toast({
          title: "Payment Recorded",
          description: `Payment of ₹${paymentAmount} recorded successfully`,
        });
        setPaymentDialogOpen(false);
        setPaymentAmount("");
        setSelectedReceivable(null);
        setSelectedInvoice(null);
        fetchReceivables();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to record payment",
      });
    }
  };

  const totalReceivables = receivables.reduce((sum, item) => sum + item.totalDue, 0);
  const overdueReceivables = receivables.filter((item) => item.overdue).length;

  const handleExportReceivables = () => {
    const exportData = filteredReceivables.map((item) => ({
      Customer: item.customerName,
      Phone: item.customerPhone,
      TotalDue: item.totalDue,
      OldestDue: new Date(item.oldestDue).toLocaleDateString(),
      LastPayment: new Date(item.lastPayment).toLocaleDateString(),
      Status: item.overdue ? "Overdue" : "Pending",
      DaysSinceOldest: item.daysSinceOldest,
    }));
    exportToExcel(exportData, "receivables");
    toast({ title: "Success", description: "Receivables exported successfully" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">Track receivables and payables</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Receivables
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ₹{totalReceivables.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Due from customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Receivables
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueReceivables}</div>
            <p className="text-xs text-muted-foreground mt-1">Customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payables
            </CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">₹0</div>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Payables
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">0</div>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="receivables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receivables">Receivables (Customer Dues)</TabsTrigger>
          <TabsTrigger value="payables">Payables (Supplier Dues)</TabsTrigger>
        </TabsList>

        <TabsContent value="receivables">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={handleExportReceivables}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Receivables
                </Button>
                <Button
                  variant={showOverdueOnly ? "default" : "outline"}
                  onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                >
                  Overdue Only
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Customer</th>
                      <th className="text-right p-4 text-sm font-medium">Total Due</th>
                      <th className="text-center p-4 text-sm font-medium">Oldest Due Date</th>
                      <th className="text-center p-4 text-sm font-medium">Last Payment</th>
                      <th className="text-center p-4 text-sm font-medium">Status</th>
                      <th className="text-center p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceivables.map((item) => (
                      <tr key={item.customerId} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{item.customerName}</div>
                          {item.customerPhone && (
                            <div className="text-xs text-muted-foreground">{item.customerPhone}</div>
                          )}
                        </td>
                        <td className="p-4 text-right font-bold text-destructive">
                          ₹{item.totalDue.toLocaleString()}
                        </td>
                        <td className="p-4 text-center text-sm text-muted-foreground">
                          {new Date(item.oldestDue).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center text-sm text-muted-foreground">
                          {new Date(item.lastPayment).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-center">
                          {item.overdue ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90"
                            onClick={() => handleRecordPayment(item)}
                          >
                            Record Payment
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredReceivables.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery || showOverdueOnly
                    ? "No receivables found matching your filters"
                    : "No outstanding receivables"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium mb-2">Payables Coming Soon</p>
                <p className="text-sm">Supplier payment tracking will be available in a future update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {selectedReceivable?.customerName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedReceivable && selectedReceivable.invoices.length > 1 && (
              <div className="space-y-2">
                <Label>Select Invoice</Label>
                <Select
                  value={selectedInvoice?.invoiceId || ""}
                  onValueChange={(value) => {
                    const invoice = selectedReceivable.invoices.find((inv) => inv.invoiceId === value);
                    if (invoice) {
                      setSelectedInvoice(invoice);
                      setPaymentAmount(invoice.balance.toString());
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedReceivable.invoices.map((invoice) => (
                      <SelectItem key={invoice.invoiceId} value={invoice.invoiceId}>
                        {invoice.invoiceNo} - Balance: ₹{invoice.balance.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedInvoice && (
              <>
                <div className="space-y-2">
                  <Label>Invoice Details</Label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Invoice: {selectedInvoice.invoiceNo}</div>
                    <div>Grand Total: ₹{selectedInvoice.grandTotal.toLocaleString()}</div>
                    <div>Amount Paid: ₹{selectedInvoice.amountPaid.toLocaleString()}</div>
                    <div className="font-medium text-destructive">
                      Outstanding: ₹{selectedInvoice.balance.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={selectedInvoice.balance}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitPayment}>Record Payment</Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
