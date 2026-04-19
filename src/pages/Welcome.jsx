import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function Welcome() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  const handleLogin = () => {
    base44.auth.redirectToLogin('/home');
  };

  React.useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate('/home', { replace: true });
      setChecking(false);
    });
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#FDFBF7' }}>
        <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid rgba(224,122,95,0.3)', borderTopColor: '#E07A5F' }} />
      </div>
    );
  }

  const handleDemo = () => {
    navigate('/demo');
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(224,122,95,0.12) 0%, #FDFBF7 70%)', paddingTop: 'max(3rem, env(safe-area-inset-top))', paddingBottom: '3rem' }}>
      {/* Top section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col justify-center items-center text-center"
      >
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
            style={{ background: 'rgba(224,122,95,0.12)' }}>
            🍊
          </div>
        </div>

        <h1 className="text-4xl font-semibold tracking-tight mb-3 lowercase" style={{ color: '#1A1A1A' }}>
          naran
        </h1>
        <p className="text-base leading-relaxed max-w-[260px]" style={{ color: '#6B6560' }}>
          Transforma tus reacciones en conexión. Una pausa inteligente para tu relación.
        </p>
      </motion.div>

      {/* Bottom section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-3"
      >
        <button
          onClick={handleLogin}
          className="w-full h-14 rounded-2xl text-base font-medium flex items-center justify-center gap-2 text-white transition-all active:scale-95"
          style={{ background: '#E07A5F', boxShadow: '0 8px 24px rgba(224,122,95,0.35)' }}
        >
          Comenzar
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleDemo}
          className="w-full h-12 rounded-2xl text-sm font-medium border-2 transition-colors touch-none select-none"
          style={{ borderColor: '#E07A5F', color: '#E07A5F', background: 'transparent' }}
        >
          Probar Naran sin registro
        </button>

        <p className="text-center text-xs pt-1" style={{ color: '#A89F97' }}>
          Al continuar aceptas nuestros términos de uso y privacidad.
        </p>
      </motion.div>
    </div>
  );
}