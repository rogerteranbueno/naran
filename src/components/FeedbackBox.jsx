import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = [
  { key: 'mejora', label: '✨ Mejora' },
  { key: 'idea', label: '💡 Idea' },
  { key: 'error', label: '🐛 Error' },
  { key: 'otro', label: '💬 Otro' },
];

export default function FeedbackBox() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('mejora');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    const user = await base44.auth.me().catch(() => null);
    await base44.entities.Feedback.create({
      user_email: user?.email || '',
      message: message.trim(),
      category,
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="rounded-3xl border border-border/60 overflow-hidden" style={{ background: '#FDFBF7' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📬</span>
          <div>
            <p className="text-sm font-semibold text-foreground">Sugerir una mejora</p>
            <p className="text-xs text-muted-foreground">Tu opinión hace crecer a Naran</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border/40"
          >
            <div className="px-5 py-4">
              {!submitted ? (
                <>
                  {/* Category pills */}
                  <div className="flex gap-2 flex-wrap mb-3">
                    {CATEGORIES.map(c => (
                      <button
                        key={c.key}
                        onClick={() => setCategory(c.key)}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                        style={category === c.key
                          ? { background: '#E07A5F', color: '#fff' }
                          : { background: 'rgba(0,0,0,0.05)', color: '#666' }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, 500))}
                    placeholder="¿Qué mejorarías o qué echás en falta?"
                    rows={3}
                    className="w-full resize-none text-sm rounded-2xl border border-border/60 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
                  />

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground/40">{message.length}/500</span>
                    <button
                      disabled={!message.trim() || submitting}
                      onClick={submit}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white disabled:opacity-40 transition-all"
                      style={{ background: '#E07A5F' }}
                    >
                      <Send className="w-3 h-3" />
                      {submitting ? 'Enviando…' : 'Enviar'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-1">
                  <p className="text-2xl">🙏</p>
                  <p className="text-sm font-medium text-foreground">¡Gracias! Tu sugerencia fue registrada.</p>
                  <p className="text-xs text-muted-foreground">El equipo de Naran la leerá con atención.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}