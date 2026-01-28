"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";

export default function CartPage() {
    const { cart, updateQty, removeFromCart, getCartTotal, clearCart } = useCart();
    const total = getCartTotal();

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-green-50 p-6 rounded-full mb-6">
                    <ShoppingBag className="w-12 h-12 text-[#2F855A]" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Your cart is empty
                </h1>
                <p className="text-gray-500 mb-8 max-w-sm">
                    It looks like you haven't added anything to your cart yet.
                </p>
                <Link
                    href="/products"
                    className="bg-[#2F855A] hover:bg-[#276f4b] text-white px-8 py-3 rounded-full font-bold transition-all shadow-md hover:shadow-lg"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-sm font-medium text-gray-500">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-2 text-center">Price</div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center"
                                >
                                    {/* Product Info */}
                                    <div className="col-span-6 flex items-center gap-4 w-full">
                                        <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ShoppingBag className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-gray-800 line-clamp-1">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 text-sm flex items-center gap-1 mt-1 hover:text-red-600 transition-colors md:hidden"
                                            >
                                                <Trash2 className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-2 text-gray-600 font-medium hidden md:block text-center">
                                        {formatPrice(item.price)}
                                    </div>

                                    {/* Quantity */}
                                    <div className="col-span-2 flex items-center justify-center w-full md:w-auto mt-2 md:mt-0">
                                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQty(item.id, (q) => q - 1)}
                                                className="p-1 rounded-md hover:bg-white text-gray-600 transition-shadow shadow-sm disabled:opacity-50"
                                                disabled={item.qty <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-bold text-gray-800">
                                                {item.qty}
                                            </span>
                                            <button
                                                onClick={() => updateQty(item.id, (q) => q + 1)}
                                                className="p-1 rounded-md hover:bg-white text-gray-600 transition-shadow shadow-sm"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Total & Remove Desktop */}
                                    <div className="col-span-2 text-right w-full md:w-auto flex items-center justify-between md:block mt-2 md:mt-0">
                                        <span className="md:hidden font-medium text-gray-500">Total:</span>
                                        <div className="font-bold text-[#2F855A]">
                                            {formatPrice(item.price * item.qty)}
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors hidden md:inline-block mt-1"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4 ml-auto" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={clearCart}
                        className="text-sm text-gray-500 underline hover:text-red-500 transition-colors px-2"
                    >
                        Clear Shopping Cart
                    </button>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                <span className="font-bold text-gray-900 text-lg">Total</span>
                                <span className="font-bold text-[#2F855A] text-xl">
                                    {formatPrice(total)}
                                </span>
                            </div>
                        </div>

                        <Link
                            href="/checkout"
                            className="w-full flex items-center justify-center gap-2 bg-[#2F855A] hover:bg-[#276f4b] text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            Proceed to Checkout
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        <div className="mt-6 text-center">
                            <Link href="/products" className="text-gray-500 hover:text-gray-900 text-sm font-medium">
                                or Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
