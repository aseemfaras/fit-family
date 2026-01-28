'use client';

import { CONFIG } from '@/lib/config';
import { cn } from '@/lib/utils';

export default function WhatsAppButton({
    message,
    children,
    className,
    variant = 'primary' // primary | secondary | outline
}) {
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Optional: Toast could go here

        const encodedMessage = encodeURIComponent(message);
        const url = `${CONFIG.whatsappUrl}${CONFIG.phone}?text=${encodedMessage}`;

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold transition-all duration-300 active:scale-95";

    const variants = {
        primary: "bg-[#2F855A] text-white hover:bg-[#276f4b] shadow-lg hover:shadow-xl",
        secondary: "bg-[#F6E7D7] text-[#2F855A] hover:bg-[#ebd5c0]",
        outline: "border-2 border-[#2F855A] text-[#2F855A] hover:bg-[#2F855A] hover:text-white"
    };

    return (
        <button
            onClick={handleClick}
            className={cn(baseStyles, variants[variant], className)}
            aria-label="Contact on WhatsApp"
        >
            {children || 'Order via WhatsApp'}
        </button>
    );
}
