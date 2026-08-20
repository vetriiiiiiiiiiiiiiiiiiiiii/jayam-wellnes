'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
export default function MagneticButton({
  children,
  className = '',
  strength = 30
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    const handleMouseMove = e => {
      const {
        clientX,
        clientY
      } = e;
      const {
        height,
        width,
        left,
        top
      } = node.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      gsap.to(node, {
        x: x / width * strength,
        y: y / height * strength,
        duration: 1,
        ease: 'power3.out'
      });
    };
    const handleMouseLeave = () => {
      gsap.to(node, {
        x: 0,
        y: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.3)'
      });
    };
    node.addEventListener('mousemove', handleMouseMove);
    node.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      node.removeEventListener('mousemove', handleMouseMove);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);
  return <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>;
}