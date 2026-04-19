import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookmarkPlus, Share2, Check, ChevronDown, ChevronUp } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { humanizeDiagnosis } from '@/lib/humanizeDiagnosis';
import TestimonialPrompt from '@/components/TestimonialPrompt';
import { saveLogOffline } from '@/utils/offlineStorage';
import { isDemoMode } from '@/lib/demoMode';
import DemoBottomSheet from '@/components/DemoBottomSheet';

const GOTTMAN_TIPS = {
  'crítica': 'Inicio suave: habla de TU sentimiento, no del defecto del otro.',
  'desprecio': 'Cultura de apreciación: busca lo que valoras en el otro.',
  'defensividad': 'Asume un 5% de responsabilidad. Solo uno.',
  'evasión': 'Pide una pausa de 20 minutos. Vuelve cuando el sistema nervioso se calme.',
  'generalización': 'Habla del comportamiento específico, no del patrón eterno.',
  'inicio duro': 'Empieza con "Yo siento…" en lugar de "Tú siempre…"',
};

function getGottmanTip(note = '') {
  const n = note.toLowerCase();
  for (const [key, tip] of Object.entries(GOTTMAN_TIPS)) {
    if (n.includes(key)) return tip;
  }
  return 'CNV: Observación + Sentimiento + Necesidad + Petición.';
}

async function saveLog({ original_text, cognitive_note, reframe_message, action_taken }) {
  if (isDemoMode()) return 'demo';
  const user = await base44.auth.me().catch(() => null);
  const logData = {
    user_email: user?.email || '',
    original_text,
    cognitive_note,
    reframe_message,
    action_taken,
    status: 'pending',
  };
  if (navigator.onLine) {
    await base44.entities.ConflictLog.create(logData);
  } else {
    await saveLogOffline(logData);
  }
}

