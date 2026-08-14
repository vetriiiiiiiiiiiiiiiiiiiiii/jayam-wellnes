export const metadata = {
  title: 'Our Story | Miracle Tree',
  description: 'The philosophy and journey behind Miracle Tree Life Science.',
};

export default function OurStoryPage() {
  return (
    <main className="min-h-screen bg-brand-pearl pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 text-center mt-8">
          <span className="text-brand-green-500 uppercase tracking-[0.3em] text-xs font-medium block mb-4">The Origin</span>
          <h1 className="text-5xl md:text-7xl font-serif text-brand-dark mb-8 tracking-tighter">
            Our Story
          </h1>
        </header>

        <article className="prose prose-lg prose-green mx-auto text-brand-dark/80 font-light leading-relaxed">
          <p className="text-2xl font-serif text-brand-dark mb-10 text-center leading-snug">
            Miracletree Life Science was founded on a simple but powerful belief: that nature provides the most potent answers to human vitality.
          </p>

          <div className="my-16 h-[60vh] rounded-3xl bg-brand-green-900 overflow-hidden relative">
            <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80')] bg-cover bg-center" />
          </div>

          <h2 className="text-3xl font-serif text-brand-dark mt-16 mb-6">The Power of Moringa</h2>
          <p>
            Often referred to as the "Miracle Tree", Moringa Oleifera is one of the most nutrient-dense plants on the planet. Packed with antioxidants, vitamins, and essential amino acids, it has been used for centuries in traditional medicine. 
          </p>
          <p>
            We harness this ancient wisdom and combine it with modern scientific rigorous testing to bring you formulations that are not only pure but extraordinarily effective.
          </p>

          <h2 className="text-3xl font-serif text-brand-dark mt-16 mb-6">Ethical from Seed to Skin</h2>
          <p>
            Sustainability isn't just a buzzword for us; it's our foundational operating principle. We partner directly with farmers to ensure fair trade practices, and our harvesting methods ensure the long-term health of the soil and the local ecosystem.
          </p>
          
          <div className="mt-20 p-12 bg-brand-white rounded-3xl text-center border border-brand-green-100">
            <h3 className="text-2xl font-serif text-brand-dark mb-4">Join Our Journey</h3>
            <p className="mb-8">Experience the purest expression of botanical science.</p>
            <a href="/shop" className="inline-block px-8 py-4 bg-brand-dark text-white rounded-full font-medium tracking-wide hover:scale-105 transition-transform">
              Explore Products
            </a>
          </div>
        </article>
      </div>
    </main>
  );
}
