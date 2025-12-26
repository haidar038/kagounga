import { useState } from "react";
import { useCreateRefundRequest } from "@/hooks/useRefunds";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DollarSign, Loader2 } from "lucide-react";

interface RefundRequestFormProps {
    orderId: string;
    orderAmount: number;
    orderNumber?: string;
}

const REFUND_REASONS = {
    FRAUDULENT: "Fraudulent Transaction",
    DUPLICATE: "Duplicate Order",
    REQUESTED_BY_CUSTOMER: "Customer Request",
    CANCELLATION: "Order Cancellation",
    OTHERS: "Other Reasons",
} as const;

export function RefundRequestForm({ orderId, orderAmount, orderNumber }: RefundRequestFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState<keyof typeof REFUND_REASONS>("REQUESTED_BY_CUSTOMER");
    const [reasonNote, setReasonNote] = useState("");
    const [amount, setAmount] = useState(orderAmount);

    const createRefund = useCreateRefundRequest();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const handleSubmit = async () => {
        if (!reason) {
            alert("Please select a refund reason");
            return;
        }

        if (amount <= 0 || amount > orderAmount) {
            alert(`Refund amount must be between 0 and ${formatCurrency(orderAmount)}`);
            return;
        }

        try {
            await createRefund.mutateAsync({
                order_id: orderId,
                reason,
                reason_note: reasonNote.trim() || undefined,
                amount,
            });
            setIsOpen(false);
            // Reset form
            setReasonNote("");
            setAmount(orderAmount);
        } catch (error) {
            console.error("Failed to submit refund request:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Request Refund
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Request Refund</DialogTitle>
                    <DialogDescription>Submit a refund request for order {orderNumber || orderId.slice(0, 8)}. Our team will review your request.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Refund Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Refund Reason *</Label>
                        <Select value={reason} onValueChange={(value) => setReason(value as keyof typeof REFUND_REASONS)}>
                            <SelectTrigger id="reason">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(REFUND_REASONS).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Refund Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Refund Amount *</Label>
                        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={0} max={orderAmount} placeholder={formatCurrency(orderAmount)} />
                        <p className="text-xs text-muted-foreground">Maximum refundable amount: {formatCurrency(orderAmount)}</p>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="reason_note">Additional Details (Optional)</Label>
                        <Textarea id="reason_note" value={reasonNote} onChange={(e) => setReasonNote(e.target.value)} rows={4} placeholder="Please provide additional details about your refund request..." />
                        <p className="text-xs text-muted-foreground">Provide any additional information that might help us process your refund faster.</p>
                    </div>

                    {/* Important Notice */}
                    <div className="rounded-lg bg-muted/10 p-3 text-sm">
                        <p className="font-medium mb-1">Important:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Refund requests are reviewed within 1-3 business days</li>
                            <li>Approved refunds are processed to your original payment method</li>
                            <li>Processing time depends on your payment provider</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={createRefund.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={createRefund.isPending}>
                        {createRefund.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
