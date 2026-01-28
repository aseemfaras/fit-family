import Link from 'next/link';
import Image from 'next/image';
import { products } from '@/data/products';
import { services } from '@/data/services';
import ProductCard from '@/components/ProductCard';
import ServiceCard from '@/components/ServiceCard';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function Home() {
  const featuredProducts = products.slice(0, 3);
  const featuredServices = services.slice(0, 2);

  return (
    <div className="flex flex-col gap-0 pb-16">

      {/* Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center bg-gradient-to-br from-[#2F855A] to-[#1e5c3e] text-white overflow-hidden rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leaves.png')] mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F6E7D7] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#000] rounded-full blur-[120px] opacity-30 translate-y-1/2 -translate-x-1/2"></div>

        <div className="container relative z-10 px-4 md:px-6 text-center max-w-5xl mx-auto flex flex-col items-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-wider mb-6 animate-fade-in-up">
            WELCOME TO AYURLIFE ESSENTIALS
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1] drop-shadow-sm">
            Rediscover Balance <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6E7D7] to-[#fff]">Through Ayurveda</span>
          </h1>
          <p className="text-lg md:text-2xl mb-12 text-green-50 max-w-2xl mx-auto leading-relaxed font-light">
            Authentic herbal products and rejuvenating therapies designed to restore your natural harmony and vitality in the modern world.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 w-full justify-center">
            <Link
              href="/products"
              className="px-10 py-5 bg-[#F6E7D7] text-[#2F855A] rounded-full font-bold text-lg hover:bg-white hover:scale-105 transition-all shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]"
            >
              Shop Products
            </Link>
            <WhatsAppButton message="Hi! I'd like to know more about your Ayurvedic services." variant="outline" className="px-10 py-5 border-2 border-white/30 text-white hover:bg-white/10 text-lg rounded-full backdrop-blur-sm">
              Book Consultation
            </WhatsAppButton>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 md:px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">Our Bestsellers</h2>
            <p className="text-lg text-gray-500">Hand-picked formulations trusted by thousands for their purity and effectiveness.</p>
          </div>
          <Link href="/products" className="group hidden md:flex items-center gap-2 text-[#2F855A] font-bold text-lg hover:text-[#276f4b] transition-colors">
            View All Products
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-12 text-center md:hidden">
          <Link href="/products" className="inline-block border-b-2 border-[#2F855A] text-[#2F855A] font-bold pb-1">View All Products &rarr;</Link>
        </div>
      </section>

      {/* Featured Services */}
      <section className="bg-[#Fdf8f3] py-24 rounded-[3rem] my-8 mx-2 md:mx-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="max-w-xl">
              <span className="text-[#2F855A] font-bold uppercase tracking-widest text-sm mb-2 block">Home Therapies</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">Relax & Rejuvenate</h2>
              <p className="text-lg text-gray-500">bringing the spa experience to your doorstep with our rental equipment and therapy kits.</p>
            </div>
            <Link href="/services" className="group hidden md:flex items-center gap-2 text-[#2F855A] font-bold text-lg hover:text-[#276f4b] transition-colors">
              View All Services
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:gap-10">
            {featuredServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <div className="mt-12 text-center md:hidden">
            <Link href="/services" className="inline-block border-b-2 border-[#2F855A] text-[#2F855A] font-bold pb-1">View All Services &rarr;</Link>
          </div>
        </div>
      </section>

      {/* Trust/Benefits Strip */}
      <section className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-gray-100 bg-white shadow-xl rounded-2xl p-10 border border-gray-50/50">
          <div className="p-4 group cursor-default">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🌿</div>
            <h3 className="font-bold text-gray-800 text-lg">100% Natural</h3>
            <p className="text-sm text-gray-400 mt-2">Pure ayurvedic ingredients</p>
          </div>
          <div className="p-4 group cursor-default">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">👩‍⚕️</div>
            <h3 className="font-bold text-gray-800 text-lg">Expert Care</h3>
            <p className="text-sm text-gray-400 mt-2">Experienced therapists</p>
          </div>
          <div className="p-4 group cursor-default">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🚚</div>
            <h3 className="font-bold text-gray-800 text-lg">Fast Delivery</h3>
            <p className="text-sm text-gray-400 mt-2">Across the city</p>
          </div>
          <div className="p-4 group cursor-default">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🛡️</div>
            <h3 className="font-bold text-gray-800 text-lg">Safe & Hygienic</h3>
            <p className="text-sm text-gray-400 mt-2">Sanitized equipment</p>
          </div>
        </div>
      </section>

    </div>
  );
}
