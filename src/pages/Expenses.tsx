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

const expenses = [
  {
    id: 1,
    date: "2024-01-15",
    category: "Rent",
    description: "Monthly store rent - January 2024",
    amount: 25000,
    paymentMode: "Bank Transfer",
  },
  {
    id: 2,
    date: "2024-01-14",
    category: "Salary",
    description: "Staff salary payment",
    amount: 45000,
    paymentMode: "Cash",
  },
  {
    id: 3,
    date: "2024-01-12",
    category: "Electricity",
    description: "Electricity bill - December 2023",
    amount: 3500,
    paymentMode: "UPI",
  },
  {
    id: 4,
    date: "2024-01-10",
    category: "Marketing",
    description: "Facebook & Google Ads",
    amount: 8000,
    paymentMode: "Card",
  },
  {
    id: 5,
    date: "2024-01-08",
    category: "Maintenance",
    description: "AC repair and maintenance",
    amount: 2500,
    paymentMode: "Cash",
  },
  {
    id: 6,
    date: "2024-01-05",
    category: "Transportation",
    description: "Delivery vehicle fuel",
    amount: 4500,
    paymentMode: "UPI",
  },
];

const categoryColors: Record<string, string> = {
  Rent: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Salary: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Electricity: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Marketing: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  Maintenance: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Transportation: "bg-green-500/10 text-green-500 border-green-500/20",
};

const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

export default function Expenses() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage business expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Expenses This Month</p>
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
              <Input placeholder="Search expenses..." className="pl-10" />
            </div>
            <Input type="date" className="w-[180px]" />
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="electric">Electricity</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="transport">Transportation</SelectItem>
                <SelectItem value="misc">Miscellaneous</SelectItem>
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
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={categoryColors[expense.category]}>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-destructive" />
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
              Showing {expenses.length} of {expenses.length} expenses
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
