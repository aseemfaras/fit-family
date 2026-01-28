import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';

export const metadata = {
    title: 'All Products',
    description: 'Shop our range of authentic Ayurvedic medicines and supplements.',
};

export default function ProductsPage() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12 animate-in fade-in duration-500">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Products</h1>
                <p className="text-lg text-gray-600">
                    Hand-picked formulations for your well-being. From immunity boosters to daily supplements.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ItemList",
                        "itemListElement": products.map((product, index) => ({
                            "@type": "ListItem",
                            "position": index + 1,
                            "item": {
                                "@type": "Product",
                                "name": product.name,
                                "description": product.shortDescription,
                                "offers": {
                                    "@type": "Offer",
                                    "price": product.price,
                                    "priceCurrency": "INR",
                                    "availability": "https://schema.org/InStock"
                                }
                            }
                        }))
                    })
                }}
            />
        </div>
    );
}
