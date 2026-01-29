import { submitOrderToGoogleSheets } from './orderService';

export const verifyUPIPayment = async (orderId, txnRef = '') => {
    try {
        // Validate transaction ID
        if (!txnRef || !txnRef.trim()) {
            return { success: false, error: 'Transaction ID is required' };
        }

        // Update order in localStorage
        const orderKey = `order_${orderId}`;
        const savedOrder = localStorage.getItem(orderKey);
        
        if (!savedOrder) {
            return { success: false, error: 'Order not found' };
        }

        const order = JSON.parse(savedOrder);
        
        // Update payment status with transaction ID
        order.paymentStatus = 'Paid';
        order.upiTxnRef = txnRef.trim();
        order.paidAt = new Date().toISOString();
        
        // Save updated order
        localStorage.setItem(orderKey, JSON.stringify(order));
        
        // Update Google Sheets with payment confirmation and transaction ID
        // This will save the transaction ID to the UPI_Ref column in Google Sheets
        try {
            await submitOrderToGoogleSheets(order);
            console.log('Order with transaction ID sent to Google Sheets');
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

