"use client";
import { useEffect, useState, useRef } from 'react';
import OrderInvoice from '@/components/OrderInvoice';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';
import { verifyUPIPaymentByToken } from '@/lib/paymentVerification';

export default function OrderConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentVerified, setPaymentVerified] = useState(false);
    const visibilityPromptShown = useRef(false);

    useEffect(() => {
        const fetchOrder = () => {
            try {
                const id = params?.id;
                console.log('OrderConfirmation: ID from params:', id);

                if (!id) {
                    setLoading(false);
                    return;
                }

                // Check if we're on client side
                if (typeof window === 'undefined') {
                    setLoading(false);
                    return;
                }

                const savedOrder = localStorage.getItem(`order_${id}`);
                console.log('OrderConfirmation: Loaded order:', savedOrder ? 'Found' : 'Not Found');

                if (savedOrder) {
                    try {
                        const parsedOrder = JSON.parse(savedOrder);
                        setOrder(parsedOrder);
                        
                        // Check payment status for UPI orders
                        const isPaid = parsedOrder.paymentStatus === 'Paid';
                        setPaymentVerified(isPaid);
                        
                        // If order has payment token and user is returning, auto-verify
                        if (parsedOrder.paymentToken && !isPaid) {
                            // Auto-verify payment when user returns (they should have pasted token in UPI app)
                            verifyUPIPaymentByToken(parsedOrder.id).then(result => {
                                if (result.success) {
                                    setOrder(result.order);
                                    setPaymentVerified(true);
                                }
                            });
                        }
                    } catch (parseError) {
                        console.error('Error parsing order from localStorage:', parseError);
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
    }, [params?.id]);

    // Detect when user returns from UPI app (page visibility change)
    useEffect(() => {
        if (!order || order.paymentMethod !== 'UPI' || paymentVerified) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !visibilityPromptShown.current) {
                visibilityPromptShown.current = true;
                
                // Auto-verify payment when user returns (they should have pasted token in UPI app)
                setTimeout(async () => {
                    if (!paymentVerified && order.paymentToken) {
                        const result = await verifyUPIPaymentByToken(order.id);
                        if (result.success) {
                            setOrder(result.order);
                            setPaymentVerified(true);
                        }
                    }
                }, 1500);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [order, paymentVerified]);

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
                <button onClick={() => router.push('/')} className="text-[#2F855A] font-bold underline">Go Home</button>
            </div>
        );
    }

    const isUPI = order.paymentMethod === 'UPI';

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Show invoice - payment is auto-verified when user returns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Invoice Section */}
                    <div className={`${isUPI ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                        <OrderInvoice order={order} />
                    </div>

                    {/* Payment Info Section (Only for UPI - already paid) */}
                    {isUPI && paymentVerified && (
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-8">
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">Payment Confirmed</h3>
                                        <p className="text-sm text-gray-600">
                                            Your payment of <span className="font-bold text-[#2F855A]">₹{order.total.toFixed(2)}</span> has been verified
                                        </p>
                                        {order.paymentToken && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Token: <span className="font-mono">{order.paymentToken}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
