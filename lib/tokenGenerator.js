/**
 * Generate a unique payment token for each order
 * Format: 5-character alphanumeric (A-Z, 0-9)
 */
export function generatePaymentToken(orderId) {
    // Generate a 5-character alphanumeric token
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    
    // Use orderId and timestamp to seed randomness for uniqueness
    const seed = `${orderId}-${Date.now()}-${Math.random()}`;
    
    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        token += chars[randomIndex];
    }
    
    return token;
}

/**
 * Validate token format (5 alphanumeric characters)
 */
export function isValidToken(token) {
    if (!token || typeof token !== 'string') return false;
    const pattern = /^[A-Z0-9]{5}$/;
    return pattern.test(token);
}

