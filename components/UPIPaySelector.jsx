"use client";

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, Smartphone, ChevronDown } from 'lucide-react';
import { buildUPI, buildAppDeepLink } from '@/lib/upi';
import { CONFIG } from '@/lib/config';
import toast from 'react-hot-toast';

export default function UPIPaySelector({ orderId, amount, onProcessOrder }) {
    const [selectedApp, setSelectedApp] = useState('gpay');
    const [showFallback, setShowFallback] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [platform, setPlatform] = useState('unknown');

    useEffect(() => {
        // Detect Platform
        const ua = navigator.userAgent.toLowerCase();
        if (/android/.test(ua)) setPlatform('android');
        else if (/iphone|ipad|ipod/.test(ua)) setPlatform('ios');
        else setPlatform('desktop');
    }, []);

    const apps = [
        {
            id: 'gpay',
            name: 'Google Pay',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg'
        },
        {
            id: 'phonepe',
            name: 'PhonePe',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1280px-PhonePe_Logo.svg.png'
        },
        {
            id: 'paytm',
            name: 'Paytm',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg'
        },
        {
            id: 'bhim',
            name: 'BHIM',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/BHIM_Logo.svg/512px-BHIM_Logo.svg.png'
        }
    ];

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("UPI ID Copied!");
    };

    const handlePay = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        toast.loading("Processing order...", { id: 'upi-process' });

        try {
            // 1. Save Order First
            const success = await onProcessOrder();

            if (!success) {
                toast.dismiss('upi-process');
                setIsProcessing(false);
                return;
            }

            toast.dismiss('upi-process');

            // 2. Build URI
            const upiURI = buildUPI({ amount, orderId });

            // 3. Desktop Handling
            if (platform === 'desktop') {
                setShowFallback(true);
                toast("Scan QR with any UPI app", { icon: '📱' });
                setIsProcessing(false);
                return;
            }

            // 4. Mobile Handling
            let finalUrl = upiURI;

            // Specific App Deep Link
            finalUrl = buildAppDeepLink(upiURI, selectedApp, platform);
            toast.success(`Opening ${apps.find(a => a.id === selectedApp)?.name}...`);

            // Open App
            window.location.href = finalUrl;

            // 5. Show Fallback after delay
            setTimeout(() => {
                setShowFallback(true);
                setIsProcessing(false);
            }, 2000);

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
            setShowFallback(true);
            setIsProcessing(false);
        }
    };

    const uri = buildUPI({ amount, orderId });

    return (
        <div className="w-full space-y-4">

            {/* App Selector */}
            {!showFallback ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment App</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {apps.map((app) => (
                                <button
                                    key={app.id}
                                    onClick={() => setSelectedApp(app.id)}
                                    className={`flex flex-col items-center justify-center gap-2 p-3 border rounded-xl transition-all h-24 ${selectedApp === app.id
                                            ? 'border-[#2F855A] bg-green-50/50 ring-1 ring-[#2F855A]'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <img
                                        src={app.logo}
                                        alt={app.name}
                                        className="w-10 h-10 object-contain"
                                    />
                                    <span className="text-xs font-semibold text-gray-700">{app.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handlePay}
                        disabled={isProcessing}
                        className="w-full bg-[#2F855A] hover:bg-[#276f4b] text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                        {isProcessing ? 'Processing...' : 'Open App to Pay'}
                        {!isProcessing && <Smartphone className="w-5 h-5" />}
                    </button>

                    <p className="text-xs text-center text-gray-500">
                        Order will be placed before payment app opens.
                    </p>
                </div>
            ) : (
                /* Fallback / Post-Click UI */
                <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">

                    <div className="bg-white p-3 rounded-xl shadow-sm mb-4">
                        <QRCodeSVG value={uri} size={180} level="M" />
                    </div>

                    <div className="space-y-2 w-full max-w-xs">
                        <p className="font-bold text-gray-800">Scan to Pay: ₹{amount}</p>

                        <div className="flex items-center gap-2 bg-white p-2 border rounded-lg">
                            <code className="text-xs text-gray-500 flex-1 truncate">{CONFIG.BUSINESS_UPI_ID}</code>
                            <button
                                onClick={() => copyToClipboard(CONFIG.BUSINESS_UPI_ID)}
                                className="text-[#2F855A] hover:bg-green-50 p-1 rounded"
                                title="Copy UPI ID"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600 space-y-1">
                        <p>If the app didn't open automatically, please scan above.</p>
                        <p className="text-xs text-gray-400">Order ID: <span className="font-mono">{orderId}</span></p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 w-full">
                        <p className="text-sm font-bold text-[#2F855A] mb-3">After Paying:</p>
                        <button
                            onClick={() => {
                                // Re-trigger the whatsapp confirmation flow manually if they need it
                                // In the parent component we likely already tried to open it, or providing a way here is good
                                const message = `Hi! I've paid ₹${amount} for Order ID: ${orderId}. Please confirm.`;
                                window.open(`https://wa.me/${CONFIG.BUSINESS_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="inline-flex items-center gap-2 text-[#2F855A] border border-[#2F855A] px-4 py-2 rounded-full hover:bg-green-50 transition-colors text-sm font-medium"
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-4 h-4" />
                            Send Payment Screenshot
                        </button>
                    </div>

                    <button
                        onClick={() => setShowFallback(false)}
                        className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                        Try another app
                    </button>
                </div>
            )}
        </div>
    );
}
