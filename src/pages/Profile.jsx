import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [weeklyPattern, setWeeklyPattern] = useState('Comunicación clara');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    base44.entities.ConflictLog.list('-created_date', 50).then(logs => {
      const recent = logs.filter(l => l.created_date > oneWeekAgo);
      setWeeklyCount(recent.length);
      if (recent.length > 0) {
        const notes = recent.map(l => l.cognitive_note || '').join(' ').toLowerCase();
        if (notes.includes('crítica') || notes.includes('crítico')) setWeeklyPattern('Evitar la crítica directa');
        else if (notes.includes('evasiv') || notes.includes('silencio')) setWeeklyPattern('Presencia y conexión');
        else if (notes.includes('ansiedad') || notes.includes('preocup')) setWeeklyPattern('Calma antes de hablar');
        else setWeeklyPattern('Comunicación empática');
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="flex-1 flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(224,122,95,0.10) 0%, #FDFBF7 60%)' }}>

      {/* Header */}
      <div className="flex items-center px-5 pt-10 pb-6">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
      </div>

      <div className="flex-1 px-5 pb-10 space-y-5">
        {/* User info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-border/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'rgba(224,122,95,0.12)' }}>
              🍊
            </div>
            <div>
              <p className="font-semibold text-foreground">{user?.full_name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || '...'}</p>
            </div>
          </div>
        </motion.div>

        {/* Weekly summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-border/40"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Esta semana</p>
          </div>
          {weeklyCount === 0 ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              Aún no has usado Naran esta semana. Cada momento que pausas es un paso hacia una comunicación más amorosa.
            </p>
          ) : (
            <>
              <p className="text-2xl font-bold text-foreground mb-1">{weeklyCount} <span className="text-base font-normal text-muted-foreground">{weeklyCount === 1 ? 'momento' : 'momentos'}</span></p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Estás trabajando en: <span className="text-foreground font-medium">{weeklyPattern}</span>
              </p>
            </>
          )}
        </motion.div>

        {/* Biblioteca */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Biblioteca de calma</p>
          <div className="space-y-3">
            <LibraryCard
              emoji="🕊️"
              title="Comunicación No Violenta"
              subtitle="4 pasos para expresar sin herir"
              color="rgba(224,122,95,0.10)"
              onClick={() => navigate('/recursos')}
            />
            <LibraryCard
              emoji="⚠️"
              title="Los 4 Jinetes"
              subtitle="Patrones que dañan y sus antídotos"
              color="rgba(201,97,74,0.10)"
              onClick={() => navigate('/recursos')}
            />
          </div>
        </motion.div>

        {/* Historial */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          onClick={() => navigate('/historial')}
          className="w-full flex items-center gap-3 bg-white rounded-3xl px-5 py-4 shadow-sm border border-border/40 text-left hover:bg-secondary/30 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Ver historial completo</span>
        </motion.button>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <button
            onClick={() => base44.auth.logout('/login')}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function LibraryCard({ emoji, title, subtitle, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 bg-white rounded-3xl px-5 py-4 shadow-sm border border-border/40 text-left hover:bg-secondary/30 transition-colors"
    >
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: color }}>
        {emoji}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </button>
  );
}