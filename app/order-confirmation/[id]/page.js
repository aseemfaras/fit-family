"use client";
import { useEffect, useState, useRef } from 'react';
import OrderInvoice from '@/components/OrderInvoice';
import UPIPaySelector from '@/components/UPIPaySelector';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { openWhatsAppConfirmation } from '@/lib/orderService';

export default function OrderConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const whatsappTriggered = useRef(false);

    useEffect(() => {
        const fetchOrder = () => {
            const id = params?.id;
            console.log('OrderConfirmation: ID from params:', id);

            if (!id) return;

            const savedOrder = localStorage.getItem(`order_${id}`);
            console.log('OrderConfirmation: Loaded order:', savedOrder ? 'Found' : 'Not Found');

            if (savedOrder) {
                const parsedOrder = JSON.parse(savedOrder);
                setOrder(parsedOrder);

                // Trigger WhatsApp for COD if not already done
                if (parsedOrder.paymentMethod === 'COD' && !whatsappTriggered.current) {
                    whatsappTriggered.current = true;
                    // Small delay to ensure render
                    setTimeout(() => {
                        openWhatsAppConfirmation(parsedOrder);
                    }, 1000);
                }
            }
            setLoading(false);
        };
        fetchOrder();
    }, [params]);

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
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Invoice Section */}
                <div className={`${isUPI ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <OrderInvoice order={order} />
                </div>

                {/* Payment Section (Only for UPI) */}
                {isUPI && (
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Complete Payment</h3>
                            <div className="mb-4 text-center">
                                <p className="text-sm text-gray-500">Scan or Click to Pay</p>
                                <p className="text-2xl font-bold text-[#2F855A]">₹{order.total.toFixed(2)}</p>
                            </div>

                            {/* Re-use Selector but just for payment action, no re-processing needed */}
                            <UPIPaySelector
                                orderId={order.id}
                                amount={order.total}
                                onProcessOrder={async () => true} // Already processed/saved
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
