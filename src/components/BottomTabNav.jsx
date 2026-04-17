import { useNavigate, useLocation } from 'react-router-dom';
import { Home, History, Dumbbell, User } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
  { path: '/home', label: 'Inicio', icon: Home },
  { path: '/historial', label: 'Historial', icon: History },
  { path: '/practica', label: 'Práctica', icon: Dumbbell },
  { path: '/profile', label: 'Perfil', icon: User },
];

export default function BottomTabNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border safe-bottom"
      style={{ maxWidth: '100vw', margin: '0 auto' }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-20 px-2">
        {TABS.map(tab => {
          const isActive = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors touch-none select-none"
            >
              <Icon
                className="w-5 h-5"
                style={{
                  color: isActive ? '#E07A5F' : '#999',
                  transition: 'color 0.2s ease',
                }}
              />
              <span
                className="text-[10px] font-medium transition-colors"
                style={{
                  color: isActive ? '#E07A5F' : '#999',
                }}
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