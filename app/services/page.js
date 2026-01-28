import { services } from '@/data/services';
import ServiceCard from '@/components/ServiceCard';

export const metadata = {
    title: 'Our Services',
    description: 'Relaxing and therapeutic Ayurvedic services inclusive of massages and steam therapy.',
};

export default function ServicesPage() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Therapies & Services</h1>
                <p className="text-lg text-gray-600">
                    Book a session to rejuvenate your senses. We bring the equipment to your comfort zone.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                ))}
            </div>
        </div>
    );
}
