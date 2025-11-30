import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Shield, User as UserIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/utils/apiConfig";

interface Permission {
    [key: string]: boolean;
}

interface Role {
    _id: string;
    name: string;
    description: string;
    permissions: Permission;
    isDefault: boolean;
}

interface User {
    _id: string;
    username: string;
    role: Role | null;
}

const PERMISSIONS_LIST = [
    { id: "dashboard", label: "Dashboard" },
    { id: "billing", label: "Billing" },
    { id: "invoices", label: "Invoices" },
    { id: "purchases", label: "Purchases" },
    { id: "products", label: "Products" },
    { id: "inventory", label: "Inventory" },
    { id: "customers", label: "Customers" },
    { id: "suppliers", label: "Suppliers" },
    { id: "employees", label: "Employees" },
    { id: "expenses", label: "Expenses" },
    { id: "payments", label: "Payments" },
    { id: "reports", label: "Reports" },
    { id: "settings", label: "Settings" },
];

export default function Users() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);

    // Role Dialog State
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleForm, setRoleForm] = useState({
        name: "",
        description: "",
        permissions: {} as Permission
    });

    // User Dialog State
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userForm, setUserForm] = useState({
        username: "",
        password: "",
        roleId: ""
    });

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/roles`);
            if (response.ok) {
                const data = await response.json();
                setRoles(data);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Role Management Functions
    const handleRoleSubmit = async () => {
        try {
            const url = editingRole
                ? `${API_BASE_URL}/api/roles/${editingRole._id}`
                : `${API_BASE_URL}/api/roles`;

            const method = editingRole ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(roleForm),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to save role");
            }

            toast({ title: "Success", description: `Role ${editingRole ? 'updated' : 'created'} successfully` });
            setRoleDialogOpen(false);
            fetchRoles();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    const handleDeleteRole = async (id: string) => {
        if (!confirm("Are you sure you want to delete this role?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/roles/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to delete role");
            }

            toast({ title: "Success", description: "Role deleted successfully" });
            fetchRoles();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    const openRoleDialog = (role?: Role) => {
        if (role) {
            setEditingRole(role);
            setRoleForm({
                name: role.name,
                description: role.description,
                permissions: role.permissions
            });
        } else {
            setEditingRole(null);
            setRoleForm({
                name: "",
                description: "",
                permissions: {}
            });
        }
        setRoleDialogOpen(true);
    };

    const togglePermission = (permissionId: string) => {
        setRoleForm(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permissionId]: !prev.permissions[permissionId]
            }
        }));
    };

    // User Management Functions
    const handleUserSubmit = async () => {
        try {
            const url = editingUser
                ? `${API_BASE_URL}/api/users/${editingUser._id}`
                : `${API_BASE_URL}/api/users`;

            const method = editingUser ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userForm),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to save user");
            }

            toast({ title: "Success", description: `User ${editingUser ? 'updated' : 'created'} successfully` });
            setUserDialogOpen(false);
            fetchUsers();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to delete user");
            }

            toast({ title: "Success", description: "User deleted successfully" });
            fetchUsers();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    const openUserDialog = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setUserForm({
                username: user.username,
                password: "", // Don't show password
                roleId: user.role?._id || ""
            });
        } else {
            setEditingUser(null);
            setUserForm({
                username: "",
                password: "",
                roleId: ""
            });
        }
        setUserDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">Manage users and access roles</p>
            </div>

            <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" /> Users
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Roles & Permissions
                    </TabsTrigger>
                </TabsList>

                {/* Users Tab */}
                <TabsContent value="users">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Users</CardTitle>
                                <CardDescription>Manage system users and their roles</CardDescription>
                            </div>
                            <Button onClick={() => openUserDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> Add User
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell className="font-medium">{user.username}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {user.role?.name || "No Role"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => openUserDialog(user)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteUser(user._id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Roles Tab */}
                <TabsContent value="roles">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Roles</CardTitle>
                                <CardDescription>Define roles and their access permissions</CardDescription>
                            </div>
                            <Button onClick={() => openRoleDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> Add Role
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role) => (
                                        <TableRow key={role._id}>
                                            <TableCell className="font-medium">{role.name}</TableCell>
                                            <TableCell>{role.description}</TableCell>
                                            <TableCell>
                                                <Badge variant={role.isDefault ? "default" : "secondary"}>
                                                    {role.isDefault ? "System" : "Custom"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!role.isDefault && (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => openRoleDialog(role)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteRole(role._id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {role.isDefault && (
                                                    <Button variant="ghost" size="icon" disabled>
                                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Role Dialog */}
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
                        <DialogDescription>Define role details and permissions</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="roleName">Role Name</Label>
                                <Input
                                    id="roleName"
                                    value={roleForm.name}
                                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                    placeholder="e.g. Sales Manager"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roleDesc">Description</Label>
                                <Input
                                    id="roleDesc"
                                    value={roleForm.description}
                                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                    placeholder="Role description"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Permissions</Label>
                            <div className="grid grid-cols-3 gap-4 border rounded-lg p-4">
                                {PERMISSIONS_LIST.map((perm) => (
                                    <div key={perm.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`perm-${perm.id}`}
                                            checked={roleForm.permissions[perm.id] || false}
                                            onCheckedChange={() => togglePermission(perm.id)}
                                        />
                                        <Label htmlFor={`perm-${perm.id}`} className="cursor-pointer">{perm.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleRoleSubmit}>Save Role</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* User Dialog */}
            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
                        <DialogDescription>Manage user credentials and role</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={userForm.username}
                                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password {editingUser && "(Leave blank to keep current)"}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={userForm.password}
                                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={userForm.roleId}
                                onValueChange={(value) => setUserForm({ ...userForm, roleId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role._id} value={role._id}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUserDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUserSubmit}>Save User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
