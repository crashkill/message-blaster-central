import React, { useState } from 'react';
// @ts-ignore
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedPinProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const AnimatedPin: React.FC<AnimatedPinProps> = ({ title, children, className }) => {
  const [transform, setTransform] = useState('translate(-50%,-50%) rotateX(0deg) scale(1)');

  return (
    <div
      className={cn('relative group cursor-pointer', className)}
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setTransform('translate(-50%,-50%) rotateX(30deg) scale(0.9)')}
      onMouseLeave={() => setTransform('translate(-50%,-50%) rotateX(0deg) scale(1)')}
    >
      {/* Card */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ transform }}
      >
        <div className="relative p-6 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md shadow-lg overflow-hidden">
          {children}
          {/* Waves */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-full h-24 left-0 bottom-0"
              style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.2) 50%, transparent 100%)' }}
              initial={{ y: 20 * i, opacity: 0.2 / i }}
              animate={{ y: -20 * i, opacity: 0 }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOutSine', delay: i * 0.5 }}
            />
          ))}
        </div>
      </div>

      {/* Title badge */}
      {title && (
        <span className="absolute left-1/2 top-4 -translate-x-1/2 text-xs bg-white/10 px-3 py-1 rounded-full text-white backdrop-blur-sm">
          {title}
        </span>
      )}
    </div>
  );
};

export default AnimatedPin; 