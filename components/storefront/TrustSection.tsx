export default function TrustSection() {
  return (
    <section className="py-24 bg-brand-green-900 text-brand-white relative overflow-hidden">
      {/* Optimized background without blur filter */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" 
           style={{ background: 'radial-gradient(circle at 100% 0%, #3e8e41 0%, transparent 40%), radial-gradient(circle at 0% 100%, #6b46c1 0%, transparent 50%)' }}>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Recommended by <br/><span className="text-brand-green-300">Dermatologists.</span></h2>
            <p className="text-brand-green-100 text-lg leading-relaxed mb-8 max-w-md font-light">
              "Miracle Tree brings an uncompromising standard of purity. The botanical formulations are highly effective while respecting the skin's natural barrier."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-green-300 flex items-center justify-center text-brand-green-900 font-serif font-bold text-xl">
                Dr
              </div>
              <div>
                <p className="font-medium text-lg">Dr. Sarah Jenkins</p>
                <p className="text-sm text-brand-green-300">Board Certified Dermatologist</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-brand-white/10 border border-brand-white/20 p-8 rounded-2xl text-center flex flex-col items-center justify-center">
              <div className="text-brand-green-300 text-4xl mb-4">✨</div>
              <h3 className="font-medium text-lg">100% Organic</h3>
              <p className="text-sm text-brand-green-100 mt-2 font-light">Certified organic ingredients</p>
            </div>
            <div className="bg-brand-white/10 border border-brand-white/20 p-8 rounded-2xl text-center flex flex-col items-center justify-center">
              <div className="text-brand-lavender text-4xl mb-4">🌱</div>
              <h3 className="font-medium text-lg">Cruelty Free</h3>
              <p className="text-sm text-brand-green-100 mt-2 font-light">Never tested on animals</p>
            </div>
            <div className="bg-brand-white/10 border border-brand-white/20 p-8 rounded-2xl text-center flex flex-col items-center justify-center">
              <div className="text-brand-purple-300 text-4xl mb-4">💧</div>
              <h3 className="font-medium text-lg">Clinically Proven</h3>
              <p className="text-sm text-brand-green-100 mt-2 font-light">Dermatologist tested</p>
            </div>
            <div className="bg-brand-white/10 border border-brand-white/20 p-8 rounded-2xl text-center flex flex-col items-center justify-center">
              <div className="text-brand-green-300 text-4xl mb-4">🍃</div>
              <h3 className="font-medium text-lg">Vegan</h3>
              <p className="text-sm text-brand-green-100 mt-2 font-light">Plant-based formulas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
