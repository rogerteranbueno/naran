import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { endDemo } from '@/lib/demoMode';
import { base44 } from '@/api/base44Client';

export default function DemoBanner() {
  const handleCreate = () => {
    endDemo();
    base44.auth.redirectToLogin('/home');
  };

  const handleDismiss = () => {
    endDemo();
    window.location.href = '/login';
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 22 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-sm"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-border/40 px-4 py-3 flex items-center gap-3">
        <Sparkles className="w-4 h-4 shrink-0" style={{ color: '#E07A5F' }} />
        <p className="flex-1 text-xs text-foreground leading-relaxed">
          Modo de prueba. Tus datos no se guardarán.
        </p>
        <button
          onClick={handleCreate}
          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl text-white touch-none select-none"
          style={{ background: '#E07A5F' }}
        >
          Crear cuenta
        </button>
        <button
          onClick={handleDismiss}
          className="shrink-0 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg touch-none select-none"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}