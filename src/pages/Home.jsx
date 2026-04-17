import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Pencil, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useSpeechInput from '@/hooks/useSpeechInput';
import OrangeMicButton from '@/components/OrangeMicButton';
import MicPermissionCard from '@/components/MicPermissionCard';
import MainMenu from '@/components/MainMenu';
import Onboarding from '@/components/Onboarding';

const AGGRESSIVE_RE = /\b(eres\s+un[a]?\s+\w+)\b/i;

async function analyzeText(text) {
  return base44.integrations.Core.InvokeLLM({
    prompt: `El usuario está en conflicto con su pareja y escribió: "${text}". 
Eres Naran, un asistente de comunicación basado en CNV (Comunicación No Violenta) y el Método Gottman.
Devuelve un JSON con:
- cognitive_note: una frase corta (máx 12 palabras) que describe el patrón de comunicación detectado
- reframe_message: un mensaje alternativo empático y asertivo en primera persona, listo para enviar (máx 3 frases)`,
    response_json_schema: {
      type: 'object',
      properties: {
        cognitive_note: { type: 'string' },
        reframe_message: { type: 'string' },
      },
    },
  });
}

export default function Home() {
  const navigate = useNavigate();
  const [showText, setShowText] = useState(false);
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [guardrailMsg, setGuardrailMsg] = useState('');
  const textareaRef = useRef(null);

  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('naran_onboarded'));

  const { transcript, listening, startListening, stopListening, resetTranscript, browserSupported, error: micError } = useSpeechInput();

  if (showOnboarding) {
    return <Onboarding onDone={() => setShowOnboarding(false)} />;
  }

  // Sync speech transcript
  useEffect(() => {
    if (transcript) setText(transcript);
  }, [transcript]);

  const goToReframe = async (inputText) => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (AGGRESSIVE_RE.test(trimmed)) {
      setGuardrailMsg('Intenta describir cómo te sientes en lugar de definir a tu pareja.');
      setTimeout(() => setGuardrailMsg(''), 4000);
      return;
    }

    setAnalyzing(true);
    const result = await analyzeText(trimmed);
    navigate('/reframe', {
      state: {
        original_text: trimmed,
        cognitive_note: result.cognitive_note,
        reframe_message: result.reframe_message,
      },
    });
  };

  const handleMicRelease = () => {
    stopListening();
    setTimeout(() => {
      const current = text.trim();
      if (current) goToReframe(current);
    }, 400);
  };

  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      goToReframe(text);
    }
  };

  const handleShowText = () => {
    setShowText(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  if (analyzing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6"
        style={{ background: 'radial-gradient(ellipse at center, rgba(224,122,95,0.15) 0%, #FDFBF7 70%)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="text-6xl select-none"
        >
          🍊
        </motion.div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground tracking-wide">Naran está escuchando…</p>
          <p className="text-sm text-muted-foreground leading-relaxed">Un momento de pausa para una mejor conexión.</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(224,122,95,0.18) 0%, #FDFBF7 68%)' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <MainMenu />
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-white/70 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
        >
          <User className="w-4 h-4" />
        </button>
      </div>

      {/* Central area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">

        {/* Logo text */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-light text-muted-foreground/60 tracking-widest uppercase mb-12"
        >
          naran
        </motion.p>

        {/* Mic button */}
        {browserSupported && (
          <OrangeMicButton
            isListening={listening}
            onPressStart={() => { resetTranscript(); startListening(); }}
            onPressEnd={handleMicRelease}
          />
        )}

        {/* Listening transcript preview */}
        <AnimatePresence>
          {listening && transcript && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-sm text-center text-foreground/70 leading-relaxed max-w-[260px] italic"
            >
              "{transcript}"
            </motion.p>
          )}
        </AnimatePresence>

        {/* Hint text */}
        {!listening && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-sm text-muted-foreground/60 leading-relaxed text-center"
          >
            {browserSupported ? 'Mantén pulsado y habla' : 'Escribe lo que sientes'}
          </motion.p>
        )}

        {/* Mic permission error */}
        <AnimatePresence>
          {micError && <MicPermissionCard />}
        </AnimatePresence>

        {/* Guardrail */}
        <AnimatePresence>
          {guardrailMsg && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-xs text-center leading-relaxed px-4 max-w-[260px]"
              style={{ color: '#E07A5F' }}
            >
              {guardrailMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Write alternative */}
        <AnimatePresence>
          {!listening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 w-full max-w-sm"
            >
              {!showText ? (
                <button
                  onClick={handleShowText}
                  className="flex items-center gap-2 mx-auto text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Prefiero escribir
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleTextKeyDown}
                    placeholder="Escribe lo que sientes… (Enter para continuar)"
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-border/60 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40 shadow-sm"
                  />
                  {text.trim() && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => goToReframe(text)}
                      className="mt-3 w-full h-12 rounded-2xl text-white text-sm font-medium shadow-md transition-all"
                      style={{ background: '#E07A5F', boxShadow: '0 6px 20px rgba(224,122,95,0.3)' }}
                    >
                      Reencuadrar mensaje
                    </motion.button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}