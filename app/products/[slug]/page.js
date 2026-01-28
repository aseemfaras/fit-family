import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products } from '@/data/products';
import WhatsAppButton from '@/components/WhatsAppButton';
import { formatPrice } from '@/lib/utils';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = products.find((p) => p.slug === slug);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    return {
        title: product.name,
        description: product.shortDescription,
    };
}

export async function generateStaticParams() {
    return products.map((product) => ({
        slug: product.slug,
    }));
}

export default async function ProductPage({ params }) {
    const { slug } = await params;
    const product = products.find((p) => p.slug === slug);

    if (!product) {
        notFound();
    }

    const message = `Hi, I want to order: ${product.name} (SKU: ${product.sku}). Quantity: 1. Delivery address: [address]. Preferred date/time: [date/time]. Please confirm total price.`;

    return (
        <div className="container mx-auto px-4 md:px-6 py-12 animate-in fade-in zoom-in-95 duration-500">
            <Link href="/products" className="inline-flex items-center text-gray-500 hover:text-[#2F855A] mb-8 transition-colors font-medium">
                ← Back to Products
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                {/* Image Section */}
                <div className="relative aspect-square md:aspect-[4/3] w-full rounded-3xl overflow-hidden bg-white shadow-lg border border-gray-100">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center">
                    <div className="mb-6">
                        <span className="inline-block px-3 py-1 bg-green-50 text-[#2F855A] text-sm font-bold rounded-full mb-4 tracking-wide uppercase">
                            {product.sku}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-[#2F855A]">
                                {formatPrice(product.price)}
                            </span>
                            <span className="text-gray-400 text-sm">(Inclusive of all taxes)</span>
                        </div>
                    </div>

                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        {product.longDescription}
                    </p>

                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-[#2F855A]">✨</span> Key Benefits
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {product.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <svg className="w-5 h-5 text-[#2F855A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-t border-gray-100 pt-8 mt-auto">
                        <WhatsAppButton
                            message={message}
                            className="w-full md:w-auto text-lg px-10 py-4 shadow-xl hover:shadow-2xl shadow-green-900/10"
                        >
                            Order Now via WhatsApp
                        </WhatsAppButton>
                        <p className="mt-4 text-xs text-center md:text-left text-gray-400">
                            * Secure payment and delivery details will be shared on WhatsApp.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
