import { useNavigate, useLocation } from 'react-router-dom';
import { Home, History, Dumbbell, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

const TABS = [
  { path: '/home', label: 'Inicio', icon: Home },
  { path: '/historial', label: 'Historial', icon: History },
  { path: '/practica', label: 'Práctica', icon: Dumbbell },
  { path: '/profile', label: 'Perfil', icon: User },
];

export default function BottomTabNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Preserve scroll position when switching tabs
  useEffect(() => {
    const scrollContainer = document.querySelector(`[data-scroll-container]`);
    if (!scrollContainer) return;

    // Restore scroll from previous tab
    const saved = sessionStorage.getItem(`tab_scroll_${pathname}`);
    if (saved) {
      setTimeout(() => {
        scrollContainer.scrollTop = parseInt(saved, 10);
      }, 50);
    }

    // Save scroll before leaving tab
    return () => {
      sessionStorage.setItem(`tab_scroll_${pathname}`, scrollContainer.scrollTop || 0);
    };
  }, [pathname]);

  return (
    <motion.div
      id="home-nav"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border safe-bottom"
      style={{ maxWidth: '100vw', margin: '0 auto', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2" style={{ height: 64 }}>
        {TABS.map(tab => {
          const isActive = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path, { replace: true })}
              aria-label={tab.label}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors touch-none select-none"
            >
              <Icon
                className="w-5 h-5"
                style={{ color: isActive ? '#E07A5F' : '#999' }}
              />
              <span
                className="text-xs font-medium transition-colors"
                style={{ color: isActive ? '#E07A5F' : '#999', fontSize: 11 }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}