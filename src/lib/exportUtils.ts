import ExcelJS from "exceljs";

interface Order {
    id: string;
    order_number?: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    status: string;
    total_amount: number;
    shipping_cost: number;
    shipping_address: string;
    city: string;
    items?: Array<{
        product_name: string;
        variant_name?: string;
        quantity: number;
        price: number;
    }>;
}

/**
 * Export orders to CSV format
 */
export async function exportOrdersToCSV(orders: Order[]): Promise<void> {
    const headers = ["Order ID", "Date", "Customer Name", "Email", "Phone", "Status", "Total Amount", "Shipping Cost", "City", "Items"];

    const rows = orders.map((order) => {
        const orderDate = new Date(order.created_at).toLocaleDateString("id-ID");
        const items = order.items
            ? order.items
                  .map((item) => {
                      const variantName = item.variant_name ? ` (${item.variant_name})` : "";
                      return `${item.product_name}${variantName} x${item.quantity}`;
                  })
                  .join("; ")
            : "";

        return [order.order_number || order.id, orderDate, order.customer_name, order.customer_email, order.customer_phone, order.status, order.total_amount, order.shipping_cost, order.city, items];
    });

    // Create CSV content
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export orders to Excel format with formatting
 */
export async function exportOrdersToExcel(orders: Order[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Orders Summary
    const summarySheet = workbook.addWorksheet("Orders Summary");

    // Define columns
    summarySheet.columns = [
        { header: "Order ID", key: "order_id", width: 20 },
        { header: "Date", key: "date", width: 15 },
        { header: "Customer Name", key: "customer_name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Status", key: "status", width: 12 },
        { header: "Total Amount", key: "total_amount", width: 15 },
        { header: "Shipping Cost", key: "shipping_cost", width: 15 },
        { header: "City", key: "city", width: 20 },
        { header: "Address", key: "address", width: 40 },
    ];

    // Style header row
    summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summarySheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0ea5e9" },
    };
    summarySheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    // Add data rows
    orders.forEach((order) => {
        const row = summarySheet.addRow({
            order_id: order.order_number || order.id,
            date: new Date(order.created_at).toLocaleDateString("id-ID"),
            customer_name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
            status: order.status,
            total_amount: order.total_amount,
            shipping_cost: order.shipping_cost,
            city: order.city,
            address: order.shipping_address,
        });

        // Format currency cells
        row.getCell("total_amount").numFmt = "Rp #,##0";
        row.getCell("shipping_cost").numFmt = "Rp #,##0";

        // Color code status
        const statusCell = row.getCell("status");
        switch (order.status) {
            case "DELIVERED":
                statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF10b981" } };
                statusCell.font = { color: { argb: "FFFFFFFF" } };
                break;
            case "SHIPPED":
                statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3b82f6" } };
                statusCell.font = { color: { argb: "FFFFFFFF" } };
                break;
            case "PROCESSING":
                statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf59e0b" } };
                break;
            case "CANCELLED":
            case "FAILED":
                statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFef4444" } };
                statusCell.font = { color: { argb: "FFFFFFFF" } };
                break;
        }
    });

    // Sheet 2: Order Items Details
    const itemsSheet = workbook.addWorksheet("Order Items");

    itemsSheet.columns = [
        { header: "Order ID", key: "order_id", width: 20 },
        { header: "Product Name", key: "product_name", width: 30 },
        { header: "Variant", key: "variant", width: 20 },
        { header: "Quantity", key: "quantity", width: 10 },
        { header: "Unit Price", key: "unit_price", width: 15 },
        { header: "Subtotal", key: "subtotal", width: 15 },
    ];

    // Style header
    itemsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    itemsSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0ea5e9" },
    };
    itemsSheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    // Add items data
    orders.forEach((order) => {
        if (order.items) {
            order.items.forEach((item) => {
                const row = itemsSheet.addRow({
                    order_id: order.order_number || order.id,
                    product_name: item.product_name,
                    variant: item.variant_name || "-",
                    quantity: item.quantity,
                    unit_price: item.price,
                    subtotal: item.quantity * item.price,
                });

                row.getCell("unit_price").numFmt = "Rp #,##0";
                row.getCell("subtotal").numFmt = "Rp #,##0";
            });
        }
    });

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split("T")[0]}.xlsx`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
