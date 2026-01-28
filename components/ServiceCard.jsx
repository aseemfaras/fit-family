import Image from 'next/image';
import WhatsAppButton from './WhatsAppButton';
import { formatPrice } from '@/lib/utils';

export default function ServiceCard({ service }) {
    const message = `Hi, I want to book: ${service.name} for [X] hour(s) on [date/time]. Please confirm availability.`;

    return (
        <div className="group flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
            <div className="relative h-56 md:h-auto md:w-1/2 bg-gray-100 overflow-hidden">
                <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
            </div>

            <div className="p-8 md:w-1/2 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-[#2F855A] transition-colors">{service.name}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">{service.shortDescription}</p>

                <div className="mt-auto">
                    <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-[#2F855A] font-bold text-3xl">
                            {formatPrice(service.pricePerHour)}
                        </span>
                        <span className="text-gray-400 font-medium">/ hour</span>
                    </div>

                    <WhatsAppButton message={message} variant="secondary" className="w-full justify-center bg-[#F6E7D7] hover:bg-[#ebd5c0] text-[#2F855A] font-bold py-3 rounded-xl border-2 border-transparent hover:border-[#2F855A]/20">
                        Book Appointment
                    </WhatsAppButton>
                </div>
            </div>
        </div>
    );
}
