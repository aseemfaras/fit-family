"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { generatePaymentToken } from '@/lib/tokenGenerator';
import UPIPaySelector from '@/components/UPIPaySelector';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.id;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentToken, setPaymentToken] = useState(null);

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
                        {/* UPI Payment Selector */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Pay Using UPI App</h3>
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

