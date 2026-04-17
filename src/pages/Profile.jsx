import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, BookOpen, Clock, Trash2, Pencil, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const AVATARS = ['🍊', '🌿', '🏔️', '🌊', '🌸', '🌙'];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [weeklyPattern, setWeeklyPattern] = useState('Comunicación clara');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Editable profile state
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatar, setAvatar] = useState('🍊');
  const [weeklyGoal, setWeeklyGoal] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setAvatar(u?.avatar || '🍊');
      setWeeklyGoal(u?.weekly_goal || '');
    }).catch(() => {});
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

  const saveAvatar = async (emoji) => {
    setAvatar(emoji);
    setShowAvatarPicker(false);
    await base44.auth.updateMe({ avatar: emoji }).catch(() => {});
  };

  const saveGoal = async () => {
    setWeeklyGoal(goalDraft);
    setEditingGoal(false);
    await base44.auth.updateMe({ weekly_goal: goalDraft }).catch(() => {});
  };

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
        {/* User info + avatar + goal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-border/40 space-y-4"
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAvatarPicker(p => !p)} className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'rgba(224,122,95,0.12)' }}>
                {avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Pencil className="w-2.5 h-2.5 text-white" />
              </div>
            </button>
            <div>
              <p className="font-semibold text-foreground">{user?.full_name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || '...'}</p>
            </div>
          </div>

          {/* Avatar picker */}
          <AnimatePresence>
            {showAvatarPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 pt-1">
                  {AVATARS.map(em => (
                    <button key={em} onClick={() => saveAvatar(em)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${avatar === em ? 'ring-2 ring-primary' : 'hover:bg-secondary/60'}`}
                      style={{ background: 'rgba(224,122,95,0.08)' }}>
                      {em}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Weekly goal */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Meta de la semana</p>
            {editingGoal ? (
              <div className="flex gap-2 items-center">
                <input
                  autoFocus
                  value={goalDraft}
                  onChange={e => setGoalDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveGoal(); if (e.key === 'Escape') setEditingGoal(false); }}
                  placeholder="Ej: Practicar la escucha activa"
                  className="flex-1 text-sm rounded-xl border border-border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button onClick={saveGoal} className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></button>
                <button onClick={() => setEditingGoal(false)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
              </div>
            ) : (
              <button
                onClick={() => { setGoalDraft(weeklyGoal); setEditingGoal(true); }}
                className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                {weeklyGoal || <span className="text-muted-foreground italic">Añade tu meta semanal…</span>}
                <Pencil className="w-3 h-3 text-muted-foreground shrink-0" />
              </button>
            )}
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
              onClick={() => navigate('/recursos?section=cnv')}
            />
            <LibraryCard
              emoji="⚠️"
              title="Los 4 Jinetes"
              subtitle="Patrones que dañan y sus antídotos"
              color="rgba(201,97,74,0.10)"
              onClick={() => navigate('/recursos?section=jinetes')}
            />
            <LibraryCard
              emoji="🍊"
              title="Pilar de la Torre"
              subtitle="CNV en español · Videos y podcast"
              color="rgba(224,122,95,0.10)"
              onClick={() => navigate('/recursos?section=pilar')}
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
          className="pt-4 space-y-2"
        >
          <button
            onClick={() => base44.auth.logout('/login')}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar cuenta
          </button>
        </motion.div>
      </div>

      {/* Delete Account Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(''); }}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
            >
              <div className="bg-white rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl">
                <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                  style={{ background: 'rgba(239,68,68,0.10)' }}>
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-lg font-semibold text-foreground text-center mb-2">Eliminar cuenta</h2>
                <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
                  Esta acción es irreversible. Se borrarán todos tus momentos y datos. Escribe <strong>ELIMINAR</strong> para confirmar.
                </p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="ELIMINAR"
                  className="w-full rounded-2xl border border-border px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
                />
                <button
                  disabled={deleteConfirm !== 'ELIMINAR' || deleting}
                  onClick={async () => {
                    setDeleting(true);
                    // Delete all logs, then logout
                    const logs = await base44.entities.ConflictLog.list('-created_date', 500).catch(() => []);
                    await Promise.all(logs.map(l => base44.entities.ConflictLog.delete(l.id).catch(() => {})));
                    base44.auth.logout('/login');
                  }}
                  className="w-full h-12 rounded-2xl text-white text-sm font-medium transition-all disabled:opacity-40"
                  style={{ background: '#ef4444' }}
                >
                  {deleting ? 'Eliminando…' : 'Sí, eliminar mi cuenta'}
                </button>
                <button
                  onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(''); }}
                  className="mt-3 w-full py-3 text-sm text-muted-foreground"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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