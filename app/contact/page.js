import WhatsAppButton from '@/components/WhatsAppButton';
import { CONFIG } from '@/lib/config';

export const metadata = {
    title: 'Contact Us',
    description: 'Get in touch with AyurLife Essentials via WhatsApp or Phone.',
};

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-6">Contact Us</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Have a question about a product? Want to book a service? Or just want a consultation? We are here to help.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-2xl">📞</div>
                            <div>
                                <h3 className="font-bold text-gray-800">Phone</h3>
                                <p className="text-gray-600">+91 {CONFIG.phone.slice(2)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-2xl">💬</div>
                            <div>
                                <h3 className="font-bold text-gray-800">WhatsApp</h3>
                                <p className="text-gray-600">Click the button below to chat</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-2xl">🕒</div>
                            <div>
                                <h3 className="font-bold text-gray-800">Hours</h3>
                                <p className="text-gray-600">Mon - Sat: 9:00 AM - 8:00 PM</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10">
                        <WhatsAppButton
                            message="Hi, I have a query regarding your products/services."
                            className="w-full md:w-auto text-lg px-8 py-4"
                        >
                            Chat with Us Now
                        </WhatsAppButton>
                    </div>
                </div>

                <div className="bg-[#F6E7D7] rounded-[2rem] p-8 md:p-12 text-center">
                    <h3 className="text-2xl font-bold text-[#2F855A] mb-4">Direct Enquiry?</h3>
                    <p className="text-gray-700 mb-8">
                        We prefer WhatsApp for the fastest response. Click below to start a conversation directly with our team.
                    </p>
                    <div className="relative w-full aspect-square bg-white rounded-xl shadow-inner flex items-center justify-center">
                        {/* Decorative placeholder for QR code or similar visual */}
                        <div className="text-gray-400 text-sm">
                            [Scan QR Code or Click Button]
                            <br />
                            <span className="text-4xl block mt-2">📱</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
