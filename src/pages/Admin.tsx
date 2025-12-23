import { Link, Routes, Route } from "react-router-dom";
import { LayoutDashboard, Newspaper, Image, FileText, Megaphone, ChevronLeft, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import AdminUsers from "./AdminUsers";
import AdminNews from "./admin/AdminNews";
import AdminGallery from "./admin/AdminGallery";
import AdminSignature from "./admin/AdminSignature";
import AdminContent from "./admin/AdminContent";
import AdminTransactions from "./admin/AdminTransactions";

function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted mt-1">Welcome back, {user?.email}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: "News Posts", icon: Newspaper, href: "/admin/news", count: "Manage" },
                    { label: "Gallery Images", icon: Image, href: "/admin/gallery", count: "Manage" },
                    { label: "Signature Points", icon: FileText, href: "/admin/signature", count: "Manage" },
                    { label: "CTA & Mission", icon: Megaphone, href: "/admin/content", count: "Manage" },
                    { label: "User Roles", icon: Users, href: "/admin/users", count: "Manage" },
                    { label: "Transactions", icon: LayoutDashboard, href: "/admin/transactions", count: "View" },
                ].map((item) => (
                    <Link key={item.label} to={item.href} className="p-6 rounded-xl bg-card border border-border hover:border-accent hover:shadow-soft transition-all">
                        <item.icon className="h-8 w-8 text-accent mb-3" />
                        <h3 className="font-heading font-semibold">{item.label}</h3>
                        <p className="text-sm text-muted">{item.count}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

const Admin = () => {
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container-page py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" size="sm">
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back to Site
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                                <LayoutDashboard className="h-4 w-4 text-accent-foreground" />
                            </div>
                            <span className="font-heading font-semibold">Admin Panel</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted hidden sm:block">{user?.email}</span>
                        <Button variant="ghost" size="sm" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container-page py-8">
                <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/news" element={<AdminNews />} />
                    <Route path="/gallery" element={<AdminGallery />} />
                    <Route path="/signature" element={<AdminSignature />} />
                    <Route path="/content" element={<AdminContent />} />
                    <Route path="/users" element={<AdminUsers />} />
                    <Route path="/transactions" element={<AdminTransactions />} />
                </Routes>
            </main>
        </div>
    );
};

export default Admin;
