
import { CONFIG } from "./config";

export const generateOrderId = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    return `AJ-${yyyy}${mm}${dd}-${random}`;
};

export const buildUPI = (deeplink) => {
    // deeplink: { amount, orderId, merchantName, merchantUpi }
    // upi://pay?pa=yourupiid@bank&pn=YourBusinessName&am=${deeplink.amount}&cu=INR&tn=OrderID:${deeplink.orderId}
    // We need the merchant UPI ID. It should be in CONFIG or hardcoded if not provided.
    // The user prompt didn't provide a merchant UPI. I'll add a placeholder or use CONFIG field if I added it. 
    // I didn't add MERCHANT_UPI to CONFIG. I'll use a placeholder or ask user to fill it. 
    // User prompt said "Generate UPI deep link using: function buildUPI(deeplink)... const upiURI = ... pa=yourupiid@bank".
    // I will use a placeholder in the function.

    const merchantUpi = "example@upi"; // User needs to change this
    const merchantName = CONFIG.appName; // Use App Name

    return `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(merchantName)}&am=${deeplink.amount}&cu=INR&tn=OrderID:${deeplink.orderId}`;
};

export const submitOrderToGoogleSheets = async (order) => {
    if (!CONFIG.GOOGLE_SCRIPT_URL || CONFIG.GOOGLE_SCRIPT_URL.includes("PASTE_APPS_SCRIPT_URL")) {
        console.warn("Google Script URL is not configured.");
        return;
    }

    // Fields: Timestamp | OrderID | CustomerName | Phone | Email | Address | PreferredDateTime | ItemsJSON | Subtotal | Shipping | Total | PaymentMethod | PaymentStatus | UPI_Ref | Note
    const formData = new FormData();
    formData.append("Timestamp", new Date().toISOString());
    formData.append("OrderID", order.id);
    formData.append("CustomerName", order.customer.name);
    formData.append("Phone", order.customer.phone);
    formData.append("Email", order.customer.email || "");
    formData.append("Address", order.customer.address);
    formData.append("PreferredDateTime", order.customer.preferredDateTime || "");
    formData.append("ItemsJSON", JSON.stringify(order.items.map(i => `${i.name} (x${i.qty})`).join(", "))); // Simplified or full JSON? Prompt says "ItemsJSON". I'll send summary for readability or JSON. "ItemsJSON" suggests JSON.
    // Actually prompt says: "Items: {itemName} x{qty} — ₹{price}" for WhatsApp. For Sheets "ItemsJSON". I will send a clear string or JSON. I'll send JSON string.
    formData.append("ItemsJSON", JSON.stringify(order.items));
    formData.append("Subtotal", order.subtotal);
    formData.append("Shipping", order.shipping);
    formData.append("Total", order.total);
    formData.append("PaymentMethod", order.paymentMethod);
    formData.append("PaymentStatus", order.paymentStatus);
    formData.append("UPI_Ref", order.upiTxnRef || "");
    formData.append("Note", order.note || "");

    try {
        await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: formData,
            mode: "no-cors",
        });
        console.log("Order sent to Google Sheets");
    } catch (error) {
        console.error("Error sending order to Google Sheets", error);
    }
};

export const openWhatsAppConfirmation = (order) => {
    // Hi, I have placed an order.
    // Order ID: {orderId}
    // ...

    let itemsList = "";
    order.items.forEach(item => {
        itemsList += `\n${item.name} x${item.qty} — ₹${item.price}`;
    });

    const message = `Hi, I have placed an order.

Order ID: ${order.id}
Name: ${order.customer.name}
Phone: ${order.customer.phone}
Address: ${order.customer.address}
Payment Method: ${order.paymentMethod}

Items:${itemsList}

Total: ₹${order.total}

Please confirm availability.${order.paymentMethod === 'UPI' ? '\n(Screenshot of payment attached)' : ''}`;

    const url = `https://wa.me/${CONFIG.BUSINESS_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
};
