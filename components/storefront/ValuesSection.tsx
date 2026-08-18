'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

const defaultValues = [
  {
    title: 'Ethically Sourced',
    description: 'We partner directly with farmers to ensure fair trade and sustainable harvesting practices.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: '100% Natural',
    description: 'No artificial additives, fillers, or synthetic chemicals. Just pure, unadulterated nature.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  },
  {
    title: 'Science-Backed',
    description: 'Traditional wisdom validated by modern clinical research for maximum efficacy.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  }
];

export default function ValuesSection({ content }: { content?: any }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (!sectionRef.current || !titleRef.current) return;
    
    let ctx = gsap.context(() => {
      // Title reveal
      gsap.fromTo(titleRef.current,
        { y: 100, opacity: 0, rotateX: -20 },
        {
          y: 0, opacity: 1, rotateX: 0,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          }
        }
      );

      // Cards reveal
      const cards = sectionRef.current?.querySelectorAll('.value-card');
      if (cards && cards.length > 0) {
        gsap.fromTo(cards, 
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [content]);

  const dynamicValues = content?.values || defaultValues;
  const renderValues = dynamicValues.map((v: any, i: number) => ({
    title: v.title,
    description: v.desc || v.description,
    icon: defaultValues[i % defaultValues.length].icon
  }));

  return (
    <section className="py-40 bg-white relative z-10 rounded-t-[3rem] -mt-10" ref={sectionRef}>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-start items-end gap-12 lg:gap-24 mb-24 perspective-[1000px]">
          <h2 ref={titleRef} className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] via-[#FF9800] to-brand-green-500 leading-none tracking-tight origin-bottom max-w-2xl pb-2">
            {content?.heading || "The Foundation of Our Craft."}
          </h2>
          <p className="text-gray-600 max-w-md font-sans text-lg mt-8 md:mt-0">
            We believe that true wellness stems from the purest ingredients, treated with immense respect from soil to skin.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 border-t border-gray-100 pt-20">
          {renderValues.map((value: any, idx: number) => {
            const colors = ['text-[#00BCD4] border-[#00BCD4]/20', 'text-[#FF9800] border-[#FF9800]/20', 'text-brand-green-500 border-brand-green-500/20'];
            const hoverColors = ['group-hover:bg-[#00BCD4]', 'group-hover:bg-[#FF9800]', 'group-hover:bg-brand-green-500'];
            const titleColors = ['text-[#00BCD4]', 'text-[#FF9800]', 'text-brand-green-500'];
            
            return (
              <div key={idx} className="value-card group bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 ease-out">
                <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-8 ${colors[idx % 3]} ${hoverColors[idx % 3]} group-hover:text-white group-hover:border-transparent transition-all duration-500 ease-out`}>
                  {value.icon}
                </div>
                <h3 className={`text-2xl font-serif mb-4 ${titleColors[idx % 3]}`}>{value.title}</h3>
                <p className="text-gray-600 font-sans text-lg leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
