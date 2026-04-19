import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ROOT_SCREENS = ['/', '/login'];

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isRootScreen = ROOT_SCREENS.includes(pathname);

  if (isRootScreen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center px-5 py-4 border-b border-border/40"
      >
        <span className="text-sm font-semibold" style={{ color: '#2C2C2C' }}>🍊 naran</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center px-5 py-3 border-b border-border/40"
    >
      <button
        onClick={() => navigate(-1)}
        aria-label="Atrás"
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors touch-none select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-medium">Atrás</span>
      </button>
    </motion.div>
  );
}