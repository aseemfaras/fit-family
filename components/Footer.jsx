import Link from 'next/link';
import { CONFIG } from '@/lib/config';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

                {/* Brand */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">AyurLife Essentials</h2>
                    <p className="text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                        Bringing the ancient wisdom of Ayurveda to your doorstep. Pure, natural, and effective solutions for a healthy lifestyle.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
                    <ul className="space-y-2">
                        <li><Link href="/products" className="hover:text-[#2F855A] transition-colors">Products</Link></li>
                        <li><Link href="/services" className="hover:text-[#2F855A] transition-colors">Services</Link></li>
                        <li><Link href="/about" className="hover:text-[#2F855A] transition-colors">About Us</Link></li>
                        <li><Link href="/contact" className="hover:text-[#2F855A] transition-colors">Contact</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
                    <p className="mb-2">WhatsApp: +91 {CONFIG.phone.slice(2)}</p>
                    <p className="mb-4">Email: hello@ayurlife.com</p>
                    <p className="text-xs text-gray-500">
                        Opening Hours: Mon - Sat, 9:00 AM - 8:00 PM
                    </p>
                </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} AyurLife Essentials. All rights reserved.
            </div>
        </footer>
    );
}
