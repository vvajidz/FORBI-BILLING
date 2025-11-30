import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Search, Edit, Trash2, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel, importFromExcel } from "@/utils/excel";

interface Employee {
    _id: string;
    name: string;
    phoneNumber: string;
    address: string;
    salary: number;
    role: string;
}

export default function Employees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        address: "",
        salary: "",
        role: "",
    });
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingEmployee
                ? `http://localhost:5000/api/employees/${editingEmployee._id}`
                : "http://localhost:5000/api/employees";

            const method = editingEmployee ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    salary: parseFloat(formData.salary),
                }),
            });

            if (response.ok) {
                toast({
                    title: editingEmployee ? "Employee Updated" : "Employee Added",
                    description: `Employee ${formData.name} has been ${editingEmployee ? "updated" : "added"} successfully`,
                });

                setIsDialogOpen(false);
                resetForm();
                fetchEmployees();
            } else {
                throw new Error("Failed to save employee");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        }
    };

    const confirmDelete = (id: string) => {
        setEmployeeToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!employeeToDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/api/employees/${employeeToDelete}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast({
                    title: "Employee Deleted",
                    description: "Employee has been deleted successfully",
                });
                fetchEmployees();
            } else {
                throw new Error("Failed to delete employee");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setDeleteDialogOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name,
            phoneNumber: employee.phoneNumber,
            address: employee.address,
            salary: employee.salary.toString(),
            role: employee.role,
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            phoneNumber: "",
            address: "",
            salary: "",
            role: "",
        });
        setEditingEmployee(null);
    };

    const fetchEmployees = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/employees");
            if (response.ok) {
                const data = await response.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    };

    // Fetch employees on component mount
    useState(() => {
        fetchEmployees();
    });

    const handleExport = () => {
        const exportData = employees.map(({ name, phoneNumber, address, salary, role }) => ({
            Name: name,
            Phone: phoneNumber,
            Address: address,
            Salary: salary,
            Role: role
        }));
        exportToExcel(exportData, 'employees');
        toast({ title: "Success", description: "Employees exported successfully" });
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await importFromExcel(file);
            let successCount = 0;
            let errorCount = 0;

            for (const row of data) {
                try {
                    const employeeData = {
                        name: row['Name'],
                        phoneNumber: row['Phone']?.toString(),
                        address: row['Address'],
                        salary: Number(row['Salary']),
                        role: row['Role']
                    };

                    if (!employeeData.name || !employeeData.phoneNumber) continue;

                    const response = await fetch("http://localhost:5000/api/employees", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(employeeData),
                    });

                    if (response.ok) successCount++;
                    else errorCount++;
                } catch (err) {
                    errorCount++;
                }
            }

            toast({
                title: "Import Complete",
                description: `Successfully imported ${successCount} employees. ${errorCount} failed.`,
                variant: successCount > 0 ? "default" : "destructive",
            });
            fetchEmployees();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Import Failed",
                description: "Failed to parse Excel file",
            });
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".xlsx, .xls"
            />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                    <p className="text-muted-foreground">Manage your employee records</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleImportClick}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Excel
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-accent hover:bg-accent/90">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Employee
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                                <DialogDescription>
                                    {editingEmployee ? "Update employee information" : "Enter employee details below"}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salary">Salary</Label>
                                    <Input
                                        id="salary"
                                        type="number"
                                        step="0.01"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Input
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        placeholder="e.g., Manager, Cashier, Sales"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    {editingEmployee ? "Update Employee" : "Add Employee"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search employees..." className="pl-10" />
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium">Name</th>
                                    <th className="text-left p-4 text-sm font-medium">Phone Number</th>
                                    <th className="text-left p-4 text-sm font-medium">Address</th>
                                    <th className="text-left p-4 text-sm font-medium">Role</th>
                                    <th className="text-right p-4 text-sm font-medium">Salary</th>
                                    <th className="text-center p-4 text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee) => (
                                    <tr key={employee._id} className="border-t hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium">{employee.name}</div>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {employee.phoneNumber}
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {employee.address}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {employee.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-medium">₹{employee.salary.toLocaleString()}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEdit(employee)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => confirmDelete(employee._id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {employees.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No employees found. Add your first employee to get started.
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the employee record from the database.
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
