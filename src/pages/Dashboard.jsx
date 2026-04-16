import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import MicButton from '@/components/MicButton';
import AnalyzingLoader from '@/components/AnalyzingLoader';

async function analyzeConflict(text) {
  await new Promise(r => setTimeout(r, 2000));
  return {
    cognitive_note: "Estás generalizando ('siempre ignoras')",
    reframe_message: "Cuando hablo de temas importantes para mí y siento que no hay espacio, me siento invisible. Necesito que busquemos un momento para conectar sin distracciones.",
    original_text: text,
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const textareaRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // When voice recording stops and we have transcript, auto-analyze
  useEffect(() => {
    if (!listening && transcript) {
      setText(transcript);
      handleAnalyze(transcript);
      resetTranscript();
    }
  }, [listening]);

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setText('');
      SpeechRecognition.startListening({ language: 'es-ES', continuous: false });
    }
  };

  const handleAnalyze = async (inputText) => {
    const content = inputText || text;
    if (!content.trim()) return;
    setAnalyzing(true);
    const result = await analyzeConflict(content);
    navigate('/reframe', { state: result });
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <AnimatePresence mode="wait">
      {analyzing ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col"
        >
          <AnalyzingLoader />
        </motion.div>
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col px-6 py-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-muted-foreground">{greeting()}</p>
              <h1 className="text-2xl font-semibold tracking-tight">
                {user?.full_name?.split(' ')[0] || 'Hola'}
              </h1>
            </div>
            <button
              onClick={() => base44.auth.logout('/login')}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-center text-sm text-muted-foreground leading-relaxed mb-10 px-4">
            ¿Momento difícil? Escribe lo que sientes.<br />
            Naran te ayudará a transformarlo en un mensaje que conecte.
          </p>

          {/* Mic button */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <MicButton
              isListening={listening}
              onClick={handleMicClick}
              disabled={!browserSupportsSpeechRecognition || !isMicrophoneAvailable}
            />
            {listening && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-primary font-medium"
              >
                Escuchando…
              </motion.p>
            )}
            {!browserSupportsSpeechRecognition && (
              <p className="text-xs text-center text-muted-foreground px-4">
                Naran necesita acceso al micrófono para escucharte. Puedes escribir tu mensaje abajo.
              </p>
            )}
            {browserSupportsSpeechRecognition && !isMicrophoneAvailable && (
              <p className="text-xs text-center text-muted-foreground px-4">
                Naran necesita acceso al micrófono para escucharte. Puedes escribir tu mensaje abajo.
              </p>
            )}
          </div>

          {/* Live transcript preview */}
          {listening && transcript && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-center text-muted-foreground italic px-4 mb-4"
            >
              "{transcript}"
            </motion.p>
          )}

          {/* Text input */}
          <div className="flex flex-col gap-3">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="O escribe aquí lo que pasó..."
              rows={4}
              className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {text.trim() && !listening && (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleAnalyze()}
                className="w-full h-12 rounded-2xl bg-primary text-white text-sm font-medium shadow-md shadow-primary/20 active:scale-95 transition-transform"
              >
                Analizar
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}