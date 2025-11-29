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
import { Plus, Search, Eye, Printer, Download, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const invoices = [
  {
    id: "INV-1024",
    customer: "Rahul Sharma",
    amount: 1245,
    status: "paid",
    paymentMode: "UPI",
    date: "2024-01-15",
    time: "2:45 PM",
  },
  {
    id: "INV-1023",
    customer: "Priya Singh",
    amount: 890,
    status: "paid",
    paymentMode: "Cash",
    date: "2024-01-15",
    time: "1:30 PM",
  },
  {
    id: "INV-1022",
    customer: "Amit Kumar",
    amount: 2340,
    status: "unpaid",
    paymentMode: "Card",
    date: "2024-01-15",
    time: "11:20 AM",
  },
  {
    id: "INV-1021",
    customer: "Sneha Patel",
    amount: 670,
    status: "paid",
    paymentMode: "UPI",
    date: "2024-01-14",
    time: "6:15 PM",
  },
  {
    id: "INV-1020",
    customer: "Vikram Reddy",
    amount: 1560,
    status: "partial",
    paymentMode: "Cash",
    date: "2024-01-14",
    time: "3:30 PM",
  },
];

const statusColors = {
  paid: "bg-success/10 text-success border-success/20",
  unpaid: "bg-destructive/10 text-destructive border-destructive/20",
  partial: "bg-warning/10 text-warning border-warning/20",
};

export default function Invoices() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">View and manage sales invoices</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by invoice no or customer..." className="pl-10" />
            </div>
            <Input type="date" className="w-[180px]" />
            <Select defaultValue="all">
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
            <Select defaultValue="all">
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
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{invoice.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{invoice.customer}</div>
                    </td>
                    <td className="p-4 text-right font-bold">
                      ₹{invoice.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline" className={statusColors[invoice.status as keyof typeof statusColors]}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {invoice.paymentMode}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm text-muted-foreground">
                      <div>{new Date(invoice.date).toLocaleDateString()}</div>
                      <div className="text-xs">{invoice.time}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {invoices.length} of {invoices.length} invoices
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
