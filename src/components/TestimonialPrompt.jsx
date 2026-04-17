import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TestimonialPrompt() {
  const [open, setOpen] = useState(false);
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
    setSubmitting(false);
  };

  return (
    <div className="border-t border-border/30 pt-4 mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors mx-auto"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        ¿Te ayudó este reframe? Comparte tu experiencia
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              {!submitted ? (
                <>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                    Comparte una frase anónima para inspirar a otros.
                  </p>
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
                      style={{ background: '#E07A5F' }}
                    >
                      <Send className="w-3 h-3" />
                      Publicar anónimamente
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-3 space-y-1">
                  <p className="text-lg">🙌</p>
                  <p className="text-xs font-medium text-foreground">¡Gracias! Tu historia puede inspirar a alguien hoy.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}