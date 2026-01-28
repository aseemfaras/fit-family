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

export function buildIntentURI(upiURI, packageName) {
    if (!packageName) return upiURI;

    // Android Intent URL structure for UPI
    // intent://payment_info#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end
    // The upiURI already contains "upi://pay?..."

    // We need to strip "upi://" and wrap it in intent
    const cleanURI = upiURI.replace('upi://', '');

    // Chrome on Android expects:
    // intent://<host_path_query>#Intent;scheme=upi;package=...;end

    return `intent://${cleanURI}#Intent;scheme=upi;package=${packageName};end`;
}
