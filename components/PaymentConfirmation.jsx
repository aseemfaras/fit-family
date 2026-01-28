"use client";
import { useState } from 'react';
import { CheckCircle, Loader2, Smartphone, CreditCard } from 'lucide-react';
import { verifyUPIPayment } from '@/lib/paymentVerification';
import toast from 'react-hot-toast';

export default function PaymentConfirmation({ orderId, amount, onPaymentVerified }) {
    const [txnRef, setTxnRef] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [showTxnInput, setShowTxnInput] = useState(false);

    const handleConfirmPayment = async () => {
        if (isVerifying) return;
        
        setIsVerifying(true);
        toast.loading('Verifying payment...', { id: 'verify-payment' });
        
        try {
            const result = await verifyUPIPayment(orderId, txnRef.trim());
            
            if (result.success) {
                toast.dismiss('verify-payment');
                toast.success('Payment confirmed! Showing invoice...', { duration: 3000 });
                
                // Small delay to show success message
                setTimeout(() => {
                    onPaymentVerified(result.order);
                }, 500);
            } else {
                toast.dismiss('verify-payment');
                toast.error(result.error || 'Failed to verify payment');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            toast.dismiss('verify-payment');
            toast.error('Error verifying payment. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 space-y-6">
            <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Complete Your Payment
                </h3>
                <p className="text-gray-600 mb-1 text-lg">
                    Amount: <span className="font-bold text-[#2F855A] text-xl">₹{amount.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-500 mt-3">
                    After completing payment in your UPI app, confirm below
                </p>
            </div>

            {showTxnInput && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        UPI Transaction Reference (Optional)
                    </label>
                    <input
                        type="text"
                        value={txnRef}
                        onChange={(e) => setTxnRef(e.target.value)}
                        placeholder="Enter transaction ID from UPI app"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all"
                        disabled={isVerifying}
                    />
                    <p className="text-xs text-gray-500">
                        You can find this in your UPI app's transaction history or payment receipt
                    </p>
                </div>
            )}

            <div className="space-y-3">
                <button
                    onClick={handleConfirmPayment}
                    disabled={isVerifying}
                    className="w-full bg-[#2F855A] hover:bg-[#276f4b] text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Verifying Payment...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            I've Paid - Confirm Payment
                        </>
                    )}
                </button>

                {!showTxnInput && (
                    <button
                        onClick={() => setShowTxnInput(true)}
                        disabled={isVerifying}
                        className="w-full text-sm text-gray-600 hover:text-gray-800 underline transition-colors disabled:opacity-50"
                    >
                        I have a transaction reference
                    </button>
                )}
            </div>

            <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                    <strong>Note:</strong> Make sure you have completed the payment in your UPI app before confirming.
                </p>
            </div>
        </div>
    );
}

