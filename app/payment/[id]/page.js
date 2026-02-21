"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { generatePaymentToken } from '@/lib/tokenGenerator';
import UPIPaySelector from '@/components/UPIPaySelector';
import { Loader2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.id;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentToken, setPaymentToken] = useState(null);
    const [tokenCopied, setTokenCopied] = useState(false);
    const visibilityPromptShown = useRef(false);

    useEffect(() => {
        const fetchOrder = () => {
            try {
                if (!orderId) {
                    setLoading(false);
                    return;
                }

                if (typeof window === 'undefined') {
                    setLoading(false);
                    return;
                }

                const savedOrder = localStorage.getItem(`order_${orderId}`);
                
                if (savedOrder) {
                    try {
                        const parsedOrder = JSON.parse(savedOrder);
                        setOrder(parsedOrder);
                        
                        // Generate payment token if not already generated
                        if (!parsedOrder.paymentToken) {
                            const token = generatePaymentToken(orderId);
                            parsedOrder.paymentToken = token;
                            parsedOrder.paymentStatus = 'Pending';
                            localStorage.setItem(`order_${orderId}`, JSON.stringify(parsedOrder));
                            setPaymentToken(token);
                        } else {
                            setPaymentToken(parsedOrder.paymentToken);
                        }
                    } catch (parseError) {
                        console.error('Error parsing order:', parseError);
                        setOrder(null);
                    }
                } else {
                    setOrder(null);
                }
            } catch (error) {
                console.error('Error fetching order:', error);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    // Detect when user returns from UPI app
    useEffect(() => {
        if (!order || !paymentToken) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !visibilityPromptShown.current) {
                visibilityPromptShown.current = true;
                
                // Check if payment was completed (token should be in notes)
                // For now, we'll auto-verify after user returns
                // In a real scenario, you'd check the payment status from backend
                setTimeout(() => {
                    // Auto-redirect to invoice after returning from UPI app
                    router.push(`/order-confirmation/${orderId}`);
                }, 1000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [order, paymentToken, orderId, router]);

    const copyToken = () => {
        if (paymentToken) {
            navigator.clipboard.writeText(paymentToken);
            setTokenCopied(true);
            toast.success('Token copied to clipboard!');
            setTimeout(() => setTokenCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-[#2F855A] animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
                <p className="text-gray-500 mb-6">We couldn't retrieve the order details.</p>
                <Link href="/" className="text-[#2F855A] font-bold underline">Go Home</Link>
            </div>
        );
    }

    const total = order.total || 0;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/checkout" className="inline-flex items-center text-gray-500 hover:text-[#2F855A] mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Checkout
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Payment</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Payment Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Token Display Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <AlertCircle className="w-6 h-6 text-[#2F855A] flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Important: Copy Your Payment Token</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Please copy the token below and paste it in the <strong>Notes/Remarks</strong> section when making the payment in your UPI app. This helps us verify your payment.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 border-2 border-dashed border-[#2F855A] rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-1">Your Payment Token</p>
                                        <code className="text-lg font-mono font-bold text-[#2F855A] break-all">
                                            {paymentToken}
                                        </code>
                                    </div>
                                    <button
                                        onClick={copyToken}
                                        className="flex-shrink-0 bg-[#2F855A] hover:bg-[#276f4b] text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                                    >
                                        {tokenCopied ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Step 1:</strong> Copy the token above<br />
                                    <strong>Step 2:</strong> Select your UPI app below and proceed to payment<br />
                                    <strong>Step 3:</strong> When making payment, paste the token in the Notes/Remarks field<br />
                                    <strong>Step 4:</strong> Complete the payment and return to this page
                                </p>
                            </div>
                        </div>

                        {/* UPI Payment Selector */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Payment Method</h3>
                            <UPIPaySelector
                                orderId={orderId}
                                amount={total}
                                paymentToken={paymentToken}
                                onProcessOrder={async () => {
                                    // Order is already saved, just return true
                                    return true;
                                }}
                            />
                        </div>
                    </div>

                    {/* Order Summary Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
                            
                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Items ({order.items?.length || 0})</span>
                                    <span>{formatPrice(order.subtotal || 0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                    <span>Total</span>
                                    <span className="text-[#2F855A]">{formatPrice(total)}</span>
                                </div>
                            </div>

                            {order.customer?.deliveryEstimate && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                                    <p className="text-xs text-gray-600 mb-1">Estimated Delivery</p>
                                    <p className="text-sm font-semibold text-[#2F855A]">
                                        {order.customer.deliveryEstimate}
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-2">Order ID</p>
                                    <p className="text-sm font-mono text-gray-700">{orderId}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

