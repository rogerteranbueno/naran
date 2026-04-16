import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Flame, MessageCircle, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <p className="text-sm text-muted-foreground">{greeting()}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user?.full_name?.split(' ')[0] || 'Hola'}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Main CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex-1 flex flex-col items-center justify-center"
      >
        <div className="text-center mb-10">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Flame className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">
            ¿Momento difícil?
          </h2>
          <p className="text-sm text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
            Escribe lo que sientes. Naran te ayudará a transformarlo en un mensaje que conecte.
          </p>
        </div>

        <Button
          className="w-full max-w-[280px] h-14 rounded-2xl text-base font-medium gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
        >
          <MessageCircle className="w-5 h-5" />
          Expresar lo que siento
        </Button>
      </motion.div>

      {/* Bottom hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 py-4"
      >
        <Heart className="w-3 h-3 text-primary/40" />
        <p className="text-xs text-muted-foreground/50">
          Tu espacio seguro para comunicar mejor
        </p>
      </motion.div>
    </div>
  );
}