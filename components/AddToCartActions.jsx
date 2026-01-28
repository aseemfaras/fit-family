"use client";
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddToCartActions({ product }) {
    const { addToCart } = useCart();
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = () => {
        setIsAdding(true);
        addToCart({
            id: product.id || product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            type: 'product'
        });
        setTimeout(() => setIsAdding(false), 500);
    };

    const handleBuyNow = () => {
        addToCart({
            id: product.id || product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            type: 'product'
        });
        router.push('/checkout');
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-[#2F855A] hover:bg-[#276f4b] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed min-w-[200px]"
            >
                <ShoppingCart className="w-5 h-5" />
                {isAdding ? 'Added!' : 'Add to Cart'}
            </button>

            <button
                onClick={handleBuyNow}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-[#2F855A] text-[#2F855A] hover:bg-green-50 rounded-xl font-bold transition-all active:scale-95 min-w-[200px]"
            >
                Buy Now <ArrowRight className="w-5 h-5" />
            </button>
        </div>
    );
}
