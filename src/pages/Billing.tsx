import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { Plus, Trash2, Search, Save, Printer, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "@/components/ui/date-picker";
import { API_BASE_URL } from "@/utils/apiConfig";

interface BillItem {
  productId: string;
  name: string;
  barcode: string;
  qty: number;
  price: number;
  tax: number;
  discount: number;
}

interface HeldBill {
  id: string;
  timestamp: number;
  customerName: string;
  items: BillItem[];
  customerPhone: string;
  customerGSTIN: string;
  paymentMode: string;
  amountPaid: string;
  total: number;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Settings {
  invoicePrefix: string;
  nextInvoiceNumber: number;
  currencySymbol: string;
  defaultTaxRate: number;
  businessName: string;
  gstNumber: string;
  logo: string;
  invoiceFooterText: string;
  showLogo: boolean;
  showGSTIN: boolean;
}

interface Product {
  _id: string;
  name: string;
  barcode: string;
  price: number;
  tax: number;
  stock: number;
}

export default function Billing() {
  const { toast } = useToast();
  const [items, setItems] = useState<BillItem[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerGSTIN, setCustomerGSTIN] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [invoiceNo, setInvoiceNo] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [retrieveDialogOpen, setRetrieveDialogOpen] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'full' | 'pending'>('full');




  // Fetch settings and products
  useEffect(() => {
    fetchSettings();
    fetchProducts();
  }, []);

  // Generate invoice number when settings are loaded
  useEffect(() => {
    if (settings && !invoiceNo) {
      setInvoiceNo(`${settings.invoicePrefix}${settings.nextInvoiceNumber}`);
    }
  }, [settings]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        return data;
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
    return null;
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // Search customers
  const searchCustomers = async (query: string) => {
    if (!query) {
      setCustomers([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`);
      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter((c: Customer) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query)
        );
        setCustomers(filtered);
      }
    } catch (error) {
      console.error("Failed to search customers:", error);
    }
  };

  // Add item by search/barcode
  const handleProductSearch = () => {
    const product = products.find(
      (p) =>
        p.barcode === productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (product) {
      addItem(product);
      setProductSearch("");
    } else {
      toast({
        variant: "destructive",
        title: "Product Not Found",
        description: "No product matches your search",
      });
    }
  };

  const addItem = (product: Product) => {
    const existingItem = items.find((item) => item.productId === product._id);

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.productId === product._id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: product._id,
          name: product.name,
          barcode: product.barcode,
          qty: 1,
          price: product.price,
          tax: product.tax,
          discount: 0,
        },
      ]);
    }
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId));
    toast({
      title: "Item Removed",
      description: "Item removed from bill",
    });
  };

  const updateItemQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, qty } : item
      )
    );
  };

  const updateItemDiscount = (productId: string, discount: number) => {
    if (discount < 0 || discount > 100) return;
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, discount } : item
      )
    );
  };

  const calculateLineTotal = (item: BillItem) => {
    const subtotal = item.qty * item.price;
    const taxAmount = (subtotal * item.tax) / 100;
    const discountAmount = (subtotal * item.discount) / 100;
    return subtotal + taxAmount - discountAmount;
  };

  const subtotal = items.reduce((acc, item) => acc + item.qty * item.price, 0);
  const totalTax = items.reduce(
    (acc, item) => acc + (item.qty * item.price * item.tax) / 100,
    0
  );
  const totalDiscount = items.reduce(
    (acc, item) => acc + (item.qty * item.price * item.discount) / 100,
    0
  );
  const grandTotal = subtotal + totalTax - totalDiscount;

  // Auto-update amount paid when full payment is selected
  useEffect(() => {
    if (paymentStatus === 'full') {
      setAmountPaid(grandTotal.toFixed(2));
    }
  }, [grandTotal, paymentStatus]);

  const balance = grandTotal - parseFloat(amountPaid || "0");

  const handleNewBill = () => {
    setItems([]);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setCustomerPhone("");
    setCustomerGSTIN("");
    // Fetch latest settings to get updated invoice number
    fetchSettings().then((data) => {
      if (data) {
        setInvoiceNo(`${data.invoicePrefix}${data.nextInvoiceNumber}`);
      }
    });
    setInvoiceDate(new Date());
    setPaymentMode("cash");
    setAmountPaid("");
    toast({
      title: "New Bill",
      description: "Started a new bill",
    });
  };

  const handleHoldBill = () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "No Items",
        description: "Cannot hold an empty bill",
      });
      return;
    }

    const heldBill: HeldBill = {
      id: "HOLD-" + Date.now(),
      timestamp: Date.now(),
      customerName: selectedCustomer?.name || customerSearch || "Walk-in",
      items: [...items],
      customerPhone,
      customerGSTIN,
      paymentMode,
      amountPaid,
      total: grandTotal,
    };

    setHeldBills([...heldBills, heldBill]);
    handleNewBill();

    toast({
      title: "Bill Held",
      description: `Bill held successfully (${heldBill.id})`,
    });
  };

  const handleRetrieveBill = (heldBill: HeldBill) => {
    setItems(heldBill.items);
    setCustomerSearch(heldBill.customerName);
    setCustomerPhone(heldBill.customerPhone);
    setCustomerGSTIN(heldBill.customerGSTIN);
    setPaymentMode(heldBill.paymentMode);
    setAmountPaid(heldBill.amountPaid);

    // Remove from held bills
    setHeldBills(heldBills.filter(b => b.id !== heldBill.id));
    setRetrieveDialogOpen(false);

    toast({
      title: "Bill Retrieved",
      description: `Retrieved bill for ${heldBill.customerName}`,
    });
  };

  const handleSaveInvoice = async (printAfter = false) => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "No Items",
        description: "Please add items to the bill",
      });
      return;
    }

    if (!invoiceNo) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invoice number not generated. Please wait or refresh the page.",
      });
      return;
    }

    try {
      const invoiceData = {
        invoiceNo,
        customer: selectedCustomer?._id,
        customerName: selectedCustomer?.name || "Walk-in Customer",
        date: invoiceDate.toISOString(),
        items: items.map((item) => ({
          product: item.productId,
          name: item.name,
          qty: item.qty,
          price: item.price,
          tax: item.tax,
          discount: item.discount,
        })),
        subtotal,
        totalTax,
        totalDiscount,
        grandTotal,
        paymentMode,
        amountPaid: parseFloat(amountPaid || "0"),
        balance,
      };

      console.log("Saving invoice:", invoiceData);

      const response = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        // Update settings with next invoice number
        if (settings) {
          await fetch(`${API_BASE_URL}/api/settings`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...settings,
              nextInvoiceNumber: settings.nextInvoiceNumber + 1
            })
          });
        }

        toast({
          title: "Invoice Saved",
          description: `Invoice ${invoiceNo} created successfully`,
        });

        if (printAfter) {
          window.print();
        }

        handleNewBill();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save invoice");
      }
    } catch (error: any) {
      console.error("Invoice save error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save invoice",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing / POS</h1>
          <p className="text-muted-foreground">Create and manage sales invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleHoldBill}>
            <Clock className="mr-2 h-4 w-4" />
            Hold Bill
          </Button>
          <Button
            variant="outline"
            onClick={() => setRetrieveDialogOpen(true)}
            disabled={heldBills.length === 0}
          >
            Retrieve Hold ({heldBills.length})
          </Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={handleNewBill}>
            <Plus className="mr-2 h-4 w-4" />
            New Bill
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer & Bill Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Customer</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search or add customer"
                    className="pl-10"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      searchCustomers(e.target.value);
                    }}
                  />
                  {customers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                      {customers.map((customer) => (
                        <div
                          key={customer._id}
                          className="p-2 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerSearch(customer.name);
                            setCustomerPhone(customer.phone);
                            setCustomers([]);
                          }}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker
                  date={invoiceDate}
                  onDateChange={(date) => date && setInvoiceDate(date)}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-2">
                <Label>Invoice No</Label>
                <Input value={invoiceNo} readOnly className="bg-muted" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input
                  placeholder="Customer mobile number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>GSTIN (Optional)</Label>
                <Input
                  placeholder="Customer GSTIN"
                  value={customerGSTIN}
                  onChange={(e) => setCustomerGSTIN(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Scan barcode or search item..."
                  className="pl-10"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleProductSearch();
                    }
                  }}
                />
              </div>
              <Button className="bg-accent hover:bg-accent/90" onClick={handleProductSearch}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">#</th>
                    <th className="text-left p-3 text-sm font-medium">Item Name</th>
                    <th className="text-left p-3 text-sm font-medium">Qty</th>
                    <th className="text-left p-3 text-sm font-medium">Unit Price</th>
                    <th className="text-left p-3 text-sm font-medium">Tax %</th>
                    <th className="text-left p-3 text-sm font-medium">Discount %</th>
                    <th className="text-right p-3 text-sm font-medium">Line Total</th>
                    <th className="text-center p-3 text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.productId} className="border-t">
                      <td className="p-3 text-sm">{index + 1}</td>
                      <td className="p-3 text-sm font-medium">{item.name}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            updateItemQty(item.productId, parseInt(e.target.value))
                          }
                          className="w-20 h-8"
                          min="1"
                        />
                      </td>
                      <td className="p-3 text-sm">₹{item.price.toFixed(2)}</td>
                      <td className="p-3 text-sm">{item.tax}%</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={item.discount}
                          onChange={(e) =>
                            updateItemDiscount(item.productId, parseFloat(e.target.value))
                          }
                          className="w-20 h-8"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="p-3 text-sm text-right font-medium">
                        ₹{calculateLineTotal(item).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No items added. Search and add products to start billing.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <SelectItem value="split">Split Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <div className="flex gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="full"
                        name="paymentStatus"
                        checked={paymentStatus === 'full'}
                        onChange={() => setPaymentStatus('full')}
                        className="h-4 w-4 text-primary"
                      />
                      <label htmlFor="full" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Full Paid
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="pending"
                        name="paymentStatus"
                        checked={paymentStatus === 'pending'}
                        onChange={() => {
                          setPaymentStatus('pending');
                          setAmountPaid("");
                        }}
                        className="h-4 w-4 text-primary"
                      />
                      <label htmlFor="pending" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Pending / Partial
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Amount Paid</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amountPaid}
                    onChange={(e) => {
                      setAmountPaid(e.target.value);
                      if (paymentStatus === 'full') {
                        setPaymentStatus('pending');
                      }
                    }}
                    readOnly={paymentStatus === 'full'}
                    className={paymentStatus === 'full' ? 'bg-muted' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Balance</Label>
                  <Input
                    type="number"
                    value={balance.toFixed(2)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Tax:</span>
                <span className="font-medium">₹{totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium text-destructive">
                  -₹{totalDiscount.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Grand Total:</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => handleSaveInvoice(false)}>
            <Save className="mr-2 h-4 w-4" />
            Save Only
          </Button>
          <Button className="bg-success hover:bg-success/90" onClick={() => handleSaveInvoice(true)}>
            <Printer className="mr-2 h-4 w-4" />
            Save & Print
          </Button>
        </div>
      </div>

      <Dialog open={retrieveDialogOpen} onOpenChange={setRetrieveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Retrieve Held Bills</DialogTitle>
            <DialogDescription>
              Select a held bill to continue working on it
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-auto">
            {heldBills.map((bill) => (
              <div
                key={bill.id}
                className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleRetrieveBill(bill)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{bill.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {bill.items.length} items • {new Date(bill.timestamp).toLocaleTimeString()}
                    </div>
                    {bill.customerPhone && (
                      <div className="text-sm text-muted-foreground">
                        {bill.customerPhone}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">₹{bill.total.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{bill.id}</div>
                  </div>
                </div>
              </div>
            ))}
            {heldBills.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No held bills available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
