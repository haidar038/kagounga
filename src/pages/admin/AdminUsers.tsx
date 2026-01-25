import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Shield, ShieldOff, Loader2, Search, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface UserWithRole {
    id: string;
    email: string;
    name: string;
    phone: string;
    created_at: string;
    isAdmin: boolean;
}

const AdminUsers = () => {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // Get all user roles with created_at
            const { data: roles, error: rolesError } = await supabase.from("user_roles").select("user_id, role, created_at");

            if (rolesError) throw rolesError;

            // Create a map of user_id -> role info
            const roleMap = new Map<string, { isAdmin: boolean; created_at: string }>();
            roles?.forEach((role) => {
                const existing = roleMap.get(role.user_id);
                roleMap.set(role.user_id, {
                    isAdmin: existing?.isAdmin || role.role === "admin",
                    created_at: role.created_at || new Date().toISOString(),
                });
            });

            // Get unique user IDs from roles
            const userIds = [...new Set(roles?.map((r) => r.user_id) || [])];

            // Fetch admin emails from admin_activity_logs
            const { data: adminLogs } = await supabase.from("admin_activity_logs").select("admin_id, admin_email").in("admin_id", userIds);

            // Create a map of user_id -> admin_email
            const adminEmailMap = new Map<string, string>();
            adminLogs?.forEach((log) => {
                if (!adminEmailMap.has(log.admin_id)) {
                    adminEmailMap.set(log.admin_id, log.admin_email);
                }
            });

            // Fetch customer info from orders
            const { data: orders } = await supabase.from("orders").select("user_id, customer_email, customer_name, customer_phone").in("user_id", userIds).not("user_id", "is", null);

            // Create maps for customer info
            const customerInfoMap = new Map<string, { email: string; name: string; phone: string }>();
            orders?.forEach((order) => {
                if (order.user_id && !customerInfoMap.has(order.user_id)) {
                    customerInfoMap.set(order.user_id, {
                        email: order.customer_email,
                        name: order.customer_name,
                        phone: order.customer_phone,
                    });
                }
            });

            // Build users with all available info
            const usersWithRoles: UserWithRole[] = userIds.map((userId) => {
                const roleInfo = roleMap.get(userId);
                const adminEmail = adminEmailMap.get(userId);
                const customerInfo = customerInfoMap.get(userId);

                return {
                    id: userId,
                    email: adminEmail || customerInfo?.email || "-",
                    name: customerInfo?.name || "-",
                    phone: customerInfo?.phone || "-",
                    created_at: roleInfo?.created_at || new Date().toISOString(),
                    isAdmin: roleInfo?.isAdmin || false,
                };
            });

            setUsers(usersWithRoles);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleAdminRole = async (userId: string, currentlyAdmin: boolean) => {
        try {
            if (currentlyAdmin) {
                // Remove admin role
                const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");

                if (error) throw error;
                toast.success("Admin role removed");
            } else {
                // Add admin role
                const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });

                if (error) throw error;
                toast.success("Admin role granted");
            }

            fetchUsers();
        } catch (error: any) {
            console.error("Error toggling role:", error);
            toast.error(error.message || "Failed to update role");
        }
    };

    const addAdminByEmail = async () => {
        if (!newAdminEmail.trim()) {
            toast.error("Please enter an email address");
            return;
        }

        setIsAddingAdmin(true);
        try {
            // We need to use an edge function to look up user by email
            // For now, we'll show a message about using the user ID directly
            toast.info("To add an admin, the user must first sign up. Then use their User ID from the database.");
            setDialogOpen(false);
            setNewAdminEmail("");
        } finally {
            setIsAddingAdmin(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        return user.id.toLowerCase().includes(query) || user.email.toLowerCase().includes(query) || user.name.toLowerCase().includes(query);
    });

    return (
        <div className="space-y-6">
            <Link to="/admin">
                <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
            </Link>
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="font-heading text-3xl font-bold">User Management</h1>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Admin
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Admin User</DialogTitle>
                            <DialogDescription>Enter the email address of the user you want to grant admin access. The user must have an existing account.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Input type="email" placeholder="admin@example.com" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={addAdminByEmail} disabled={isAddingAdmin}>
                                {isAddingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Admin"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted bg-white" />
                <Input placeholder="Search by ID, email, or name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white" />
            </div>

            {/* Users Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-8 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-muted">No users with roles found.</p>
                        <p className="text-sm text-muted mt-2">Users will appear here once they sign up and are assigned roles.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-mono text-sm">
                                        {user.id.substring(0, 8)}...{user.id.substring(user.id.length - 4)}
                                    </TableCell>
                                    <TableCell className="text-sm">{user.email}</TableCell>
                                    <TableCell className="text-sm">{user.name}</TableCell>
                                    <TableCell className="text-sm">{user.phone}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        {user.isAdmin ? (
                                            <Badge className="bg-accent text-accent-foreground">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Admin
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">User</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant={user.isAdmin ? "destructive" : "default"} size="sm" onClick={() => toggleAdminRole(user.id, user.isAdmin)}>
                                            {user.isAdmin ? (
                                                <>
                                                    <ShieldOff className="h-4 w-4 mr-1" />
                                                    Remove Admin
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="h-4 w-4 mr-1" />
                                                    Make Admin
                                                </>
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-semibold text-sm mb-2">How to add an admin:</h3>
                <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
                    <li>Have the user sign up for an account at /auth</li>
                    <li>Copy their User ID from the user_roles table in the database</li>
                    <li>Insert a new row: user_id = [their ID], role = 'admin'</li>
                </ol>
            </div>
        </div>
    );
};

export default AdminUsers;
