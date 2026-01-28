"use client";
import { formatPrice } from '@/lib/utils';
import { CONFIG } from '@/lib/config';
import { MapPin, Phone, Calendar, Mail, CheckCircle, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function OrderInvoice({ order }) {
    if (!order) return null;

    const isUPI = order.paymentMethod === 'UPI';

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="bg-[#2F855A] p-8 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative z-10">
                    <div className="bg-white/20 p-4 rounded-full inline-block mb-4 backdrop-blur-sm">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                    <p className="text-green-100 text-lg">Thank you for your purchase.</p>
                </div>
            </div>

            <div className="p-8">
                {/* Order Details */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                        <p className="text-sm text-gray-500 mb-1">Order ID</p>
                        <p className="text-xl font-mono font-bold text-gray-800">{order.id}</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-sm text-gray-500 mb-1">Date</p>
                        <p className="font-medium text-gray-800">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-8">
                    <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Items Ordered</h3>
                    <div className="space-y-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                        {item.qty}x
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-gray-400 capitalize">{item.type}</p>
                                    </div>
                                </div>
                                <p className="font-medium text-gray-700">{formatPrice(item.price * item.qty)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-lg text-gray-900">Total Amount</span>
                        <span className="font-bold text-2xl text-[#2F855A]">{formatPrice(order.total)}</span>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#2F855A]" /> Delivery Address
                        </h4>
                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">
                            {order.customer.address}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#2F855A]" /> Contact
                            </h4>
                            <p className="text-gray-600 pl-6">{order.customer.name}</p>
                            <p className="text-gray-600 pl-6">{order.customer.phone}</p>
                        </div>
                        {order.customer.preferredDateTime && (
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#2F855A]" /> Preferred Time
                                </h4>
                                <p className="text-gray-600 pl-6">{order.customer.preferredDateTime}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    {isUPI && (
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center mb-4">
                            <p className="text-[#2F855A] font-bold text-sm mb-2 flex items-center justify-center gap-2">
                                <Smartphone className="w-4 h-4" /> Payment Status: UPI
                            </p>
                            <p className="text-xs text-gray-600">
                                If you haven't completed the payment yet, please check your UPI app.
                            </p>
                        </div>
                    )}

                    <Link
                        href="/"
                        className="block w-full bg-[#2F855A] text-white text-center py-4 rounded-xl font-bold hover:bg-[#276f4b] transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        Continue Shopping
                    </Link>

                    <button
                        onClick={() => window.print()}
                        className="block w-full text-center py-2 text-gray-400 hover:text-gray-600 text-sm font-medium"
                    >
                        Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}
