import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const EXAMPLE = 'Odio que dejes los calcetines tirados';

export default function Onboarding({ onDone }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [reframe, setReframe] = useState(null);

  const handleTransform = async () => {
    const trimmed = text.trim() || EXAMPLE;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `El usuario escribió: "${trimmed}". 
Eres Naran, un asistente de comunicación basado en CNV.
Reescribe el mensaje de forma empática y asertiva en primera persona (máx 2 frases). Solo devuelve el mensaje reescrito, sin explicaciones.`,
    });
    setReframe(typeof result === 'string' ? result : result?.reframe_message || result);
    setLoading(false);
  };

  const handleDone = () => {
    localStorage.setItem('naran_onboarded', '1');
    onDone();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 min-h-screen"
      style={{ background: 'radial-gradient(ellipse at center, rgba(224,122,95,0.15) 0%, #FDFBF7 70%)', paddingTop: 'max(4rem, env(safe-area-inset-top))', paddingBottom: '4rem' }}>

      <AnimatePresence mode="wait">
        {!reframe ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm flex flex-col items-center gap-8"
          >
            <div className="text-center">
              <p className="text-3xl mb-3">🍊</p>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight leading-snug">
                Escribe lo que sientes ahora mismo.
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Sin filtros. Como lo dirías de verdad.</p>
            </div>

            <div className="w-full">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`"${EXAMPLE}"`}
                rows={3}
                className="w-full resize-none rounded-2xl border border-border bg-white/80 backdrop-blur-sm px-4 py-3 text-foreground text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40 shadow-sm"
              />
            </div>

            <button
              onClick={handleTransform}
              disabled={loading}
              className="w-full h-14 rounded-2xl text-white text-base font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 touch-none select-none"
              style={{ background: '#E07A5F', boxShadow: '0 8px 24px rgba(224,122,95,0.35)' }}
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Transformando…</>
                : 'Ver la transformación →'
              }
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm flex flex-col items-center gap-8"
          >
            <div className="text-center">
              <p className="text-3xl mb-3">✨</p>
              <h2 className="text-xl font-semibold text-foreground tracking-tight">Así suena con Naran</h2>
            </div>

            {/* Original crossed out */}
            <div className="w-full rounded-2xl px-4 py-3 bg-secondary border border-border">
              <p className="text-sm text-muted-foreground line-through leading-relaxed">
                "{text.trim() || EXAMPLE}"
              </p>
            </div>

            {/* Reframed */}
            <div className="w-full rounded-2xl px-5 py-5 border border-primary/20"
              style={{ background: 'rgba(224,122,95,0.10)' }}>
              <p className="text-lg text-foreground leading-relaxed tracking-wide">{reframe}</p>
            </div>

            <button
              onClick={handleDone}
              className="w-full h-14 rounded-2xl text-white text-base font-medium transition-all touch-none select-none"
              style={{ background: '#E07A5F', boxShadow: '0 8px 24px rgba(224,122,95,0.35)' }}
            >
              Entendido. Quiero esto en mi vida.
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}