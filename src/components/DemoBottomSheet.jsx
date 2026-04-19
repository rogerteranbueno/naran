import { motion, AnimatePresence } from 'framer-motion';
import { endDemo } from '@/lib/demoMode';
import { base44 } from '@/api/base44Client';

export default function DemoBottomSheet({ visible, onDismiss }) {
  const handleCreate = () => {
    endDemo();
    base44.auth.redirectToLogin('/home');
  };

  const handleContinue = () => {
    onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.35)' }}
            onClick={handleContinue}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
          >
            <div className="bg-white rounded-t-3xl px-6 pt-5 pb-10 shadow-2xl">
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />

              <div className="text-4xl text-center mb-4">🍊</div>

              <h2 className="text-xl font-semibold text-foreground text-center mb-3 leading-snug">
                ¿Ves el poder de una pausa?
              </h2>

              <p className="text-sm text-muted-foreground text-center leading-relaxed mb-8">
                Esto es solo una prueba. Imagina tener tu propio historial, rachas y poder invitar a tu pareja.{' '}
                <span className="font-medium text-foreground">Es gratis y sin anuncios.</span>
              </p>

              <button
                onClick={handleCreate}
                className="w-full h-14 rounded-2xl text-white text-base font-semibold mb-3 transition-all active:scale-95 touch-none select-none"
                style={{ background: '#E07A5F', boxShadow: '0 8px 24px rgba(224,122,95,0.35)' }}
              >
                Crear mi espacio de calma →
              </button>

              <button
                onClick={handleContinue}
                className="w-full py-3 text-sm text-muted-foreground transition-colors hover:text-foreground touch-none select-none"
              >
                Seguir explorando
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}