'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function HeroSection({ content }: { content?: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (!containerRef.current || !imageRef.current || !title1Ref.current || !title2Ref.current || !subtitleRef.current || !ctaRef.current) return;

    let ctx = gsap.context(() => {
      // Cinematic Intro Reveal
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      gsap.set(imageRef.current, { scale: 1.1, filter: 'brightness(0.3) saturate(0.8)' });
      gsap.set([title1Ref.current, title2Ref.current], { yPercent: 120, rotateX: -20, opacity: 0 });
      gsap.set(subtitleRef.current, { opacity: 0, y: 30, letterSpacing: '0.1em' });
      gsap.set(ctaRef.current, { opacity: 0, y: 30 });

      tl.to(imageRef.current, {
        scale: 1,
        filter: 'brightness(0.6) saturate(1)',
        duration: 2.5,
        ease: 'power3.out'
      })
      .to([title1Ref.current, title2Ref.current], {
        yPercent: 0,
        rotateX: 0,
        opacity: 1,
        duration: 1.8,
        stagger: 0.15,
        ease: 'expo.out'
      }, "-=1.8")
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        letterSpacing: '0.3em',
        duration: 1.5,
      }, "-=1.4")
      .to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
      }, "-=1.2");

      // Scroll Parallax - Apple Style Pinning
      gsap.to(containerRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
        }
      });

      gsap.to(imageRef.current, {
        yPercent: 20,
        scale: 1.05,
        filter: 'brightness(0.3)',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });

      gsap.to([title1Ref.current, title2Ref.current, subtitleRef.current, ctaRef.current], {
        yPercent: -100,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [content]);

  const headingWords = content?.heading ? content.heading.split(' ') : ['Nature,', 'Considered.'];
  const firstHalf = content?.heading ? headingWords.slice(0, Math.ceil(headingWords.length / 2)).join(' ') : 'Nature,';
  const secondHalf = content?.heading ? headingWords.slice(Math.ceil(headingWords.length / 2)).join(' ') : 'Considered.';

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-brand-forest-700 text-white z-0">
      <div className="absolute inset-0 w-full h-full">
        <Image
          ref={imageRef}
          src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=2800&auto=format&fit=crop"
          alt="Luxury botanical skincare"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-forest-700/60 via-transparent to-brand-forest-700/80 pointer-events-none" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 px-4 mt-16 perspective-[1000px]">
        <p ref={subtitleRef} className="text-[10px] md:text-xs uppercase font-sans font-bold mb-8 text-brand-gold tracking-[0.3em]">
          {content?.subheading || "The pure power of moringa"}
        </p>
        
        <div className="overflow-hidden py-2">
          <h1 ref={title1Ref} className="text-7xl md:text-9xl lg:text-[12rem] font-serif leading-[0.85] tracking-tighter text-center text-brand-pearl">
            {firstHalf}
          </h1>
        </div>
        
        <div className="overflow-hidden py-2 mb-12">
          <h1 ref={title2Ref} className="text-7xl md:text-9xl lg:text-[12rem] font-serif leading-[0.85] tracking-tighter text-center text-brand-gold italic">
            {secondHalf}
          </h1>
        </div>

        <div ref={ctaRef} className="mt-8 flex flex-col sm:flex-row gap-6 items-center">
          <button className="px-12 py-5 bg-brand-pearl text-brand-forest-700 rounded-full font-sans text-sm font-bold tracking-widest uppercase hover:scale-105 hover:bg-white transition-all duration-500 shadow-xl">
            {content?.primaryButtonText || "Shop Collection"}
          </button>
          <button className="px-12 py-5 border border-brand-pearl/30 text-brand-pearl rounded-full font-sans text-sm font-bold tracking-widest uppercase hover:bg-brand-pearl/10 hover:border-brand-pearl transition-all duration-500">
            {content?.secondaryButtonText || "Our Story"}
          </button>
        </div>
      </div>
    </section>
  );
}
