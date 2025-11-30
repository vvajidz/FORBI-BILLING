import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { API_BASE_URL } from "@/utils/apiConfig";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const login = useAuthStore((state) => state.login);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Login Successful",
                    description: `Welcome back, ${data.username}!`,
                });
                login(data);

                // Determine redirect path based on permissions
                let redirectPath = "/";

                if (data.role === 'admin' || (data.role?.name === 'Admin')) {
                    redirectPath = "/";
                } else if (typeof data.role === 'object' && data.role?.permissions) {
                    const permissions = data.role.permissions;
                    const priorityRoutes = [
                        { key: 'dashboard', path: '/' },
                        { key: 'billing', path: '/billing' },
                        { key: 'invoices', path: '/invoices' },
                        { key: 'customers', path: '/customers' },
                        { key: 'payments', path: '/payments' },
                        { key: 'products', path: '/products' },
                        { key: 'purchases', path: '/purchases' },
                        { key: 'inventory', path: '/inventory' },
                        { key: 'suppliers', path: '/suppliers' },
                        { key: 'reports', path: '/reports' },
                        { key: 'expenses', path: '/expenses' },
                        { key: 'employees', path: '/employees' },
                        { key: 'settings', path: '/settings' },
                    ];

                    const firstAllowed = priorityRoutes.find(route => permissions[route.key]);
                    if (firstAllowed) {
                        redirectPath = firstAllowed.path;
                    }
                }

                navigate(redirectPath);
            } else {
                throw new Error(data.message || "Login failed");
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

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to access the ERP</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
