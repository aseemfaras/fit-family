import { submitOrderToGoogleSheets } from './orderService';

export const verifyUPIPayment = async (orderId, txnRef = '') => {
    try {
        // Update order in localStorage
        const orderKey = `order_${orderId}`;
        const savedOrder = localStorage.getItem(orderKey);
        
        if (!savedOrder) {
            return { success: false, error: 'Order not found' };
        }

        const order = JSON.parse(savedOrder);
        
        // Update payment status
        order.paymentStatus = 'Paid';
        order.upiTxnRef = txnRef || order.upiTxnRef || '';
        order.paidAt = new Date().toISOString();
        
        // Save updated order
        localStorage.setItem(orderKey, JSON.stringify(order));
        
        // Update Google Sheets with payment confirmation (non-blocking)
        submitOrderToGoogleSheets(order).catch(err => {
            console.error('Error updating Google Sheets:', err);
            // Don't block the flow if Sheets update fails
        });
        
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

