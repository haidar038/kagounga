/**
 * INSTRUKSI: Tambahkan code berikut ke AdminTransactions.tsx
 *
 * Lokasi: Setelah line 714 (setelah tracking input </div>)
 * Sebelum line 715 (<Button onClick={handleShipOrder}...)
 *
 * Copy-paste code di bawah ini:
 */

{
    /* Local Delivery Toggle */
}
<div className="flex items-center space-x-2 py-2 rounded-lg border p-3 bg-muted/30">
    <Switch
        id="local-delivery-toggle"
        checked={isLocalDelivery}
        onCheckedChange={(checked) => {
            setIsLocalDelivery(checked);
            if (checked) {
                setCourier("local_delivery");
            }
        }}
    />
    <Label htmlFor="local-delivery-toggle" className="cursor-pointer font-medium">
        📍 Pengiriman Lokal Ternate
    </Label>
</div>;

{
    /* Shipping Notes for Local Delivery */
}
{
    isLocalDelivery && (
        <div>
            <Label htmlFor="shipping-notes">Delivery Notes (Optional)</Label>
            <Textarea id="shipping-notes" value={shippingNotes} onChange={(e) => setShippingNotes(e.target.value)} placeholder="e.g., Delivery address details, contact person, special instructions..." rows={3} />
            <p className="text-xs text-muted-foreground mt-1">Additional notes for local delivery courier</p>
        </div>
    );
}
