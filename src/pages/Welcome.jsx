import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { startDemo } from '@/lib/demoMode';

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
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const handleDemo = () => {
    startDemo();
    navigate('/home');
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-12"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(224,122,95,0.12) 0%, #FDFBF7 70%)' }}>
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

        <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-3 lowercase">
          naran
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-[260px]">
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
        <Button
          onClick={handleLogin}
          className="w-full h-14 rounded-2xl text-base font-medium gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
        >
          Comenzar
          <ArrowRight className="w-4 h-4" />
        </Button>

        <button
          onClick={handleDemo}
          className="w-full h-12 rounded-2xl text-sm font-medium border-2 transition-colors touch-none select-none"
          style={{ borderColor: '#E07A5F', color: '#E07A5F', background: 'transparent' }}
        >
          Probar Naran sin registro
        </button>

        <p className="text-center text-xs text-muted-foreground/70 pt-1">
          Al continuar aceptas nuestros términos de uso y privacidad.
        </p>
      </motion.div>
    </div>
  );
}