export function buildUPI({ amount, orderId }) {
    // Note: Constants should be imported from CONFIG, but keeping this pure as requested.
    // We will pass the constants or import them. The prompt says "Use the supplied / updated buildUPI function"
    // and implies referencing CONFIG.
    const { CONFIG } = require('./config');

    const am = Number(amount).toFixed(2);
    // Use CONFIG.BUSINESS_UPI_ID and BUSINESS_NAME from config
    const upiURI = `upi://pay?pa=${encodeURIComponent(CONFIG.BUSINESS_UPI_ID)}&pn=${encodeURIComponent(CONFIG.BUSINESS_NAME)}&am=${am}&cu=INR&tn=OrderID:${encodeURIComponent(orderId)}`;
    return upiURI;
}

export function buildAppDeepLink(upiURI, appKey, platform) {
    // appKey: 'gpay', 'phonepe', 'paytm', 'bhim', 'cred'

    // Base params from the generated UPI URI
    const cleanParams = upiURI.replace('upi://pay?', '');

    if (platform === 'android') {
        const { CONFIG } = require('./config');
        const packageName = CONFIG.UPI_APP_PACKAGES[appKey];
        if (!packageName) return upiURI;

        // Use Intent for Android (works best in Chrome)
        // intent://pay?pa=...#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end
        return `intent://pay?${cleanParams}#Intent;scheme=upi;package=${packageName};end`;
    }

    if (platform === 'ios') {
        // iOS URL Schemes
        // GPay: gpay://upi/pay? or tez://upi/pay?
        // PhonePe: phonepe://upi/pay?
        // Paytm: paytm://upi/pay?
        // BHIM: bhim://upi/pay? or upi:// (BHIM handles default usually)

        switch (appKey) {
            case 'gpay': return `gpay://upi/pay?${cleanParams}`; // Try gpay:// first
            case 'phonepe': return `phonepe://upi/pay?${cleanParams}`;
            case 'paytm': return `paytm://upi/pay?${cleanParams}`;
            case 'bhim': return `bhim://upi/pay?${cleanParams}`;
            case 'cred': return `cred://upi/pay?${cleanParams}`;
            default: return upiURI; // Fallback to universal upi://
        }
    }

    // Desktop or Unknown
    return upiURI;
}
