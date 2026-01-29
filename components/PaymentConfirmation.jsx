"use client";
import { useState } from 'react';
import { CheckCircle, Loader2, Smartphone, CreditCard, Send } from 'lucide-react';
import { verifyUPIPayment } from '@/lib/paymentVerification';
import toast from 'react-hot-toast';

export default function PaymentConfirmation({ orderId, amount, onPaymentVerified }) {
    const [txnRef, setTxnRef] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleSubmitTransactionId = async (e) => {
        e.preventDefault();
        
        if (isVerifying) return;
        
        // Validate transaction ID
        const trimmedTxnRef = txnRef.trim();
        if (!trimmedTxnRef) {
            toast.error('Please enter your UPI transaction ID');
            return;
        }

        if (trimmedTxnRef.length < 5) {
            toast.error('Transaction ID seems too short. Please check and try again.');
            return;
        }
        
        setIsVerifying(true);
        toast.loading('Submitting transaction ID...', { id: 'verify-payment' });
        
        try {
            const result = await verifyUPIPayment(orderId, trimmedTxnRef);
            
            if (result.success) {
                toast.dismiss('verify-payment');
                toast.success('Transaction ID submitted! Showing invoice...', { duration: 3000 });
                
                // Small delay to show success message
                setTimeout(() => {
                    onPaymentVerified(result.order);
                }, 500);
            } else {
                toast.dismiss('verify-payment');
                toast.error(result.error || 'Failed to submit transaction ID');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            toast.dismiss('verify-payment');
            toast.error('Error submitting transaction ID. Please try again.');
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
                    After completing payment in your UPI app, paste your transaction ID below
                </p>
            </div>

            <form onSubmit={handleSubmitTransactionId} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        UPI Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={txnRef}
                        onChange={(e) => setTxnRef(e.target.value)}
                        placeholder="Paste your transaction ID from UPI app"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent outline-none transition-all"
                        disabled={isVerifying}
                        required
                        minLength={5}
                    />
                    <p className="text-xs text-gray-500">
                        You can find this in your UPI app's transaction history or payment receipt. 
                        It usually starts with letters/numbers like "UPI123456789" or similar.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isVerifying || !txnRef.trim()}
                    className="w-full bg-[#2F855A] hover:bg-[#276f4b] text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Submit Transaction ID
                        </>
                    )}
                </button>
            </form>

            <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                    <strong>Note:</strong> Make sure you have completed the payment in your UPI app and have the transaction ID ready before submitting.
                </p>
            </div>
        </div>
    );
}

