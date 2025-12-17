import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowLeft, Loader2, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

type AuthMode = "login" | "signup" | "forgot" | "reset";

const Auth = () => {
    const { t } = useTranslation();
    const [mode, setMode] = useState<AuthMode>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, isLoading, signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const authSchema = z.object({
        email: z.string().email(t("auth.validEmail")),
        password: z.string().min(6, t("auth.passwordMinLength")),
    });

    const resetSchema = z.object({
        email: z.string().email(t("auth.validEmail")),
    });

    const newPasswordSchema = z
        .object({
            password: z.string().min(6, t("auth.passwordMinLength")),
            confirmPassword: z.string().min(6, t("auth.passwordMinLength")),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: t("auth.passwordsDontMatch"),
            path: ["confirmPassword"],
        });

    type AuthFormValues = z.infer<typeof authSchema>;
    type ResetFormValues = z.infer<typeof resetSchema>;
    type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

    const form = useForm<AuthFormValues>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const resetForm = useForm<ResetFormValues>({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            email: "",
        },
    });

    const newPasswordForm = useForm<NewPasswordFormValues>({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    // Check for password reset token in URL
    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get("type");
        if (type === "recovery") {
            setMode("reset");
        }
    }, []);

    // Redirect if already logged in (but not in reset mode)
    useEffect(() => {
        if (user && !isLoading && mode !== "reset") {
            navigate("/");
        }
    }, [user, isLoading, navigate, mode]);

    const onSubmit = async (values: AuthFormValues) => {
        setIsSubmitting(true);

        try {
            if (mode === "login") {
                const { error } = await signIn(values.email, values.password);
                if (error) {
                    if (error.message.includes("Invalid login credentials")) {
                        toast.error(t("auth.invalidCredentials"));
                    } else {
                        toast.error(error.message);
                    }
                } else {
                    toast.success(t("auth.welcomeBack"));
                    navigate("/");
                }
            } else if (mode === "signup") {
                const { data, error } = await signUp(values.email, values.password);
                if (error) {
                    if (error.message.includes("User already registered")) {
                        toast.error(t("auth.userExists"));
                    } else {
                        toast.error(error.message);
                    }
                } else {
                    toast.success(t("auth.accountCreated"));
                    setMode("login");
                    form.reset();
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const onForgotPassword = async (values: ResetFormValues) => {
        setIsSubmitting(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
                redirectTo: `${window.location.origin}/auth`,
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success(t("auth.resetEmailSent"));
                setMode("login");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const onResetPassword = async (values: NewPasswordFormValues) => {
        setIsSubmitting(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: values.password,
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success(t("auth.passwordUpdated"));
                // Clear the hash from URL
                window.history.replaceState(null, "", window.location.pathname);
                navigate("/");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const renderTitle = () => {
        switch (mode) {
            case "login":
                return t("auth.signInTitle");
            case "signup":
                return t("auth.signUpTitle");
            case "forgot":
                return t("auth.forgotTitle");
            case "reset":
                return t("auth.resetTitle");
            default:
                return "";
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEO title={t("auth.signIn")} description="Masuk atau daftar akun Kagōunga untuk melakukan pembelian dan menikmati berbagai fitur eksklusif." url="/auth" noindex={true} />
            {/* Header */}
            <header className="border-b border-border">
                <div className="container-page py-4">
                    <Link to="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {t("common.backToHome")}
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
                        {/* Logo/Brand */}
                        <div className="text-center mb-8">
                            <h1 className="font-heading text-3xl font-bold text-foreground">Kagōunga</h1>
                            <p className="text-muted mt-2">{renderTitle()}</p>
                        </div>

                        {/* Login/Signup Form */}
                        {(mode === "login" || mode === "signup") && (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("auth.email")}</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>{t("auth.password")}</FormLabel>
                                                    {mode === "login" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setMode("forgot");
                                                                resetForm.reset();
                                                            }}
                                                            className="text-xs text-accent hover:underline"
                                                        >
                                                            {t("auth.forgotPassword")}
                                                        </button>
                                                    )}
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} {...field} />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                {mode === "login" ? t("auth.signingIn") : t("auth.creatingAccount")}
                                            </>
                                        ) : mode === "login" ? (
                                            t("auth.signIn")
                                        ) : (
                                            t("auth.createAccount")
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {/* Forgot Password Form */}
                        {mode === "forgot" && (
                            <Form {...resetForm}>
                                <form onSubmit={resetForm.handleSubmit(onForgotPassword)} className="space-y-5">
                                    <FormField
                                        control={resetForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("auth.email")}</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                {t("auth.sending")}
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="h-4 w-4 mr-2" />
                                                {t("auth.sendResetLink")}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {/* New Password Form */}
                        {mode === "reset" && (
                            <Form {...newPasswordForm}>
                                <form onSubmit={newPasswordForm.handleSubmit(onResetPassword)} className="space-y-5">
                                    <FormField
                                        control={newPasswordForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("auth.newPassword")}</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="new-password" {...field} />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={newPasswordForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                                                <FormControl>
                                                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="new-password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                {t("auth.updating")}
                                            </>
                                        ) : (
                                            t("auth.updatePassword")
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {/* Toggle / Back links */}
                        <div className="mt-6 text-center">
                            {(mode === "login" || mode === "signup") && (
                                <p className="text-sm text-muted">
                                    {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode(mode === "login" ? "signup" : "login");
                                            form.reset();
                                        }}
                                        className="text-accent hover:underline font-medium"
                                    >
                                        {mode === "login" ? t("auth.signUp") : t("auth.signIn")}
                                    </button>
                                </p>
                            )}
                            {mode === "forgot" && (
                                <button type="button" onClick={() => setMode("login")} className="text-sm text-accent hover:underline font-medium">
                                    {t("auth.backToSignIn")}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Admin note */}
                    {(mode === "login" || mode === "signup") && <p className="text-center text-sm text-muted mt-6">{t("auth.adminNote")}</p>}
                </div>
            </main>
        </div>
    );
};

export default Auth;
