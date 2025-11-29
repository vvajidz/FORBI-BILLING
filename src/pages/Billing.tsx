import { useState } from "react";
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
import { Plus, Trash2, Search, Save, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BillItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  tax: number;
  discount: number;
}

export default function Billing() {
  const { toast } = useToast();
  const [items, setItems] = useState<BillItem[]>([
    {
      id: "1",
      name: "XYZ Shampoo",
      qty: 2,
      price: 120,
      tax: 18,
      discount: 0,
    },
  ]);

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

  const handleSave = () => {
    toast({
      title: "Bill Saved",
      description: "Invoice created successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing / POS</h1>
          <p className="text-muted-foreground">Create and manage sales invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Hold Bill</Button>
          <Button variant="outline">Retrieve Hold</Button>
          <Button className="bg-accent hover:bg-accent/90">
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
                  <Input placeholder="Search or add customer" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label>Invoice No</Label>
                <Input value="INV-1025" readOnly className="bg-muted" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input placeholder="Customer mobile number" />
              </div>
              <div className="space-y-2">
                <Label>GSTIN (Optional)</Label>
                <Input placeholder="Customer GSTIN" />
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
                <Input placeholder="Scan barcode or search item..." className="pl-10" />
              </div>
              <Button className="bg-accent hover:bg-accent/90">
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
                    <th className="text-left p-3 text-sm font-medium">Discount</th>
                    <th className="text-right p-3 text-sm font-medium">Line Total</th>
                    <th className="text-center p-3 text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3 text-sm">{index + 1}</td>
                      <td className="p-3 text-sm font-medium">{item.name}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={item.qty}
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
                          className="w-20 h-8"
                          min="0"
                        />
                      </td>
                      <td className="p-3 text-sm text-right font-medium">
                        ₹{calculateLineTotal(item).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Manual Item
            </Button>
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
                <Select defaultValue="cash">
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
                  <Label>Amount Paid</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Balance</Label>
                  <Input type="number" placeholder="0.00" readOnly className="bg-muted" />
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
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Only
          </Button>
          <Button className="bg-success hover:bg-success/90" onClick={handleSave}>
            <Printer className="mr-2 h-4 w-4" />
            Save & Print
          </Button>
        </div>
      </div>
    </div>
  );
}
