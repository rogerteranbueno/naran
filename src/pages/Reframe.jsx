import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Copy, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

async function saveConflictLog({ original_text, cognitive_note, reframe_message, action_taken }) {
  const user = await base44.auth.me().catch(() => null);
  await base44.entities.ConflictLog.create({
    user_email: user?.email || '',
    original_text,
    cognitive_note,
    reframe_message,
    action_taken,
  });
}

export default function Reframe() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const originalText = state?.original_text || '';
  const cognitiveNote = state?.cognitive_note || '';
  const [editedMessage, setEditedMessage] = useState(state?.reframe_message || '');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    setSaving(true);
    await navigator.clipboard.writeText(editedMessage).catch(() => {});
    try {
      await saveConflictLog({ original_text: originalText, cognitive_note: cognitiveNote, reframe_message: editedMessage, action_taken: 'sent' });
    } catch {
      showToast('No se pudo guardar. Revisa tu conexión.');
      setSaving(false);
      return;
    }
    if (navigator.share) {
      navigator.share({ text: editedMessage }).catch(() => {});
    } else {
      window.open(`whatsapp://send?text=${encodeURIComponent(editedMessage)}`);
    }
    showToast('¡Copiado! Pégalo en tu chat.');
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConflictLog({ original_text: originalText, cognitive_note: cognitiveNote, reframe_message: editedMessage, action_taken: 'saved' });
    } catch {
      showToast('No se pudo guardar. Revisa tu conexión.');
      setSaving(false);
      return;
    }
    showToast('Momento guardado en tu historial.');
    setTimeout(() => navigate('/app'), 1200);
    setSaving(false);
  };

  return (
    <div className="flex-1 flex flex-col px-5 py-8">

      {/* Top bar */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/app')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
        <p className="flex-1 text-center text-sm font-medium text-foreground mr-12">
          Naran sugiere
        </p>
      </div>

      {/* Cognitive note badge */}
      {cognitiveNote && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 mb-6"
        >
          <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">Naran detectó: </span>
            <span style={{ color: '#E07A5F' }}>{cognitiveNote}</span>
          </p>
        </motion.div>
      )}

      {/* Original text */}
      {originalText && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Dijiste:</p>
          <div className="rounded-xl px-4 py-3" style={{ background: '#F3F1EB' }}>
            <p className="text-sm text-foreground/60 leading-relaxed italic">"{originalText}"</p>
          </div>
        </motion.div>
      )}

      {/* Reframe message — editable */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex-1"
      >
        <p className="text-sm font-semibold text-foreground mb-3">Prueba decir esto:</p>
        <div className="relative rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors z-10"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          </button>
          <textarea
            value={editedMessage}
            onChange={e => setEditedMessage(e.target.value)}
            rows={4}
            className="w-full resize-none px-5 pt-5 pb-4 pr-12 text-lg leading-relaxed bg-transparent focus:outline-none"
            style={{ color: '#2C2C2C' }}
          />
          <p className="px-5 pb-3 text-xs text-muted-foreground/50">Puedes editar el mensaje antes de enviarlo</p>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-3 mb-6"
      >
        <button
          onClick={handleSend}
          disabled={saving}
          className="w-full h-14 rounded-2xl text-white text-base font-medium flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60"
          style={{ background: '#E07A5F', boxShadow: '0 8px 24px rgba(224,122,95,0.25)' }}
        >
          {saving
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : copied
              ? <><Check className="w-5 h-5" /> ¡Copiado!</>
              : 'Enviar mensaje'
          }
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 rounded-2xl text-base font-medium flex items-center justify-center gap-2 border-2 transition-opacity disabled:opacity-60"
          style={{ borderColor: '#E07A5F', color: '#E07A5F', background: 'transparent' }}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar para después'}
        </button>
      </motion.div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground/60 pb-2">
        Tú decides si usarlo. Naran solo sugiere.
      </p>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm px-5 py-3 rounded-2xl shadow-xl z-50 whitespace-nowrap"
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}