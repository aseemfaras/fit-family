import { submitOrderToGoogleSheets } from './orderService';
import { isValidToken } from './tokenGenerator';

/**
 * Verify UPI payment using token
 * This function checks if the order has a payment token and marks it as paid
 * In a real scenario, you would verify the token from the payment gateway/backend
 */
export const verifyUPIPaymentByToken = async (orderId) => {
    try {
        const orderKey = `order_${orderId}`;
        const savedOrder = localStorage.getItem(orderKey);
        
        if (!savedOrder) {
            return { success: false, error: 'Order not found' };
        }

        const order = JSON.parse(savedOrder);
        
        // Check if order has a payment token
        if (!order.paymentToken) {
            return { success: false, error: 'Payment token not found for this order' };
        }

        // Validate token format
        if (!isValidToken(order.paymentToken)) {
            return { success: false, error: 'Invalid payment token format' };
        }
        
        // Mark payment as verified (in real scenario, verify with backend)
        order.paymentStatus = 'Paid';
        order.paidAt = new Date().toISOString();
        // Store token as transaction reference
        order.upiTxnRef = order.paymentToken;
        
        // Save updated order
        localStorage.setItem(orderKey, JSON.stringify(order));
        
        // Update Google Sheets with payment confirmation
        try {
            await submitOrderToGoogleSheets(order);
            console.log('Order with payment token sent to Google Sheets');
        } catch (err) {
            console.error('Error updating Google Sheets:', err);
            // Don't block the flow if Sheets update fails, but log it
        }
        
        return { success: true, order };
    } catch (error) {
        console.error('Payment verification error:', error);
        return { success: false, error: error.message || 'Failed to verify payment' };
    }
};

// Keep old function for backward compatibility (if needed)
export const verifyUPIPayment = async (orderId, txnRef = '') => {
    // If txnRef is provided and looks like a token, use token verification
    if (txnRef && isValidToken(txnRef)) {
        // Update order with provided token
        const orderKey = `order_${orderId}`;
        const savedOrder = localStorage.getItem(orderKey);
        if (savedOrder) {
            const order = JSON.parse(savedOrder);
            order.paymentToken = txnRef.trim();
            localStorage.setItem(orderKey, JSON.stringify(order));
        }
        return verifyUPIPaymentByToken(orderId);
    }
    
    // Otherwise, use old transaction ID method
    try {
        if (!txnRef || !txnRef.trim()) {
            return { success: false, error: 'Transaction ID is required' };
        }

        const orderKey = `order_${orderId}`;
        const savedOrder = localStorage.getItem(orderKey);
        
        if (!savedOrder) {
            return { success: false, error: 'Order not found' };
        }

        const order = JSON.parse(savedOrder);
        
        order.paymentStatus = 'Paid';
        order.upiTxnRef = txnRef.trim();
        order.paidAt = new Date().toISOString();
        
        localStorage.setItem(orderKey, JSON.stringify(order));
        
        try {
            await submitOrderToGoogleSheets(order);
            console.log('Order with transaction ID sent to Google Sheets');
        } catch (err) {
            console.error('Error updating Google Sheets:', err);
        }
        
        return { success: true, order };
    } catch (error) {
        console.error('Payment verification error:', error);
        return { success: false, error: error.message || 'Failed to verify payment' };
    }
};

export const getPaymentStatus = (orderId) => {
    try {
        const orderKey = `order_${orderId}`;
        const savedOrder = localStorage.getItem(orderKey);
        
        if (!savedOrder) {
            return null;
        }

        const order = JSON.parse(savedOrder);
        return {
            paymentStatus: order.paymentStatus || 'Pending',
            upiTxnRef: order.upiTxnRef || '',
            paidAt: order.paidAt || null
        };
    } catch (error) {
        console.error('Error getting payment status:', error);
        return null;
    }
};

