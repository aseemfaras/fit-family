"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { generateOrderId, submitOrderToGoogleSheets } from "@/lib/orderService";

import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { CONFIG } from "@/lib/config";
import UPIPaySelector from "@/components/UPIPaySelector";

export default function CheckoutPage() {
    const { cart, getCartTotal, clearCart } = useCart();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        preferredDateTime: "",
        note: ""
    });

    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderId, setOrderId] = useState("");

    useEffect(() => {
        setMounted(true);
        setOrderId(generateOrderId());
    }, []);

    const total = getCartTotal();
    const isCodDisabled = total > 1500;

    useEffect(() => {
        if (isCodDisabled && paymentMethod === "COD") {
            setPaymentMethod("UPI");
        }
    }, [total, isCodDisabled, paymentMethod]);

    useEffect(() => {
        if (mounted && cart.length === 0) {
            router.push("/cart");
        }
    }, [cart, mounted, router]);

    if (!mounted || cart.length === 0) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const processOrder = async (shouldRedirect = true) => {
        // Validation
        if (!formData.name || !formData.phone || !formData.address) {
            toast.error("Please fill in all required fields.");
            return false;
        }

        const order = {
            id: orderId,
            createdAt: new Date().toISOString(),
            customer: formData,
            items: cart,
            subtotal: total,
            shipping: 0,
            total: total,
            paymentMethod: paymentMethod,
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
            // For COD orders, save immediately
            if (paymentMethod !== 'UPI') {
                submitOrderToGoogleSheets(order).catch(err => {
                    console.error("Error sending to Google Sheets:", err);
                    // Don't block the order flow if Sheets fails
                });
            } else {
                console.log('UPI order - will be saved to Google Sheets after payment verification');
            }

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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Street, City, Pincode"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date & Time</label>
                                <input
                                    type="text"
                                    name="preferredDateTime"
                                    value={formData.preferredDateTime}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all"
                                    placeholder="e.g., Tomorrow Morning"
                                />
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
                        </form>
                    </div>
                </div>

                {/* Order Summary & Payment */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>

                        <div className="space-y-3">
                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#2F855A] bg-green-50 ring-1 ring-[#2F855A]' : 'border-gray-200 hover:border-gray-300'} ${isCodDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                    disabled={isCodDisabled}
                                    className="w-4 h-4 text-[#2F855A] focus:ring-[#2F855A]"
                                />
                                <div className="ml-3 flex-1">
                                    <span className="block font-medium text-gray-900">Cash on Delivery</span>
                                    <span className="block text-xs text-gray-500">Pay when you receive orders</span>
                                </div>
                                {isCodDisabled && <span className="text-xs text-red-500 font-medium">Over ₹1500 only Pre-paid</span>}
                            </label>

                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-[#2F855A] bg-green-50 ring-1 ring-[#2F855A]' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="UPI"
                                    checked={paymentMethod === 'UPI'}
                                    onChange={() => setPaymentMethod('UPI')}
                                    className="w-4 h-4 text-[#2F855A] focus:ring-[#2F855A]"
                                />
                                <div className="ml-3">
                                    <span className="block font-medium text-gray-900">UPI / QR Code</span>
                                    <span className="block text-xs text-gray-500">GPay, PhonePe, Paytm</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Summary</h2>
                        <div className="space-y-3 mb-4 text-sm">
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

                        {paymentMethod === 'UPI' && orderId ? (
                            <div className="mt-4">
                                <UPIPaySelector
                                    orderId={orderId}
                                    amount={total}
                                    onProcessOrder={async () => {
                                        const success = await processOrder(false);
                                        if (success) {
                                            // Redirect to confirmation page after a short delay
                                            setTimeout(() => {
                                                router.push(`/order-confirmation/${orderId}`);
                                            }, 500);
                                        }
                                        return success;
                                    }}
                                />
                            </div>
                        ) : paymentMethod === 'UPI' ? (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                <p className="text-sm">Loading payment options...</p>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="w-full bg-[#2F855A] hover:bg-[#276f4b] text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Place Order
                                            <CheckCircle className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-center text-gray-400 mt-3">
                                    Your order will be confirmed after submission.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
