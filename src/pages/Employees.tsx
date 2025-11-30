import { useState, useRef, useEffect } from "react";
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
    DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Search, Edit, Trash2, Download, Upload, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel, importFromExcel } from "@/utils/excel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Employee {
    _id: string;
    employeeId?: string;
    name: string;
    phoneNumber: string;
    address: string;
    department?: string;
    role: string;
    salaryType?: string;
    salary: number;
    baseSalary?: number;
    ctc?: number;
    salaryGrade?: string;
    joiningDate?: string;
    status?: string;
}

interface Salary {
    _id: string;
    employee: any;
    month: string;
    year: number;
    baseSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    paymentStatus: string;
    paymentDate?: string;
    paymentMode: string;
}

export default function Employees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [salaries, setSalaries] = useState<Salary[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [formData, setFormData] = useState({
        employeeId: "",
        name: "",
        phoneNumber: "",
        address: "",
        department: "General",
        role: "",
        salaryType: "Monthly",
        salary: "",
        baseSalary: "",
        ctc: "",
        salaryGrade: "",
        joiningDate: new Date().toISOString().split('T')[0],
        status: "Active",
    });

    // Salary form state
    const [salaryFormData, setSalaryFormData] = useState({
        employee: "",
        month: new Date().toISOString().slice(0, 7),
        baseSalary: "",
        allowances: "",
        deductions: "",
        paymentMode: "Bank Transfer",
        notes: "",
    });

    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchEmployees();
        fetchSalaries();
    }, []);

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

    const fetchSalaries = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/salaries");
            if (response.ok) {
                const data = await response.json();
                setSalaries(data);
            }
        } catch (error) {
            console.error("Failed to fetch salaries:", error);
        }
    };

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
                    baseSalary: parseFloat(formData.baseSalary) || 0,
                    ctc: parseFloat(formData.ctc) || 0,
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

    const handleSalarySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const [year, month] = salaryFormData.month.split('-');
            const response = await fetch("http://localhost:5000/api/salaries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...salaryFormData,
                    year: parseInt(year),
                    baseSalary: parseFloat(salaryFormData.baseSalary),
                    allowances: parseFloat(salaryFormData.allowances) || 0,
                    deductions: parseFloat(salaryFormData.deductions) || 0,
                }),
            });

            if (response.ok) {
                toast({
                    title: "Salary Added",
                    description: "Salary record created successfully",
                });

                setIsSalaryDialogOpen(false);
                resetSalaryForm();
                fetchSalaries();
            } else {
                throw new Error("Failed to add salary");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        }
    };

    const markSalaryAsPaid = async (salaryId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/salaries/${salaryId}/mark-paid`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    paymentDate: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                toast({
                    title: "Salary Marked as Paid",
                    description: "Payment status updated successfully",
                });
                fetchSalaries();
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update payment status",
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
            employeeId: employee.employeeId || "",
            name: employee.name,
            phoneNumber: employee.phoneNumber,
            address: employee.address,
            department: employee.department || "General",
            role: employee.role,
            salaryType: employee.salaryType || "Monthly",
            salary: employee.salary.toString(),
            baseSalary: employee.baseSalary?.toString() || "",
            ctc: employee.ctc?.toString() || "",
            salaryGrade: employee.salaryGrade || "",
            joiningDate: employee.joiningDate?.split('T')[0] || new Date().toISOString().split('T')[0],
            status: employee.status || "Active",
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            employeeId: "",
            name: "",
            phoneNumber: "",
            address: "",
            department: "General",
            role: "",
            salaryType: "Monthly",
            salary: "",
            baseSalary: "",
            ctc: "",
            salaryGrade: "",
            joiningDate: new Date().toISOString().split('T')[0],
            status: "Active",
        });
        setEditingEmployee(null);
    };

    const resetSalaryForm = () => {
        setSalaryFormData({
            employee: "",
            month: new Date().toISOString().slice(0, 7),
            baseSalary: "",
            allowances: "",
            deductions: "",
            paymentMode: "Bank Transfer",
            notes: "",
        });
    };

    const handleExport = () => {
        const exportData = employees.map(({ employeeId, name, phoneNumber, department, role, salaryType, salary, baseSalary, ctc, salaryGrade, joiningDate, status }) => ({
            EmployeeID: employeeId || "N/A",
            Name: name,
            Phone: phoneNumber,
            Department: department || "General",
            Role: role,
            SalaryType: salaryType || "Monthly",
            Salary: salary,
            BaseSalary: baseSalary || 0,
            CTC: ctc || 0,
            SalaryGrade: salaryGrade || "",
            JoiningDate: joiningDate ? new Date(joiningDate).toLocaleDateString() : "",
            Status: status || "Active",
        }));
        exportToExcel(exportData, 'employees');
        toast({ title: "Success", description: "Employees exported successfully" });
    };

    const handleExportPayroll = () => {
        const exportData = salaries.map(s => ({
            EmployeeID: s.employee?.employeeId || "N/A",
            EmployeeName: s.employee?.name || "Unknown",
            Department: s.employee?.department || "General",
            Month: s.month,
            Year: s.year,
            BaseSalary: s.baseSalary,
            Allowances: s.allowances,
            Deductions: s.deductions,
            NetSalary: s.netSalary,
            PaymentStatus: s.paymentStatus,
            PaymentDate: s.paymentDate ? new Date(s.paymentDate).toLocaleDateString() : "N/A",
            PaymentMode: s.paymentMode,
        }));
        exportToExcel(exportData, 'payroll');
        toast({ title: "Success", description: "Payroll exported successfully" });
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
                        employeeId: row['EmployeeID'],
                        name: row['Name'],
                        phoneNumber: row['Phone']?.toString(),
                        address: row['Address'] || "",
                        department: row['Department'] || "General",
                        role: row['Role'],
                        salaryType: row['SalaryType'] || "Monthly",
                        salary: Number(row['Salary']),
                        baseSalary: Number(row['BaseSalary']) || 0,
                        ctc: Number(row['CTC']) || 0,
                        salaryGrade: row['SalaryGrade'] || "",
                        status: row['Status'] || "Active",
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

    const getSalaryStatus = (employeeId: string) => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const employeeSalary = salaries.find(s =>
            s.employee?._id === employeeId && s.month === currentMonth
        );

        if (!employeeSalary) return { status: 'Not Added', variant: 'secondary' as const, salaryId: null };
        if (employeeSalary.paymentStatus === 'Paid') return { status: 'Paid', variant: 'default' as const, salaryId: employeeSalary._id };
        if (employeeSalary.paymentStatus === 'Processing') return { status: 'Processing', variant: 'outline' as const, salaryId: employeeSalary._id };
        return { status: 'Pending', variant: 'destructive' as const, salaryId: employeeSalary._id };
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.phoneNumber.includes(searchQuery);
        const matchesDepartment = departmentFilter === "all" || emp.department === departmentFilter;
        const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
        return matchesSearch && matchesDepartment && matchesStatus;
    });

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
                    <p className="text-muted-foreground">Manage employee records and payroll</p>
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
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                                <DialogDescription>
                                    {editingEmployee ? "Update employee information" : "Enter employee details below"}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="employeeId">Employee ID</Label>
                                        <Input
                                            id="employeeId"
                                            value={formData.employeeId}
                                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                            placeholder="EMP001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                                        <Input
                                            id="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Input
                                            id="department"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Job Role *</Label>
                                        <Input
                                            id="role"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            placeholder="e.g., Manager, Cashier, Sales"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="salaryType">Salary Type</Label>
                                        <Select value={formData.salaryType} onValueChange={(val) => setFormData({ ...formData, salaryType: val })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Monthly">Monthly</SelectItem>
                                                <SelectItem value="Hourly">Hourly</SelectItem>
                                                <SelectItem value="Contract">Contract</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="salary">Salary *</Label>
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
                                        <Label htmlFor="baseSalary">Base Salary</Label>
                                        <Input
                                            id="baseSalary"
                                            type="number"
                                            step="0.01"
                                            value={formData.baseSalary}
                                            onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ctc">CTC</Label>
                                        <Input
                                            id="ctc"
                                            type="number"
                                            step="0.01"
                                            value={formData.ctc}
                                            onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="salaryGrade">Salary Grade</Label>
                                        <Input
                                            id="salaryGrade"
                                            value={formData.salaryGrade}
                                            onChange={(e) => setFormData({ ...formData, salaryGrade: e.target.value })}
                                            placeholder="e.g., A1, B2"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="joiningDate">Joining Date</Label>
                                        <Input
                                            id="joiningDate"
                                            type="date"
                                            value={formData.joiningDate}
                                            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                                <SelectItem value="On Leave">On Leave</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="submit" className="w-full">
                                        {editingEmployee ? "Update Employee" : "Add Employee"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="employees" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="employees">Employees</TabsTrigger>
                    <TabsTrigger value="payroll">Payroll</TabsTrigger>
                </TabsList>

                <TabsContent value="employees">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, ID, or phone..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Sales">Sales</SelectItem>
                                        <SelectItem value="IT">IT</SelectItem>
                                        <SelectItem value="HR">HR</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="On Leave">On Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="border rounded-lg overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Employee ID</th>
                                            <th className="text-left p-3 font-medium">Name</th>
                                            <th className="text-left p-3 font-medium">Department</th>
                                            <th className="text-left p-3 font-medium">Role</th>
                                            <th className="text-left p-3 font-medium">Salary Type</th>
                                            <th className="text-right p-3 font-medium">CTC</th>
                                            <th className="text-center p-3 font-medium">Grade</th>
                                            <th className="text-center p-3 font-medium">Status</th>
                                            <th className="text-center p-3 font-medium">Salary Status</th>
                                            <th className="text-center p-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmployees.map((employee) => (
                                            <tr key={employee._id} className="border-t hover:bg-muted/30 transition-colors">
                                                <td className="p-3 font-mono text-xs">{employee.employeeId || "N/A"}</td>
                                                <td className="p-3">
                                                    <div className="font-medium">{employee.name}</div>
                                                    <div className="text-xs text-muted-foreground">{employee.phoneNumber}</div>
                                                </td>
                                                <td className="p-3">{employee.department || "General"}</td>
                                                <td className="p-3">
                                                    <Badge variant="outline" className="bg-primary/10 text-primary">
                                                        {employee.role}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">{employee.salaryType || "Monthly"}</td>
                                                <td className="p-3 text-right font-medium">₹{(employee.ctc || employee.salary).toLocaleString()}</td>
                                                <td className="p-3 text-center">{employee.salaryGrade || "-"}</td>
                                                <td className="p-3 text-center">
                                                    <Badge variant={employee.status === "Active" ? "default" : "secondary"}>
                                                        {employee.status || "Active"}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {(() => {
                                                        const { status, variant, salaryId } = getSalaryStatus(employee._id);
                                                        return (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Badge variant={variant}>{status}</Badge>
                                                                {salaryId && status !== 'Paid' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                        onClick={() => markSalaryAsPaid(salaryId)}
                                                                    >
                                                                        Mark Paid
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="p-3">
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

                            {filteredEmployees.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No employees found. Add your first employee to get started.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payroll">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">Salary Records</h3>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleExportPayroll}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export Payroll
                                    </Button>
                                    <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <DollarSign className="mr-2 h-4 w-4" />
                                                Add Salary
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add Salary Record</DialogTitle>
                                                <DialogDescription>Record salary payment for an employee</DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleSalarySubmit} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="employee">Employee *</Label>
                                                    <Select value={salaryFormData.employee} onValueChange={(val) => setSalaryFormData({ ...salaryFormData, employee: val })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Employee" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {employees.map(emp => (
                                                                <SelectItem key={emp._id} value={emp._id}>
                                                                    {emp.name} ({emp.employeeId || emp._id.slice(-6)})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="month">Month *</Label>
                                                    <Input
                                                        id="month"
                                                        type="month"
                                                        value={salaryFormData.month}
                                                        onChange={(e) => setSalaryFormData({ ...salaryFormData, month: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="baseSalary">Base Salary *</Label>
                                                        <Input
                                                            id="baseSalary"
                                                            type="number"
                                                            step="0.01"
                                                            value={salaryFormData.baseSalary}
                                                            onChange={(e) => setSalaryFormData({ ...salaryFormData, baseSalary: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="allowances">Allowances</Label>
                                                        <Input
                                                            id="allowances"
                                                            type="number"
                                                            step="0.01"
                                                            value={salaryFormData.allowances}
                                                            onChange={(e) => setSalaryFormData({ ...salaryFormData, allowances: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="deductions">Deductions</Label>
                                                        <Input
                                                            id="deductions"
                                                            type="number"
                                                            step="0.01"
                                                            value={salaryFormData.deductions}
                                                            onChange={(e) => setSalaryFormData({ ...salaryFormData, deductions: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="paymentMode">Payment Mode</Label>
                                                    <Select value={salaryFormData.paymentMode} onValueChange={(val) => setSalaryFormData({ ...salaryFormData, paymentMode: val })}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                            <SelectItem value="Cash">Cash</SelectItem>
                                                            <SelectItem value="Cheque">Cheque</SelectItem>
                                                            <SelectItem value="UPI">UPI</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="notes">Notes</Label>
                                                    <Input
                                                        id="notes"
                                                        value={salaryFormData.notes}
                                                        onChange={(e) => setSalaryFormData({ ...salaryFormData, notes: e.target.value })}
                                                        placeholder="Optional notes"
                                                    />
                                                </div>

                                                <DialogFooter>
                                                    <Button type="submit" className="w-full">Add Salary Record</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Employee</th>
                                            <th className="text-left p-3 font-medium">Department</th>
                                            <th className="text-center p-3 font-medium">Month</th>
                                            <th className="text-right p-3 font-medium">Base</th>
                                            <th className="text-right p-3 font-medium">Allowances</th>
                                            <th className="text-right p-3 font-medium">Deductions</th>
                                            <th className="text-right p-3 font-medium">Net Salary</th>
                                            <th className="text-center p-3 font-medium">Status</th>
                                            <th className="text-center p-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salaries.map((salary) => (
                                            <tr key={salary._id} className="border-t hover:bg-muted/30">
                                                <td className="p-3">
                                                    <div className="font-medium">{salary.employee?.name || "Unknown"}</div>
                                                    <div className="text-xs text-muted-foreground">{salary.employee?.employeeId || "N/A"}</div>
                                                </td>
                                                <td className="p-3">{salary.employee?.department || "General"}</td>
                                                <td className="p-3 text-center">{salary.month}</td>
                                                <td className="p-3 text-right">₹{salary.baseSalary.toLocaleString()}</td>
                                                <td className="p-3 text-right text-green-600">+₹{salary.allowances.toLocaleString()}</td>
                                                <td className="p-3 text-right text-red-600">-₹{salary.deductions.toLocaleString()}</td>
                                                <td className="p-3 text-right font-bold">₹{salary.netSalary.toLocaleString()}</td>
                                                <td className="p-3 text-center">
                                                    <Badge variant={salary.paymentStatus === "Paid" ? "default" : "destructive"}>
                                                        {salary.paymentStatus}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {salary.paymentStatus !== "Paid" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => markSalaryAsPaid(salary._id)}
                                                        >
                                                            Mark Paid
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {salaries.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No salary records found. Add salary records to track payroll.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

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
