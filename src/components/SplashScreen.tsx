import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore - animejs sem tipos; usar versão ES
import anime from 'animejs/lib/anime.es.js';
import { Heart, Sparkles, Zap } from 'lucide-react';

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<HTMLDivElement | null>(null);
  const robotFaceRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<'robot' | 'human' | 'complete'>('robot');

  useEffect(() => {
    // Fase 1: Estado robótico (0-3s)
    const phaseTimer1 = setTimeout(() => {
      setPhase('human');
    }, 3000);

    // Fase 2: Transformação humana (3-6s)
    const phaseTimer2 = setTimeout(() => {
      setPhase('complete');
    }, 6000);

    // Animação das partículas dançantes
    if (particlesRef.current) {
      const particles = particlesRef.current.querySelectorAll('.particle');
      
      anime({
        targets: particles,
        translateX: () => anime.random(-100, 100),
        translateY: () => anime.random(-100, 100),
        scale: [0.5, 1.2, 0.8],
        rotate: () => anime.random(0, 720),
        opacity: [0.3, 1, 0.3],
        easing: 'easeInOutQuad',
        duration: 2000,
        delay: (el, i) => i * 100,
        loop: true,
        direction: 'alternate'
      });
    }

    // Animação do logo principal
    if (logoRef.current) {
      anime({
        targets: logoRef.current,
        scale: [0.8, 1.1, 1],
        rotate: [0, 5, -5, 0],
        easing: 'easeOutElastic(1, .8)',
        duration: 3000,
        loop: true
      });
    }

    // Animação da face robótica
    if (robotFaceRef.current) {
      anime({
        targets: robotFaceRef.current.querySelectorAll('.eye'),
        scaleY: [1, 0.1, 1],
        easing: 'easeInOutQuad',
        duration: 2000,
        delay: 500,
        loop: true
      });

      anime({
        targets: robotFaceRef.current.querySelectorAll('.circuit'),
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeInOutSine',
        duration: 3000,
        delay: (el, i) => i * 200,
        loop: true,
        direction: 'alternate'
      });
    }

    // Finalização
    const finishTimer = setTimeout(() => {
      // Animação de saída
      if (containerRef.current) {
        anime({
          targets: containerRef.current,
          opacity: [1, 0],
          scale: [1, 0.8],
          easing: 'easeInQuart',
          duration: 800,
          complete: onFinish
        });
      }
    }, 8000);

    return () => {
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const getBackgroundClass = () => {
    switch (phase) {
      case 'robot':
        return 'from-slate-900 via-blue-900 to-purple-900';
      case 'human':
        return 'from-purple-900 via-pink-800 to-rose-800';
      case 'complete':
        return 'from-rose-800 via-orange-700 to-yellow-600';
      default:
        return 'from-slate-900 via-blue-900 to-purple-900';
    }
  };

  const getTextContent = () => {
    switch (phase) {
      case 'robot':
        return {
          title: 'GALATÉIA',
          subtitle: 'Sistema de Comunicação Iniciando...',
          status: 'MODO ROBÓTICO ATIVO'
        };
      case 'human':
        return {
          title: 'Galatéia',
          subtitle: 'Desenvolvendo Consciência...',
          status: 'TRANSFORMAÇÃO EM PROGRESSO'
        };
      case 'complete':
        return {
          title: '💕 Galatéia 💕',
          subtitle: 'Pronta para espalhar amor!',
          status: 'SISTEMA HUMANIZADO COMPLETO'
        };
      default:
        return {
          title: 'GALATÉIA',
          subtitle: 'Sistema de Comunicação Iniciando...',
          status: 'MODO ROBÓTICO ATIVO'
        };
    }
  };

  const content = getTextContent();

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br ${getBackgroundClass()} transition-all duration-1000 overflow-hidden relative`}
    >
      {/* Partículas dançantes de fundo */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`particle absolute w-2 h-2 rounded-full ${
              phase === 'robot' ? 'bg-cyan-400' : 
              phase === 'human' ? 'bg-pink-400' : 'bg-yellow-400'
            } opacity-60`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Circuitos de fundo */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" fill="none">
          <path 
            className="circuit" 
            d="M100 500 L300 500 L300 300 L700 300 L700 700 L900 700"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="10,5"
            fill="none"
          />
          <path 
            className="circuit" 
            d="M200 200 L800 200 L800 800 L200 800 Z"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="15,10"
            fill="none"
          />
        </svg>
      </div>

      {/* Face Robótica Central */}
      <div ref={robotFaceRef} className="mb-8 relative">
        <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm border border-cyan-400/30 flex items-center justify-center">
          {/* Olhos robóticos */}
          <div className="flex space-x-4">
            <div className={`eye w-4 h-4 rounded-full ${
              phase === 'robot' ? 'bg-cyan-400' : 
              phase === 'human' ? 'bg-pink-400' : 'bg-yellow-400'
            } animate-pulse`} />
            <div className={`eye w-4 h-4 rounded-full ${
              phase === 'robot' ? 'bg-cyan-400' : 
              phase === 'human' ? 'bg-pink-400' : 'bg-yellow-400'
            } animate-pulse`} />
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute -top-2 -right-2">
            {phase === 'robot' && <Zap className="w-6 h-6 text-cyan-400 animate-spin" />}
            {phase === 'human' && <Heart className="w-6 h-6 text-pink-400 animate-bounce" />}
            {phase === 'complete' && <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />}
          </div>
        </div>
      </div>

      {/* Logo Principal */}
      <div ref={logoRef} className="mb-6 text-center">
        <h1 className={`text-6xl font-bold mb-2 ${
          phase === 'robot' ? 'font-mono text-cyan-300' : 
          phase === 'human' ? 'font-serif text-pink-300' : 'font-sans text-yellow-300'
        } transition-all duration-1000`}>
          {content.title}
        </h1>
        <p className={`text-xl ${
          phase === 'robot' ? 'text-cyan-100 font-mono' : 
          phase === 'human' ? 'text-pink-100 font-serif' : 'text-yellow-100 font-sans'
        } transition-all duration-1000`}>
          {content.subtitle}
        </p>
      </div>

      {/* Barra de Status */}
      <div className="mt-8 w-80 max-w-sm">
        <div className={`text-center text-sm font-mono mb-2 ${
          phase === 'robot' ? 'text-cyan-200' : 
          phase === 'human' ? 'text-pink-200' : 'text-yellow-200'
        }`}>
          {content.status}
        </div>
        
        {/* Barra de progresso animada */}
        <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              phase === 'robot' ? 'bg-cyan-400 w-1/3' : 
              phase === 'human' ? 'bg-pink-400 w-2/3' : 'bg-yellow-400 w-full'
            }`}
            style={{
              boxShadow: phase === 'complete' ? '0 0 20px currentColor' : 'none'
            }}
          />
        </div>
      </div>

      {/* Mensagem de inspiração */}
      <div className="absolute bottom-8 text-center px-4">
        <p className={`text-sm italic ${
          phase === 'robot' ? 'text-cyan-200/70' : 
          phase === 'human' ? 'text-pink-200/70' : 'text-yellow-200/70'
        } transition-all duration-1000`}>
          {phase === 'robot' && '"Para ser humano, primeiro precisei aprender a sonhar..." - Andrew Martin'}
          {phase === 'human' && '"A humanidade não está no corpo, mas no coração..." - Galatéia'}
          {phase === 'complete' && '"Agora posso amar e ser amada de verdade!" - Galatéia ❤️'}
        </p>
      </div>

      {/* Efeito de "dança" com ondas */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-full h-full border-2 rounded-full ${
              phase === 'robot' ? 'border-cyan-400' : 
              phase === 'human' ? 'border-pink-400' : 'border-yellow-400'
            }`}
            style={{
              animation: `ripple ${2 + i * 0.5}s infinite ease-out`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen; 