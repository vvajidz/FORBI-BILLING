import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Save, Upload, Edit, Download, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Settings {
  // Business
  creditPointsPerAmount: number;
  businessName: string;
  ownerName: string;
  gstNumber: string;
  panNumber: string;
  address: string;
  phone: string;
  email: string;
  logo: string;

  // Invoice
  invoicePrefix: string;
  nextInvoiceNumber: number;
  invoiceFooterText: string;
  showLogo: boolean;
  showGSTIN: boolean;
  showTerms: boolean;

  // Tax & Currency
  defaultTaxRate: number;
  currency: string;
  currencySymbol: string;
  taxType: string;

  // Notifications
  lowStockAlert: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Settings>({
    creditPointsPerAmount: 100,
    businessName: "FORBI Main Store",
    ownerName: "Admin User",
    gstNumber: "",
    panNumber: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
    invoicePrefix: "INV-",
    nextInvoiceNumber: 1001,
    invoiceFooterText: "Thank you for your business! Visit again.",
    showLogo: true,
    showGSTIN: true,
    showTerms: true,
    defaultTaxRate: 18,
    currency: "INR",
    currencySymbol: "₹",
    taxType: "inclusive",
    lowStockAlert: true,
    emailNotifications: false,
    smsNotifications: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/settings");
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Your settings have been updated successfully",
        });
        setIsEditing(false);
        fetchSettings();
        // Refresh the page to update business name in header
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/backup/export");
      if (!response.ok) throw new Error("Backup failed");
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Backup Downloaded", description: "Database backup saved successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to download backup" });
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const response = await fetch("http://localhost:5000/api/backup/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json),
        });
        if (!response.ok) throw new Error("Restore failed");
        toast({ title: "Restore Successful", description: "Database restored successfully" });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to restore backup" });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResetDatabase = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/backup/reset", { method: "DELETE" });
      if (!response.ok) throw new Error("Reset failed");
      toast({ title: "Reset Successful", description: "Database has been reset" });
      setResetDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to reset database" });
    }
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".json"
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your business settings and preferences</p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="tax">Tax & Currency</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* Business Tab */}
        <TabsContent value="business">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>Update your business information</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Credit Points Configuration */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Loyalty Credit Points</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure how customers earn reward points on purchases
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Every ₹</span>
                    <Input
                      type="number"
                      className="w-32"
                      value={formData.creditPointsPerAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, creditPointsPerAmount: parseFloat(e.target.value) })
                      }
                      disabled={!isEditing}
                      min="1"
                    />
                    <span className="text-sm text-muted-foreground">spent = 1 credit point</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Example: If set to 100, a customer spending ₹500 will earn 5 credit points
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner-name">Owner Name</Label>
                  <Input
                    id="owner-name"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input
                    id="pan"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Tab */}
        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>Customize your invoice format and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                  <Input
                    id="invoice-prefix"
                    value={formData.invoicePrefix}
                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-number">Next Invoice Number</Label>
                  <Input
                    id="next-number"
                    type="number"
                    value={formData.nextInvoiceNumber}
                    onChange={(e) => setFormData({ ...formData, nextInvoiceNumber: parseInt(e.target.value) || 1001 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-text">Invoice Footer Text</Label>
                <Textarea
                  id="footer-text"
                  value={formData.invoiceFooterText}
                  onChange={(e) => setFormData({ ...formData, invoiceFooterText: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                <Label>Display Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Business Logo</Label>
                      <p className="text-sm text-muted-foreground">
                        Display logo on printed invoices
                      </p>
                    </div>
                    <Switch
                      checked={formData.showLogo}
                      onCheckedChange={(checked) => setFormData({ ...formData, showLogo: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show GSTIN</Label>
                      <p className="text-sm text-muted-foreground">
                        Display GSTIN number on invoices
                      </p>
                    </div>
                    <Switch
                      checked={formData.showGSTIN}
                      onCheckedChange={(checked) => setFormData({ ...formData, showGSTIN: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Terms & Conditions</Label>
                      <p className="text-sm text-muted-foreground">
                        Display terms on invoices
                      </p>
                    </div>
                    <Switch
                      checked={formData.showTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, showTerms: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax & Currency Tab */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Tax & Currency Settings</CardTitle>
              <CardDescription>Configure tax rates and currency preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="default-tax">Default Tax Rate (%)</Label>
                  <Input
                    id="default-tax"
                    type="number"
                    value={formData.defaultTaxRate}
                    onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-type">Tax Type</Label>
                  <Select
                    value={formData.taxType}
                    onValueChange={(val) => setFormData({ ...formData, taxType: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inclusive">Tax Inclusive</SelectItem>
                      <SelectItem value="exclusive">Tax Exclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(val) => setFormData({ ...formData, currency: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency-symbol">Currency Symbol</Label>
                  <Input
                    id="currency-symbol"
                    value={formData.currencySymbol}
                    onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Notification Settings</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when products are running low
                      </p>
                    </div>
                    <Switch
                      checked={formData.lowStockAlert}
                      onCheckedChange={(checked) => setFormData({ ...formData, lowStockAlert: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email alerts for important events
                      </p>
                    </div>
                    <Switch
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive SMS alerts for critical updates
                      </p>
                    </div>
                    <Switch
                      checked={formData.smsNotifications}
                      onCheckedChange={(checked) => setFormData({ ...formData, smsNotifications: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Manage your data backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Database Backup</h4>
                    <p className="text-sm text-muted-foreground">
                      Download a complete backup of your database
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleDownloadBackup}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Backup
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Restore Database</h4>
                    <p className="text-sm text-muted-foreground">
                      Restore from a previous backup file
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleRestoreClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Restore Backup
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5">
                  <div className="space-y-1">
                    <h4 className="font-medium text-destructive">Reset Database</h4>
                    <p className="text-sm text-muted-foreground">
                      Clear all data and reset to default (cannot be undone)
                    </p>
                  </div>
                  <Button variant="destructive" onClick={() => setResetDialogOpen(true)}>
                    <Database className="mr-2 h-4 w-4" />
                    Reset Database
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Automatic Backups</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure automatic backup schedule (Coming Soon)
                </p>
                <div className="flex items-center justify-between">
                  <Label>Enable Automatic Backups</Label>
                  <Switch disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your data including products, customers, invoices, and settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetDatabase} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reset Database
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
