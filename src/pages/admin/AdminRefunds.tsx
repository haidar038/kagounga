import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DollarSign, CheckCircle, XCircle, Clock, AlertCircle, Filter, RefreshCw, Loader2, CreditCard, ChevronLeft } from "lucide-react";
import { useRefundRequests, useUpdateRefundStatus, useProcessRefund, useSimulateRefundCompletion } from "@/hooks/useRefunds";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminRefunds() {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedRefund, setSelectedRefund] = useState<any | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: refunds, isLoading, error, refetch } = useRefundRequests(statusFilter !== "all" ? { status: statusFilter } : undefined);

    const updateStatus = useUpdateRefundStatus();
    const processRefund = useProcessRefund();
    const simulateCompletion = useSimulateRefundCompletion();

    const handleSimulateCompletion = async (refundId: string) => {
        try {
            await simulateCompletion.mutateAsync(refundId);
        } catch (error) {
            console.error("Failed to simulate refund completion:", error);
        }
    };

    const handleProcessRefund = async (refundId: string) => {
        try {
            await processRefund.mutateAsync(refundId);
        } catch (error) {
            console.error("Failed to process refund:", error);
        }
    };

    const handleApprove = async (refundId: string) => {
        await updateStatus.mutateAsync({
            id: refundId,
            status: "approved",
            admin_notes: adminNotes,
        });
        setDialogOpen(false);
        setAdminNotes("");
    };

    const handleReject = async (refundId: string) => {
        if (!adminNotes.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        await updateStatus.mutateAsync({
            id: refundId,
            status: "rejected",
            admin_notes: adminNotes,
        });
        setDialogOpen(false);
        setAdminNotes("");
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string; icon: any }> = {
            pending: { variant: "secondary", label: "Pending", icon: Clock },
            approved: { variant: "default", label: "Approved", icon: CheckCircle },
            rejected: { variant: "destructive", label: "Rejected", icon: XCircle },
            processing: { variant: "default", label: "Processing", icon: RefreshCw },
            completed: { variant: "default", label: "Completed", icon: CheckCircle },
            failed: { variant: "destructive", label: "Failed", icon: AlertCircle },
        };

        const config = variants[status] || variants.pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    const getReasonLabel = (reason: string) => {
        const labels: Record<string, string> = {
            FRAUDULENT: "Fraudulent",
            DUPLICATE: "Duplicate",
            REQUESTED_BY_CUSTOMER: "Customer Request",
            CANCELLATION: "Cancellation",
            OTHERS: "Others",
        };
        return labels[reason] || reason;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 " />
                    <p>Loading refund requests...</p>
                </div>
            </div>
        );
    }

    // Handle error - likely database table doesn't exist
    if (error) {
        return (
            <div className="space-y-6">
                <Link to="/admin">
                    <Button variant="ghost" size="sm">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Refund Management</h1>
                    <p className="text-muted-foreground mt-1">Review and process refund requests</p>
                </div>
                <Card className="border-destructive">
                    <CardContent className="py-12">
                        <div className="text-center space-y-4">
                            <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Database Setup Required</h3>
                                <p className="text-muted-foreground mb-4">The refund_requests table hasn't been created yet. Please run the database migrations first.</p>
                            </div>
                            <div className="bg-muted/10 p-4 rounded-lg text-left max-w-2xl mx-auto">
                                <p className="font-medium mb-2">Setup Instructions:</p>
                                <ol className="list-decimal list-inside space-y-2 text-sm">
                                    <li>Go to Supabase Dashboard → SQL Editor</li>
                                    <li>
                                        Run migration: <code className="bg-background px-2 py-1 rounded">20251225130001_create_refunds_schema.sql</code>
                                    </li>
                                    <li>
                                        Verify table exists: <code className="bg-background px-2 py-1 rounded">SELECT * FROM refund_requests LIMIT 1;</code>
                                    </li>
                                    <li>Refresh this page</li>
                                </ol>
                            </div>
                            <Button onClick={() => refetch()} variant="outline" className="bg-white">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link to="/admin">
                <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
            </Link>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Refund Management</h1>
                    <p className="text-muted-foreground mt-1">Review and process refund requests</p>
                </div>
                <Button variant="outline" className="bg-white" onClick={() => refetch()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <Filter className="w-5 h-5 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Refund Requests List */}
            <div className="grid gap-4">
                {refunds && refunds.length > 0 ? (
                    refunds.map((refund: any) => (
                        <Card key={refund.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Order #{refund.orders?.external_id || refund.order_id.slice(0, 8)}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {refund.orders?.customer_name} • {refund.orders?.customer_email}
                                        </p>
                                    </div>
                                    {getStatusBadge(refund.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Refund Amount</p>
                                        <p className="font-semibold text-lg">{formatCurrency(refund.amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Reason</p>
                                        <p className="font-medium">{getReasonLabel(refund.reason)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Requested On</p>
                                        <p className="font-medium">{format(new Date(refund.created_at), "PPp")}</p>
                                    </div>
                                    {refund.reviewed_at && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Reviewed On</p>
                                            <p className="font-medium">{format(new Date(refund.reviewed_at), "PPp")}</p>
                                        </div>
                                    )}
                                </div>

                                {refund.reason_note && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Customer Note</p>
                                        <p className="text-sm bg-muted/10 p-3 rounded">{refund.reason_note}</p>
                                    </div>
                                )}

                                {refund.admin_notes && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Admin Notes</p>
                                        <p className="text-sm bg-muted/10 p-3 rounded whitespace-pre-wrap">{refund.admin_notes}</p>
                                    </div>
                                )}

                                {/* Xendit Refund Info */}
                                {refund.xendit_refund_id && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CreditCard className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-900">Xendit Refund Details</span>
                                        </div>
                                        <div className="text-sm space-y-1">
                                            <p>
                                                <span className="text-blue-700">Refund ID:</span> <code className="bg-blue-100 px-1 rounded">{refund.xendit_refund_id}</code>
                                            </p>
                                            {refund.refund_method && (
                                                <p>
                                                    <span className="text-blue-700">Method:</span> {refund.refund_method}
                                                </p>
                                            )}
                                            {refund.completed_at && (
                                                <p>
                                                    <span className="text-blue-700">Completed:</span> {format(new Date(refund.completed_at), "PPp")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {refund.status === "pending" && (
                                    <div className="flex gap-2 pt-2">
                                        <Dialog open={dialogOpen && selectedRefund?.id === refund.id} onOpenChange={setDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="default" onClick={() => setSelectedRefund(refund)}>
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Approve
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Approve Refund</DialogTitle>
                                                    <DialogDescription>Approve refund request for {formatCurrency(refund.amount)}</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div>
                                                        <label className="text-sm font-medium">Admin Notes (Optional)</label>
                                                        <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Add any notes for this approval..." rows={3} className="mt-1" />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={() => handleApprove(refund.id)}>Confirm Approval</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="destructive" onClick={() => setSelectedRefund(refund)}>
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Reject Refund</DialogTitle>
                                                    <DialogDescription>Please provide a reason for rejection</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div>
                                                        <label className="text-sm font-medium">Rejection Reason *</label>
                                                        <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Explain why this refund is being rejected..." rows={3} className="mt-1" required />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button variant="destructive" onClick={() => handleReject(refund.id)}>
                                                        Confirm Rejection
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}

                                {/* Process Refund - for approved status */}
                                {refund.status === "approved" && (
                                    <div className="pt-2">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button className="w-full" disabled={processRefund.isPending}>
                                                    {processRefund.isPending ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CreditCard className="w-4 h-4 mr-2" />
                                                            Process Refund via Xendit
                                                        </>
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Process Refund</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will initiate a refund of {formatCurrency(refund.amount)} through Xendit. The refund will be processed to the customer's original payment method.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleProcessRefund(refund.id)}>Confirm Process</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                )}

                                {/* Processing indicator with Simulate button */}
                                {refund.status === "processing" && (
                                    <div className="space-y-3 pt-2">
                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                                                <span className="text-sm font-medium text-yellow-900">Refund is being processed by Xendit</span>
                                            </div>
                                            <p className="text-xs text-yellow-700 mt-1">You will be notified when the refund is completed.</p>
                                        </div>

                                        {/* TEST MODE: Simulate Completion Button */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" className="w-full border-dashed border-orange-400 text-orange-600 hover:bg-orange-50" disabled={simulateCompletion.isPending}>
                                                    {simulateCompletion.isPending ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Simulating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            🧪 [TEST MODE] Simulate Completion
                                                        </>
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>⚠️ Test Mode Only</AlertDialogTitle>
                                                    <AlertDialogDescription>This will directly mark the refund as completed without waiting for Xendit webhook. Only use this in test/development mode!</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleSimulateCompletion(refund.id)} className="bg-orange-500 hover:bg-orange-600">
                                                        Simulate Completion
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No refund requests found</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
