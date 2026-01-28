import Image from 'next/image';
import Link from 'next/link';
import WhatsAppButton from './WhatsAppButton';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }) {
    const message = `Hi, I want to order: ${product.name} (SKU: ${product.sku}). Quantity: 1. Delivery address: [address]. Preferred date/time: [date/time]. Please confirm total price.`;

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
                    <WhatsAppButton message={message} className="w-full justify-center py-3 bg-[#2F855A] hover:bg-[#276f4b] text-white rounded-xl shadow-md transition-all active:scale-95 font-medium px-4 relative z-30">
                        Order
                    </WhatsAppButton>
                </div>
            </div>
        </div>
    );
}
