// Base pincode coordinates (416012 - Kolhapur, Maharashtra)
const BASE_PINCODE = "416012";
const BASE_COORDINATES = {
    lat: 16.68,  // Latitude for pincode 416012
    lng: 74.23   // Longitude for pincode 416012
};

// Haversine formula to calculate distance between two coordinates in kilometers
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Get coordinates for a pincode using India Post API
async function getPincodeCoordinates(pincode) {
    if (!pincode || pincode.length !== 6) {
        return null;
    }

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            // Some pincodes may not have coordinates in the API
            // In that case, we'll use a fallback based on pincode prefix
            if (postOffice.Latitude && postOffice.Longitude) {
                return {
                    lat: parseFloat(postOffice.Latitude),
                    lng: parseFloat(postOffice.Longitude)
                };
            }
        }
        
        // Fallback: Return null if coordinates not available
        return null;
    } catch (error) {
        console.error('Error fetching pincode coordinates:', error);
        return null;
    }
}

// Fetch pincode details (city, state) from India Post API
export async function getPincodeDetails(pincode) {
    if (!pincode || pincode.length !== 6) {
        return null;
    }

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            return {
                city: postOffice.District || postOffice.Name || '',
                state: postOffice.State || '',
                district: postOffice.District || '',
                postOfficeName: postOffice.Name || ''
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching pincode details:', error);
        return null;
    }
}

// Calculate delivery estimate based on distance
export async function calculateDeliveryEstimate(customerPincode) {
    if (!customerPincode || customerPincode.length !== 6) {
        return null;
    }

    // If same pincode, definitely within 50km
    if (customerPincode === BASE_PINCODE) {
        return { minDays: 2, maxDays: 4, distance: 0 };
    }

    // Try to get coordinates for customer pincode
    const customerCoords = await getPincodeCoordinates(customerPincode);
    
    if (customerCoords) {
        // Calculate actual distance
        const distance = calculateDistance(
            BASE_COORDINATES.lat,
            BASE_COORDINATES.lng,
            customerCoords.lat,
            customerCoords.lng
        );

        if (distance <= 50) {
            return { minDays: 2, maxDays: 4, distance: distance.toFixed(1) };
        } else {
            return { minDays: 4, maxDays: 7, distance: distance.toFixed(1) };
        }
    } else {
        // Fallback: Use pincode prefix matching for same region
        const pincodePrefix = customerPincode.substring(0, 3);
        const basePrefix = BASE_PINCODE.substring(0, 3);
        
        // If same region (first 3 digits), likely within 50km
        if (pincodePrefix === basePrefix) {
            return { minDays: 2, maxDays: 4, distance: null };
        }
        
        // For other pincodes, assume > 50km
        return { minDays: 4, maxDays: 7, distance: null };
    }
}

// Get estimated delivery date range
export function getDeliveryDateRange(estimate) {
    if (!estimate) return null;

    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + estimate.minDays);
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + estimate.maxDays);

    return {
        minDate: minDate.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }),
        maxDate: maxDate.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }),
        minDays: estimate.minDays,
        maxDays: estimate.maxDays,
        distance: estimate.distance
    };
}

// Main function to get delivery estimate with date range
export async function getDeliveryEstimate(pincode) {
    if (!pincode || pincode.length !== 6) {
        return null;
    }

    const estimate = await calculateDeliveryEstimate(pincode);
    if (!estimate) return null;

    return getDeliveryDateRange(estimate);
}

