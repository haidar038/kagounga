import { useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { LayoutDashboard, Newspaper, Image, FileText, Megaphone, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Admin sub-pages (simplified for now)
function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted">Welcome to the Kagōunga admin panel. Manage your content from here.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "News Posts", icon: Newspaper, href: "/admin/news", count: 3 },
          { label: "Gallery Images", icon: Image, href: "/admin/gallery", count: 6 },
          { label: "Signature Points", icon: FileText, href: "/admin/signature", count: 4 },
          { label: "CTA & Mission", icon: Megaphone, href: "/admin/content", count: 2 },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className="p-6 rounded-xl bg-card border border-border hover:border-primary-border hover:shadow-soft transition-all"
          >
            <item.icon className="h-8 w-8 text-accent mb-3" />
            <h3 className="font-heading font-semibold">{item.label}</h3>
            <p className="text-sm text-muted">{item.count} items</p>
          </Link>
        ))}
      </div>
      <div className="p-4 bg-secondary/50 rounded-lg">
        <p className="text-sm text-muted">
          <strong>Note:</strong> Full admin CRUD functionality requires authentication. 
          This is a demo interface showing the admin structure.
        </p>
      </div>
    </div>
  );
}

function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">{title}</h1>
      <div className="p-8 text-center bg-card rounded-xl border border-border">
        <p className="text-muted">Admin management interface for {title.toLowerCase()}.</p>
        <p className="text-sm text-muted mt-2">Authentication required for full functionality.</p>
      </div>
    </div>
  );
}

const Admin = () => {
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
        </div>
      </header>

      {/* Content */}
      <main className="container-page py-8">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/news" element={<AdminPlaceholder title="News Management" />} />
          <Route path="/gallery" element={<AdminPlaceholder title="Gallery Management" />} />
          <Route path="/signature" element={<AdminPlaceholder title="Signature Points" />} />
          <Route path="/content" element={<AdminPlaceholder title="CTA & Mission Content" />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;
