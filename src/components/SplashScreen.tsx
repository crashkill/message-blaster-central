import React, { useEffect, useRef } from 'react';
// @ts-ignore - animejs sem tipos; usar versão ES
import anime from 'animejs/lib/anime.es.js';
import { MessageSquare } from 'lucide-react';

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const logoRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (logoRef.current) {
      anime({
        targets: logoRef.current.querySelectorAll('path, rect, circle, polygon, line'),
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeInOutSine',
        duration: 2500,
        delay: (el, i) => i * 150,
        direction: 'alternate',
        loop: true,
      });
    }

    const timer = setTimeout(() => {
      onFinish();
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Ícone animado */}
      <div className="mb-6 text-green-600 dark:text-green-400">
        <MessageSquare className="h-20 w-20 animate-pulse" />
      </div>
      {/* Logo ou nome */}
      <svg ref={logoRef} width="300" height="80" viewBox="0 0 300 80" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-900 dark:text-white">
        <text x="0" y="60" fontSize="60" fontFamily="Arial, Helvetica, sans-serif">Galatéia</text>
      </svg>
      <p className="mt-4 text-gray-700 dark:text-gray-300">Carregando amor e mensagens...</p>
    </div>
  );
};

export default SplashScreen; 