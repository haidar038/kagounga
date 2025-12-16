import { useState } from "react";
import { MapPin, Phone, Mail, Send, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Mohon lengkapi semua field yang diperlukan");
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success("Pesan terkirim!", {
            description: "Kami akan segera menghubungi Anda.",
        });

        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsSubmitting(false);
    };

    return (
        <Layout>
            <SEO title="Hubungi Kami" description="Hubungi tim Kagōunga untuk pertanyaan, saran, atau kerjasama. Kami siap membantu Anda 24/7." url="/contact" keywords="kontak kagounga, hubungi kami, customer service, alamat kagounga" />
            {/* Hero */}
            <section className="bg-gradient-to-br from-accent/10 via-background to-background py-16 sm:py-20">
                <div className="container-page">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="section-label mb-4">Your experience was covered</p>
                        <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">Contact Us</h1>
                        <p className="mt-6 text-lg text-muted">Answers, even before you ask. We're on standby 24/7.</p>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-20">
                <div className="container-page">
                    <div className="grid gap-12 lg:grid-cols-3">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h2 className="font-heading text-2xl font-bold">Contact Information</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                        <MapPin className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Address</h3>
                                        <p className="mt-1 text-sm text-muted">
                                            Jl. Pertamina
                                            <br />
                                            Jambula, Ternate, Maluku Utara 97719
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                        <Phone className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Phone</h3>
                                        <p className="mt-1 text-sm text-muted">+62 812 3456 7890</p>
                                        <p className="text-xs text-muted">Monday - Friday, 09:00 - 17:00</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                        <Mail className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Email</h3>
                                        <p className="mt-1 text-sm text-muted">halo@kagounga.id</p>
                                        <p className="text-xs text-muted">Response within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                                <h2 className="font-heading text-2xl font-bold">Send Message</h2>
                                <p className="mt-1 text-muted">Fill out the form below and we'll get back to you as soon as possible.</p>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium">
                                            Name <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium">
                                            Email <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium">Subject</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                                            placeholder="What would you like to ask?"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium">
                                            Message <span className="text-destructive">*</span>
                                        </label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            rows={5}
                                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                                            placeholder="Type your message here..."
                                        />
                                    </div>
                                </div>

                                <Button type="submit" size="lg" className="mt-6" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-5 w-5" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Contact;
