'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CONFIG } from '@/lib/config';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { cart } = useCart();
    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Services', href: '/services' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ];

    return (
        <header className={cn(
            "fixed top-0 w-full z-50 transition-all duration-300",
            scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-2" : "bg-transparent py-4 text-white"
        )}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className={cn("text-2xl md:text-3xl font-extrabold tracking-tight transition-colors", scrolled ? "text-[#2F855A]" : "text-[#2F855A] bg-white px-3 py-1 rounded-lg shadow-sm")}>
                        Ayur<span className="text-gray-800">Life</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-sm p-1 rounded-full border border-white/20 shadow-sm">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                    pathname === item.href
                                        ? "bg-[#2F855A] text-white shadow-md"
                                        : "text-gray-600 hover:text-[#2F855A] hover:bg-white"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/cart" className={cn("relative p-2 rounded-full transition-colors", scrolled ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/20")}>
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <a
                            href={`https://wa.me/${CONFIG.BUSINESS_PHONE}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn("px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
                                scrolled ? "bg-[#2F855A] text-white hover:bg-[#276f4b]" : "bg-white text-[#2F855A] hover:bg-gray-50"
                            )}
                        >
                            Chat Now
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={cn("md:hidden p-2 rounded-lg backdrop-blur-sm", scrolled ? "text-gray-800" : "bg-white/20 text-[#2F855A]")}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 absolute w-full left-0 top-full shadow-lg h-screen animate-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col p-6 gap-6 items-center pt-24">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-2xl font-bold tracking-tight",
                                    pathname === item.href ? "text-[#2F855A]" : "text-gray-400"
                                )}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <a
                            href={`https://wa.me/${CONFIG.BUSINESS_PHONE}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#2F855A] text-white py-4 px-12 rounded-full text-lg font-bold shadow-xl"
                        >
                            WhatsApp Us
                        </a>

                        <Link href="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-xl font-bold text-gray-800 mt-4">
                            <ShoppingCart className="w-6 h-6" />
                            Cart ({cartCount})
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
