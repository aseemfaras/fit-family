"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault(); // Prevent Link navigation if clicked on button inside Link (though button is z-30)
        addToCart({
            id: product.id || product.slug, // Use slug if id missing
            name: product.name,
            price: product.price,
            image: product.image,
            type: 'product'
        });
    };

    return (
        <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1 relative">
            <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View details for ${product.name}`} />

            <div className="relative h-64 w-full bg-gray-50 overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-[#2F855A] font-bold text-sm shadow-sm z-20">
                    {formatPrice(product.price)}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow relative z-20 pointer-events-none">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#2F855A] transition-colors line-clamp-1">
                    {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
                    {product.shortDescription}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-50 flex gap-3 pointer-events-auto">
                    <button
                        onClick={handleAddToCart}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#2F855A] hover:bg-[#276f4b] text-white rounded-xl shadow-md transition-all active:scale-95 font-medium px-4 relative z-30"
                    >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
