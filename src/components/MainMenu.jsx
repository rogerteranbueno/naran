import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, History, BookOpen, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function MainMenu({ user }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/30 z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col"
              style={{ background: '#FDFBF7', boxShadow: '4px 0 24px rgba(0,0,0,0.1)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-10 pb-6">
                <span className="text-xl font-semibold text-foreground">🍊 Naran</span>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User info */}
              {user && (
                <div className="px-5 pb-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.full_name || 'Usuario'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu items */}
              <div className="flex-1 px-3 py-4 space-y-1">
                <MenuItem icon={History} label="Historial completo" onClick={() => go('/historial')} />
                <MenuItem icon={BookOpen} label="Biblioteca de recursos" onClick={() => go('/recursos')} />
              </div>

              {/* Logout */}
              <div className="px-3 pb-10">
                <button
                  onClick={() => base44.auth.logout('/login')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuItem({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-foreground hover:bg-secondary/60 transition-colors text-left"
    >
      <Icon className="w-4 h-4 text-muted-foreground" />
      {label}
    </button>
  );
}