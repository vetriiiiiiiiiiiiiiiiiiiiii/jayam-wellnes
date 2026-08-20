import React from 'react';
const testimonials = [{
  id: 1,
  text: "The Moringa Oil has completely transformed my skincare routine. My skin has never felt more hydrated and glowing.",
  author: "Dr V Kamaraja",
  role: "Medical Expert"
}, {
  id: 2,
  text: "I love the aesthetic and the purity of these products. It feels like a true luxury spa experience at home.",
  author: "Dr N Rajeshwari",
  role: "Verified Buyer"
}, {
  id: 3,
  text: "The herbal blends are incredibly potent. You can literally smell the freshness and organic quality.",
  author: "Er K Senthilvel",
  role: "Verified Buyer"
}, {
  id: 4,
  text: "Finally, a brand that doesn't compromise on ingredients. The pastel branding matches the gentle nature of the products.",
  author: "Aisha T.",
  role: "Verified Buyer"
}];
export default function TestimonialsCarousel() {
  return <section className="py-32 bg-brand-pearl overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <h2 className="text-4xl md:text-5xl font-serif text-brand-dark">Word of <span className="text-brand-purple-500 italic">Mouth</span></h2>
      </div>
      
      {/* Native CSS Horizontal Scroll with Snapping */}
      <div className="w-full overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar pl-6 md:pl-[max(1.5rem,calc((100vw-80rem)/2))]">
        <div className="flex gap-8 w-max pr-6">
          {testimonials.map(testimonial => <div key={testimonial.id} className="w-[85vw] md:w-[420px] bg-white p-10 rounded-3xl shadow-sm border border-brand-green-100 flex-shrink-0 snap-start">
              <div className="flex gap-1 mb-6 text-brand-green-500">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="text-xl font-serif text-brand-dark mb-8 leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-lavender flex items-center justify-center text-brand-purple-700 font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-brand-dark text-sm">{testimonial.author}</p>
                  <p className="text-xs text-brand-purple-500">{testimonial.role}</p>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
}