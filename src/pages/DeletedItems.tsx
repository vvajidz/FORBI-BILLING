import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/utils/apiConfig";

interface DeletedItem {
    _id: string;
    type: string;
    model: string;
    deletedAt: string;
    // Invoice fields
    invoiceNo?: string;
    customerName?: string;
    grandTotal?: number;
    // Product fields
    name?: string;
    barcode?: string;
    category?: string;
    price?: number;
    // Customer/Supplier/Employee fields
    phone?: string;
    phoneNumber?: string;
    contact?: string;
    email?: string;
    role?: string;
    // Expense fields
    description?: string;
    amount?: number;
}

export default function DeletedItems() {
    const { toast } = useToast();
    const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<DeletedItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DeletedItem | null>(null);

    useEffect(() => {
        fetchDeletedItems();
    }, []);

    useEffect(() => {
        filterItems();
    }, [deletedItems, searchQuery, typeFilter]);

    const fetchDeletedItems = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/deleted`);
            if (response.ok) {
                const data = await response.json();
                setDeletedItems(data);
            }
        } catch (error) {
            console.error("Failed to fetch deleted items:", error);
        }
    };

    const filterItems = () => {
        let filtered = [...deletedItems];

        if (typeFilter !== "all") {
            filtered = filtered.filter((item) => item.type === typeFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter((item) => {
                const searchLower = searchQuery.toLowerCase();
                return (
                    item.invoiceNo?.toLowerCase().includes(searchLower) ||
                    item.customerName?.toLowerCase().includes(searchLower) ||
                    item.name?.toLowerCase().includes(searchLower) ||
                    item.barcode?.toLowerCase().includes(searchLower) ||
                    item.description?.toLowerCase().includes(searchLower)
                );
            });
        }

        setFilteredItems(filtered);
    };

    const handleRestore = async () => {
        if (!selectedItem) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/deleted/${selectedItem.model}/${selectedItem._id}/restore`,
                { method: "PUT" }
            );

            if (response.ok) {
                toast({
                    title: "Item Restored",
                    description: `${selectedItem.type} restored successfully`,
                });
                setRestoreDialogOpen(false);
                setSelectedItem(null);
                fetchDeletedItems();
            } else {
                throw new Error("Failed to restore item");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        }
    };

    const handlePermanentDelete = async () => {
        if (!selectedItem) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/deleted/${selectedItem.model}/${selectedItem._id}`,
                { method: "DELETE" }
            );

            if (response.ok) {
                toast({
                    title: "Item Deleted",
                    description: `${selectedItem.type} permanently deleted`,
                });
                setDeleteDialogOpen(false);
                setSelectedItem(null);
                fetchDeletedItems();
            } else {
                throw new Error("Failed to delete item");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        }
    };

    const getItemDisplay = (item: DeletedItem) => {
        switch (item.type) {
            case "invoice":
                return {
                    title: item.invoiceNo || "Unknown",
                    subtitle: item.customerName || "",
                    detail: `₹${item.grandTotal?.toLocaleString() || 0}`,
                };
            case "product":
                return {
                    title: item.name || "Unknown",
                    subtitle: item.barcode || "",
                    detail: `₹${item.price?.toLocaleString() || 0}`,
                };
            case "customer":
                return {
                    title: item.name || "Unknown",
                    subtitle: item.phone || item.email || "",
                    detail: "",
                };
            case "supplier":
                return {
                    title: item.name || "Unknown",
                    subtitle: item.phone || item.contact || "",
                    detail: "",
                };
            case "employee":
                return {
                    title: item.name || "Unknown",
                    subtitle: item.phoneNumber || "",
                    detail: item.role || "",
                };
            case "expense":
                return {
                    title: item.category || "Unknown",
                    subtitle: item.description || "",
                    detail: `₹${item.amount?.toLocaleString() || 0}`,
                };
            default:
                return { title: "Unknown", subtitle: "", detail: "" };
        }
    };

    const typeColors: Record<string, string> = {
        invoice: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        product: "bg-green-500/10 text-green-500 border-green-500/20",
        customer: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        supplier: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        employee: "bg-pink-500/10 text-pink-500 border-pink-500/20",
        expense: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Deleted Items</h1>
                <p className="text-muted-foreground">
                    Restore or permanently delete items
                </p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search deleted items..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="border rounded-md px-3 py-2 text-sm"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="invoice">Invoices</option>
                            <option value="product">Products</option>
                            <option value="customer">Customers</option>
                            <option value="supplier">Suppliers</option>
                            <option value="employee">Employees</option>
                            <option value="expense">Expenses</option>
                        </select>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium">Type</th>
                                    <th className="text-left p-4 text-sm font-medium">Item</th>
                                    <th className="text-left p-4 text-sm font-medium">Details</th>
                                    <th className="text-center p-4 text-sm font-medium">
                                        Deleted
                                    </th>
                                    <th className="text-center p-4 text-sm font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item) => {
                                    const display = getItemDisplay(item);
                                    return (
                                        <tr
                                            key={item._id}
                                            className="border-t hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="p-4">
                                                <Badge
                                                    variant="outline"
                                                    className={typeColors[item.type] || ""}
                                                >
                                                    {item.type}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium">{display.title}</div>
                                                {display.subtitle && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {display.subtitle}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {display.detail}
                                            </td>
                                            <td className="p-4 text-center text-sm text-muted-foreground">
                                                {new Date(item.deletedAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-success"
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setRestoreDialogOpen(true);
                                                        }}
                                                    >
                                                        <RotateCcw className="mr-1 h-3 w-3" />
                                                        Restore
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setSelectedItem(item);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-1 h-3 w-3" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchQuery || typeFilter !== "all"
                                ? "No deleted items found matching your filters"
                                : "No deleted items"}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Restore Dialog */}
            <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restore Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will restore the {selectedItem?.type} back to its original
                            location.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRestore}>
                            Restore
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Permanent Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the{" "}
                            {selectedItem?.type} from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handlePermanentDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
