"use client";
import { useEffect, useState } from 'react';
import OrderInvoice from '@/components/OrderInvoice';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, Smartphone, AlertCircle } from 'lucide-react';
import { verifyUPIPaymentByToken } from '@/lib/paymentVerification';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function OrderConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [canVerifyPayment, setCanVerifyPayment] = useState(false);

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
                        
                        // Allow payment verification if payment is pending
                        if (parsedOrder.paymentMethod === 'UPI' && !isPaid) {
                            setCanVerifyPayment(true);
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

    // Handle manual payment verification
    const handleVerifyPayment = async () => {
        if (!order || isVerifying) return;

        setIsVerifying(true);
        toast.loading('Processing payment...', { id: 'verify-payment' });

        try {
            const result = await verifyUPIPaymentByToken(order.id);
            
            if (result.success) {
                toast.dismiss('verify-payment');
                toast.success('Payment confirmed! Showing invoice...', { duration: 2000 });
                setOrder(result.order);
                setPaymentVerified(true);
            } else {
                toast.dismiss('verify-payment');
                toast.error(result.error || 'Failed to process payment');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            toast.dismiss('verify-payment');
            toast.error('Error processing payment. Please try again.');
        } finally {
            setIsVerifying(false);
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
                <button onClick={() => router.push('/')} className="text-[#2F855A] font-bold underline">Go Home</button>
            </div>
        );
    }

    const isUPI = order.paymentMethod === 'UPI';
    const showPaymentPending = isUPI && !paymentVerified;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {showPaymentPending ? (
                    // Payment Pending State
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-10 h-10 text-yellow-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Pending</h1>
                            <p className="text-gray-600 text-lg mb-1">
                                Amount: <span className="font-bold text-[#2F855A]">₹{order.total.toFixed(2)}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                                Order ID: <span className="font-mono">{order.id}</span>
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 mb-6">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-[#2F855A]" />
                                Next Steps
                            </h3>
                            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                                <li>Complete the payment using your UPI app</li>
                                <li>Make sure the payment is successful</li>
                                <li>Return to this page and click "I've Paid" below</li>
                            </ol>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleVerifyPayment}
                                disabled={isVerifying}
                                className="w-full bg-[#2F855A] hover:bg-[#276f4b] text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Payment Completed
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-center text-gray-500">
                                Click this button after you have successfully completed the payment
                            </p>
                        </div>

                        {order.customer?.deliveryEstimate && (
                            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-xs text-gray-600 mb-1">Estimated Delivery</p>
                                <p className="text-sm font-semibold text-[#2F855A]">
                                    {order.customer.deliveryEstimate}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Invoice Display (Payment Verified)
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
                )}
            </div>
        </div>
    );
}
