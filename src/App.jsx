import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

import MobileLayout from '@/components/MobileLayout';
import Welcome from '@/pages/Welcome';
import Home from '@/pages/Home';
import Reframe from '@/pages/Reframe';
import LogDetail from '@/pages/LogDetail';
import Historial from '@/pages/Historial';
import Recursos from '@/pages/Recursos';
import Profile from '@/pages/Profile';
import Practica from '@/pages/Practica';
import Espacio from '@/pages/Espacio';
import Unirse from '@/pages/Unirse';
import BibliotecaAuditiva from '@/pages/BibliotecaAuditiva';
import Admin from '@/pages/Admin';

// Ensure app always uses light theme
function SystemThemeSync() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);
  return null;
}

// Animated page wrapper
function AnimatedRoutes({ children }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -40, opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      <Route element={<MobileLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AnimatedRoutes><Welcome /></AnimatedRoutes>} />
        <Route path="/home" element={<AnimatedRoutes><Home /></AnimatedRoutes>} />
        <Route path="/app" element={<Navigate to="/home" replace />} />
        <Route path="/reframe" element={<AnimatedRoutes><Reframe /></AnimatedRoutes>} />
        <Route path="/log/:id" element={<AnimatedRoutes><LogDetail /></AnimatedRoutes>} />
        <Route path="/historial" element={<AnimatedRoutes><Historial /></AnimatedRoutes>} />
        <Route path="/recursos" element={<AnimatedRoutes><Recursos /></AnimatedRoutes>} />
        <Route path="/profile" element={<AnimatedRoutes><Profile /></AnimatedRoutes>} />
        <Route path="/practica" element={<AnimatedRoutes><Practica /></AnimatedRoutes>} />
        <Route path="/espacio" element={<AnimatedRoutes><Espacio /></AnimatedRoutes>} />
        <Route path="/unirse" element={<AnimatedRoutes><Unirse /></AnimatedRoutes>} />
        <Route path="/biblioteca-auditiva" element={<AnimatedRoutes><BibliotecaAuditiva /></AnimatedRoutes>} />
        <Route path="/admin" element={<AnimatedRoutes><Admin /></AnimatedRoutes>} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <SystemThemeSync />
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App