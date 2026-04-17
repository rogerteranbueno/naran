import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const OPTIONS = [
  { key: 'resolved',  emoji: '👍', label: 'Bien, nos conectó.' },
  { key: 'neutral',   emoji: '👎', label: 'Regular, no cambió mucho.' },
  { key: 'escalated', emoji: '💔', label: 'Mal, escaló.' },
];

const RESPONSES = {
  resolved:  '¡Qué bien! Sigue cultivando esos momentos. Cada vez que lo intentas, construyes confianza.',
  neutral:   'A veces lleva tiempo. Lo importante es que lo intentaste. Eso ya es un acto de amor.',
  escalated: 'Lo siento. A veces el otro también necesita su propio proceso. Prueba decir: "Quiero entenderte, ¿podemos intentarlo de nuevo cuando estés listo/a?"',
};

export default function FollowUpCard({ log, onDone }) {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (option) => {
    setSaving(true);
    setSelected(option.key);
    const status = option.key === 'neutral' ? 'pending' : option.key;
    await base44.entities.ConflictLog.update(log.id, { status }).catch(() => {});
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border border-border px-4 py-4"
      style={{ background: '#FDFBF7', borderColor: 'rgba(224,122,95,0.25)' }}
    >
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm font-medium text-foreground mb-1">Un momento de ayer</p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Trabajaste en un momento difícil. ¿Cómo terminó la conversación?
            </p>
            <div className="flex flex-col gap-2">
              {OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  disabled={saving}
                  onClick={() => handleSelect(opt)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2.5 text-left hover:bg-secondary/40 transition-colors"
                >
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="text-sm text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="response" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
            <p className="text-sm text-foreground leading-relaxed">{RESPONSES[selected]}</p>
            <button
              onClick={onDone}
              className="text-xs text-muted-foreground underline underline-offset-2 text-right"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}