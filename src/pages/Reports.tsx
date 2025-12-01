import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  ShoppingCart,
  Users,
  TrendingUp,
  Receipt,
  BarChart3,
  Package,
  Download,
  Printer,
  Search
} from "lucide-react";
import { exportToExcel } from "@/utils/excel";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

const reportTypes = [
  { id: "sales-summary", label: "Sales Summary", category: "Sales" },
  { id: "sales-by-item", label: "Sales by Item", category: "Sales" },
  { id: "sales-by-customer", label: "Sales by Customer", category: "Sales" },
  { id: "purchase-summary", label: "Purchase Summary", category: "Purchase" },
  { id: "expense-report", label: "Expense Report", category: "Financial" },
  { id: "stock-valuation", label: "Stock Valuation", category: "Inventory" },
];

export default function Reports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState("sales-summary");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        type: selectedReport,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      const response = await fetch(`http://localhost:5000/api/reports?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch report");

      const data = await response.json();
      setReportData(data);
      toast({ title: "Report Generated", description: "Data loaded successfully" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate report" });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData || !reportData.data) return;
    // Filter out the id column before export
    const exportData = reportData.data.map((row: any) => {
      const { id, ...rest } = row;
      return rest;
    });
    exportToExcel(exportData, selectedReport);
    toast({ title: "Success", description: "Report exported successfully" });
  };

  const renderTable = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return <div className="text-center p-8 text-muted-foreground">No data available for this period</div>;
    }

    const allColumns = Object.keys(reportData.data[0]);
    const columns = allColumns.filter(col => col !== 'id'); // Hide ID column

    return (
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map(col => (
                <th key={col} className="p-3 text-left font-medium capitalize">
                  {col.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.data.map((row: any, i: number) => (
              <tr key={i} className="border-t hover:bg-muted/30">
                {columns.map(col => {
                  const colLower = col.toLowerCase();
                  const isCurrency = (['amount', 'price', 'revenue', 'value', 'sales', 'total'].some(s => colLower.includes(s))) && !(['item', 'items', 'qty', 'quantity', 'count'].some(ex => colLower.includes(ex)));
                  const isDate = colLower.includes('date');
                  const val = row[col];
                  return (
                    <td key={col} className="p-3">
                      {typeof val === 'number' && isCurrency
                        ? `₹${val.toLocaleString()}`
                        : (isDate ? new Date(val).toLocaleDateString() : val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummary = () => {
    if (!reportData || !reportData.summary) return null;

    return (
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {Object.entries(reportData.summary).map(([key, value]: [string, any]) => {
          if (typeof value === 'object') return null; // Skip nested objects like byCategory
          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const keyLower = key.toLowerCase();
                    const isCurrency = (['amount', 'price', 'revenue', 'value', 'sales', 'total'].some(s => keyLower.includes(s))) && !(['item', 'items', 'qty', 'quantity', 'count'].some(ex => keyLower.includes(ex)));
                    return (typeof value === 'number' && isCurrency) ? `₹${value.toLocaleString()}` : value;
                  })()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and view business reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                date={startDate}
                onDateChange={(date) => date && setStartDate(date)}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <DatePicker
                date={endDate}
                onDateChange={(date) => date && setEndDate(date)}
                placeholder="Select end date"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleGenerateReport} disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <div className="space-y-6">
          {renderSummary()}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Report Data</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderTable()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
