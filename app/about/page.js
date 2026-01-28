import Link from 'next/link';

export const metadata = {
    title: 'About Us',
    description: 'Learn more about AyurLife Essentials and our mission.',
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">About AyurLife</h1>

                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 space-y-6 text-gray-700 leading-relaxed">
                    <p className="text-lg">
                        Welcome to <strong>AyurLife Essentials</strong>. We are dedicated to bringing the timeless wisdom of Ayurveda into modern lives. Our journey began with a simple mission: to make authentic, high-quality Ayurvedic products and convenient therapeutic services accessible to everyone.
                    </p>

                    <h2 className="text-2xl font-bold text-[#2F855A] pt-4">Our Philosophy</h2>
                    <p>
                        We believe that true wellness comes from balance. "Ayurveda" translates to "The Science of Life," and we strive to embody this by offering products that are not just remedies, but tools for a better lifestyle. All our products are sourced from trusted manufacturers who adhere to strict quality standards.
                    </p>

                    <h2 className="text-2xl font-bold text-[#2F855A] pt-4">Our Services</h2>
                    <p>
                        In addition to our product range, we offer specialized rental services for therapeutic equipment like steam kits and massagers. We understand the need for relaxation in today’s fast-paced world, and our goal is to bring the spa experience to your home.
                    </p>

                    <div className="pt-8 text-center">
                        <Link
                            href="/contact"
                            className="inline-block px-8 py-3 bg-[#2F855A] text-white rounded-full font-semibold hover:bg-[#276f4b] transition-colors"
                        >
                            Get in Touch
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
