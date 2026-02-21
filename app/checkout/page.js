"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { generateOrderId, submitOrderToGoogleSheets } from "@/lib/orderService";

import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle, Loader2, Truck } from "lucide-react";
import Link from "next/link";
import { CONFIG } from "@/lib/config";
import { getDeliveryEstimate, getPincodeDetails } from "@/lib/deliveryEstimate";

export default function CheckoutPage() {
    const { cart, getCartTotal, clearCart } = useCart();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        houseBuilding: "",
        areaStreetSector: "",
        pincode: "",
        landmark: "",
        townCity: "",
        state: "",
        note: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [deliveryEstimate, setDeliveryEstimate] = useState(null);
    const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
    const [isFetchingPincode, setIsFetchingPincode] = useState(false);
    const [pincodeAutoFilled, setPincodeAutoFilled] = useState(false);

    useEffect(() => {
        setMounted(true);
        setOrderId(generateOrderId());
    }, []);

    const total = getCartTotal();

    useEffect(() => {
        if (mounted && cart.length === 0) {
            router.push("/cart");
        }
    }, [cart, mounted, router]);

    // Auto-fill city and state when pincode is entered
    useEffect(() => {
        const fetchPincodeDetails = async () => {
            if (formData.pincode && formData.pincode.length === 6) {
                setIsFetchingPincode(true);
                try {
                    const details = await getPincodeDetails(formData.pincode);
                    if (details && (details.city || details.state)) {
                        setFormData(prev => {
                            // Only auto-fill if fields are empty (preserve user input)
                            const newData = { ...prev };
                            if (details.city && !prev.townCity) {
                                newData.townCity = details.city;
                            }
                            if (details.state && !prev.state) {
                                newData.state = details.state;
                            }
                            return newData;
                        });
                        // Only mark as auto-filled if we actually filled something
                        if (details.city || details.state) {
                            setPincodeAutoFilled(true);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching pincode details:', error);
                } finally {
                    setIsFetchingPincode(false);
                }
            } else {
                // Reset auto-filled state when pincode is cleared or incomplete
                if (formData.pincode.length < 6) {
                    setPincodeAutoFilled(false);
                }
            }
        };

        // Debounce the API call
        const timeoutId = setTimeout(fetchPincodeDetails, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.pincode]);

    // Calculate delivery estimate when pincode changes
    useEffect(() => {
        const calculateEstimate = async () => {
            if (formData.pincode && formData.pincode.length === 6) {
                setIsCalculatingDelivery(true);
                try {
                    const estimate = await getDeliveryEstimate(formData.pincode);
                    setDeliveryEstimate(estimate);
                } catch (error) {
                    console.error('Error calculating delivery estimate:', error);
                    setDeliveryEstimate(null);
                } finally {
                    setIsCalculatingDelivery(false);
                }
            } else {
                setDeliveryEstimate(null);
            }
        };

        // Debounce the API call
        const timeoutId = setTimeout(calculateEstimate, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.pincode]);

    if (!mounted || cart.length === 0) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const processOrder = async (shouldRedirect = true) => {
        // Validation
        if (!formData.name || !formData.phone) {
            toast.error("Please fill in all required fields.");
            return false;
        }

        // Validate all required address fields (landmark is optional)
        const requiredAddressFields = [
            formData.houseBuilding,
            formData.areaStreetSector,
            formData.pincode,
            formData.townCity,
            formData.state
        ];

        if (requiredAddressFields.some(field => !field || !field.trim())) {
            toast.error("Please fill in all required address fields.");
            return false;
        }

        // Combine address fields into a single comma-separated string (landmark is optional)
        const combinedAddress = [
            formData.houseBuilding,
            formData.areaStreetSector,
            formData.pincode,
            formData.landmark, // Optional field, will be filtered if empty
            formData.townCity,
            formData.state
        ].filter(field => field && field.trim()).join(", ");

        // Format delivery estimate for storage
        const deliveryEstimateText = deliveryEstimate 
            ? `${deliveryEstimate.minDate} to ${deliveryEstimate.maxDate}`
            : null;

        const order = {
            id: orderId,
            createdAt: new Date().toISOString(),
            customer: {
                ...formData,
                address: combinedAddress, // Store combined address
                deliveryEstimate: deliveryEstimateText // Store delivery estimate
            },
            items: cart,
            subtotal: total,
            shipping: 0,
            total: total,
            paymentMethod: "UPI",
            paymentStatus: "Pending",
            upiTxnRef: "",
            note: formData.note
        };

        try {
            // Save local
            console.log('Saving order to local storage:', order);
            const orderJson = JSON.stringify(order);
            localStorage.setItem(`order_${orderId}`, orderJson);

            // Verify save with a small delay to ensure write is complete
            await new Promise(resolve => setTimeout(resolve, 100));
            const verify = localStorage.getItem(`order_${orderId}`);
            if (!verify) {
                console.error("FAILED TO SAVE ORDER TO LOCAL STORAGE");
                toast.error("System Error: Could not save order.");
                return false;
            }

            // Verify the order data matches
            try {
                const verifiedOrder = JSON.parse(verify);
                if (verifiedOrder.id !== orderId) {
                    console.error("Order ID mismatch after save");
                    toast.error("System Error: Order verification failed.");
                    return false;
                }
            } catch (verifyError) {
                console.error("Error verifying saved order:", verifyError);
                toast.error("System Error: Could not verify order.");
                return false;
            }

            // Send to Sheets (non-blocking)
            // For UPI orders, don't save to Sheets until payment is verified
            console.log('UPI order - will be saved to Google Sheets after payment verification');

            // Clear Cart
            clearCart();

            // Redirect to Confirmation Page (which persists state)
            if (shouldRedirect) {
                toast.success("Order Placed Successfully!");
                // Use setTimeout to ensure state is saved before navigation
                setTimeout(() => {
                    router.push(`/order-confirmation/${orderId}`);
                }, 200);
            }

            return true;
        } catch (error) {
            console.error("Order processing error:", error);
            toast.error("Failed to place order. Please try again.");
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await processOrder(true);
        setIsSubmitting(false);
    };



    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
            <Link href="/cart" className="inline-flex items-center text-gray-500 hover:text-[#2F855A] mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cart
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form */}
                <div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Contact & Delivery</h2>
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all"
                                    placeholder="9876543210"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">House/Flat Number & Building/Apartment *</label>
                                    <input
                                        type="text"
                                        name="houseBuilding"
                                        value={formData.houseBuilding}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all"
                                        placeholder="e.g., 123, Flat 4A, Green Valley Apartments"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Area/Street/Sector/Village *</label>
                                    <input
                                        type="text"
                                        name="areaStreetSector"
                                        value={formData.areaStreetSector}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all"
                                        placeholder="e.g., Sector 5, Main Street"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            required
                                            maxLength={6}
                                            pattern="[0-9]{6}"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all"
                                            placeholder="e.g., 110001"
                                        />
                                        {isFetchingPincode && formData.pincode.length === 6 && (
                                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Fetching city and state...
                                            </p>
                                        )}
                                        {pincodeAutoFilled && !isFetchingPincode && formData.pincode.length === 6 && (
                                            <p className="text-xs text-green-600 mt-1">✓ City and state auto-filled</p>
                                        )}
                                        {isCalculatingDelivery && formData.pincode.length === 6 && (
                                            <p className="text-xs text-gray-500 mt-1">Calculating delivery time...</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            value={formData.landmark}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all"
                                            placeholder="e.g., Near Park"
                                        />
                                    </div>
                                </div>

                                {/* Delivery Estimate Display */}
                                {deliveryEstimate && !isCalculatingDelivery && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Truck className="w-5 h-5 text-[#2F855A] mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-[#2F855A] mb-1">
                                                Estimated Delivery
                                            </p>
                                            <p className="text-sm text-gray-700 font-medium">
                                                {deliveryEstimate.minDate} to {deliveryEstimate.maxDate}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                ({deliveryEstimate.minDays}-{deliveryEstimate.maxDays} business days from order date)
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Town/City *
                                        {pincodeAutoFilled && formData.townCity && (
                                            <span className="ml-2 text-xs text-green-600 font-normal">(Auto-filled)</span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        name="townCity"
                                        value={formData.townCity}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all ${
                                            pincodeAutoFilled && formData.townCity ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                                        }`}
                                        placeholder="e.g., New Delhi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State *
                                        {pincodeAutoFilled && formData.state && (
                                            <span className="ml-2 text-xs text-green-600 font-normal">(Auto-filled)</span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all ${
                                            pincodeAutoFilled && formData.state ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                                        }`}
                                        placeholder="e.g., Delhi"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Any special instructions?"
                                ></textarea>
                            </div>

                            {/* Complete Payment Button */}
                            <button
                                type="button"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    // Validate address fields
                                    const requiredAddressFields = [
                                        formData.name,
                                        formData.phone,
                                        formData.houseBuilding,
                                        formData.areaStreetSector,
                                        formData.pincode,
                                        formData.townCity,
                                        formData.state
                                    ];

                                    if (requiredAddressFields.some(field => !field || !field.trim())) {
                                        toast.error("Please fill in all required fields.");
                                        return;
                                    }

                                    if (formData.pincode.length !== 6) {
                                        toast.error("Please enter a valid 6-digit pincode.");
                                        return;
                                    }

                                    // Save order data temporarily and redirect to payment page
                                    setIsSubmitting(true);
                                    const success = await processOrder(false);
                                    setIsSubmitting(false);
                                    
                                    if (success) {
                                        setTimeout(() => {
                                            router.push(`/payment/${orderId}`);
                                        }, 200);
                                    }
                                }}
                                disabled={isSubmitting}
                                className="w-full bg-[#2F855A] hover:bg-[#276f4b] text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg mt-6"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Complete Payment
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Items ({cart.length})</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
