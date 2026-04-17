import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TestimonialPrompt({ onDismiss }) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const user = await base44.auth.me().catch(() => null);
    await base44.entities.Testimonial.create({
      user_id: user?.id || '',
      content: text.trim().slice(0, 200),
      applause_count: 0,
      is_approved: false,
    });
    setSubmitted(true);
    setTimeout(() => onDismiss?.(), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="mt-4 rounded-2xl border px-4 py-4"
      style={{ background: 'rgba(224,122,95,0.05)', borderColor: 'rgba(224,122,95,0.20)' }}
    >
      {!submitted ? (
        <>
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-semibold text-foreground">¿Te ayudó este reframe?</p>
            <button onClick={onDismiss} className="text-muted-foreground/50 hover:text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">Comparte una frase anónima para inspirar a otros.</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, 200))}
            placeholder="Ej: Me ayudó a ver que en realidad necesitaba ser escuchado…"
            rows={2}
            className="w-full resize-none text-xs rounded-xl border border-border/60 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground/40">{text.length}/200</span>
            <button
              disabled={!text.trim() || submitting}
              onClick={submit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white disabled:opacity-40"
              style={{ background: '#E07A5F' }}>
              <Send className="w-3 h-3" />
              Publicar anónimamente
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-2 space-y-1">
          <p className="text-lg">🙌</p>
          <p className="text-xs font-medium text-foreground">¡Gracias! Tu historia puede inspirar a alguien hoy.</p>
        </div>
      )}
    </motion.div>
  );
}