export default function Reframe() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [tipOpen, setTipOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [humanizedDiagnosis, setHumanizedDiagnosis] = useState(null);
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);
  // Show demo sheet once after first reframe
  const [showDemoSheet, setShowDemoSheet] = useState(
    isDemoMode() && localStorage.getItem('naran_demo_sheet_shown') === '1'
  );

  // Limpiar cualquier prefijo que el prompt interno haya colado en original_text
  const rawText = state?.original_text || '';
  const originalText = rawText.replace(/^el usuario (reporta sentirse|se siente)[^.]+\.\s*(su mensaje:?\s*)?/i, '').replace(/^"(.+)"$/, '$1').trim();
  const cognitiveNote = state?.cognitive_note || '';
  const [reframeMessage, setReframeMessage] = useState(state?.reframe_message || '');

  useEffect(() => {
    if (cognitiveNote) {
      setLoadingDiagnosis(true);
      humanizeDiagnosis(cognitiveNote)
        .then(setHumanizedDiagnosis)
        .finally(() => setLoadingDiagnosis(false))
        .catch(() => setHumanizedDiagnosis(cognitiveNote));
    }
  }, [cognitiveNote]);

  const tip = getGottmanTip(cognitiveNote);

  // Detectar Jinete de Gottman para badge
  function detectJinete(text = '') {
    const t = text.toLowerCase();
    if (/siempre|nunca|eres un|eres una/.test(t)) return { label: 'Crítica', hint: 'Prueba un Inicio Suave.' };
    if (/qué ridículo|qué tontería|increíble lo tuyo|en serio/.test(t)) return { label: 'Desprecio', hint: 'Busca algo que valorar.' };
    if (/es que tú|pues tú también|y tú qué/.test(t)) return { label: 'Defensividad', hint: 'Asume un 5% de responsabilidad.' };
    if (text.trim().split(' ').length < 5) return { label: 'Evasión', hint: 'Intenta nombrar lo que sientes.' };
    return null;
  }
  const jinete = detectJinete(originalText);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async () => {
    // Optimistic UI: show success immediately
    setSaved(true);
    setSaving(true);
    showToast(navigator.onLine ? 'Guardado en historial ✓' : 'Sin conexión. Se sincronizará luego ✓');
    
    const result = await saveLog({ original_text: originalText, cognitive_note: cognitiveNote, reframe_message: reframeMessage, action_taken: 'saved' });
    setSaving(false);
    
    if (result === 'demo') {
      showToast('Regístrate para guardar tu progreso y llevar un historial real.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: reframeMessage }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(reframeMessage);
      showToast('Copiado al portapapeles ✓');
    }
    await saveLog({ original_text: originalText, cognitive_note: cognitiveNote, reframe_message: reframeMessage, action_taken: 'sent' }).catch(() => {});
  };

  const handleDone = () => navigate('/home');

  return (
    <div className="flex-1 flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(224,122,95,0.10) 0%, #FDFBF7 65%)' }}>

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

      <div className="flex-1 flex flex-col px-5 pb-6 overflow-y-auto">
        {/* Original (crossed out) */}
        {originalText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-xs text-muted-foreground/60 mb-2 uppercase tracking-wide font-medium">Lo que ibas a decir</p>
            <div className="rounded-2xl px-4 py-3" style={{ background: '#F0EDE6' }}>
              <p className="text-sm text-muted-foreground/60 leading-relaxed line-through italic">"{originalText}"</p>
            </div>
          </motion.div>
        )}

        {/* Jinete badge */}
        {jinete && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-4 flex items-center gap-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border"
              style={{ background: 'rgba(224,122,95,0.10)', borderColor: 'rgba(224,122,95,0.25)', color: '#C9614A' }}>
              ⚠️ {jinete.label}
            </span>
            <span className="text-xs text-muted-foreground">{jinete.hint}</span>
          </motion.div>
        )}

        {/* Humanized diagnosis */}
        {cognitiveNote && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-5"
          >
            <p className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-2">Lo que hay detrás de tu malestar</p>
            <div className="rounded-xl px-4 py-3 border border-primary/15"
              style={{ background: 'rgba(224,122,95,0.08)' }}>
              {loadingDiagnosis ? (
                <p className="text-xs text-foreground/60 italic">Analizando…</p>
              ) : (
                <p className="text-sm text-foreground/80 leading-relaxed">{humanizedDiagnosis || cognitiveNote}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Reframe message — editable */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex-1 mb-6"
        >
          <p className="text-xs text-muted-foreground/60 uppercase tracking-wide font-medium mb-3">Naran sugiere</p>
          <div className="rounded-3xl bg-white border-2 border-primary/20 shadow-sm overflow-hidden focus-within:border-primary/50 transition-colors">
            <textarea
              value={reframeMessage}
              onChange={e => setReframeMessage(e.target.value)}
              rows={5}
              inputMode="text"
              aria-label="Mensaje reencuadrado, editable"
              className="w-full resize-none px-5 pt-6 pb-6 text-xl leading-relaxed bg-transparent focus:outline-none tracking-wide cursor-text"
              style={{ color: '#2C2C2C' }}
            />
          </div>
          <div className="mt-3 rounded-xl px-4 py-3 bg-muted/40 border border-muted/60">
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              "Expresar lo que necesitas en lugar de lo que el otro hizo mal abre una puerta. (Pilar de la Torre)"
            </p>
          </div>
        </motion.div>

        {/* Testimonial prompt — colapsable al fondo */}
        <div className="mt-2 mb-2">
          <TestimonialPrompt />
        </div>
      </div>

      {/* Bottom toolbar — iOS style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="border-t border-border/40 bg-white/80 backdrop-blur-sm px-8 py-4 pb-8"
      >
        <div className="flex items-center justify-around">
          {/* Save */}
          <ToolbarButton
            icon={<BookmarkPlus className="w-5 h-5" />}
            label="Guardar en historial"
            onClick={handleSave}
            loading={saving}
            done={saved}
          />
          {/* Share */}
          <ToolbarButton
            icon={<Share2 className="w-5 h-5" />}
            label="Compartir"
            onClick={handleShare}
          />
          {/* Done — solo usar el mensaje, sin guardar */}
          <ToolbarButton
            icon={<Check className="w-5 h-5" />}
            label="Solo usar"
            onClick={handleDone}
            accent
          />
        </div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm px-5 py-3 rounded-2xl shadow-xl z-50 whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo bottom sheet — shown once after first reframe */}
      <DemoBottomSheet
        visible={showDemoSheet}
        onDismiss={() => {
          localStorage.removeItem('naran_demo_sheet_shown');
          setShowDemoSheet(false);
        }}
      />
    </div>
  );
}

function ToolbarButton({ icon, label, onClick, loading, done, accent }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      aria-label={label}
      className="flex flex-col items-center gap-1.5 transition-all disabled:opacity-40 active:scale-90"
      style={{ color: accent ? '#E07A5F' : undefined }}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${accent ? '' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}`}
        style={accent ? { background: 'rgba(224,122,95,0.12)', color: '#E07A5F' } : {}}>
        {loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : done ? <Check className="w-5 h-5 text-green-500" /> : icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}