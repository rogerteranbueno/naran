import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import MicButton from '@/components/MicButton';
import AnalyzingLoader from '@/components/AnalyzingLoader';
import MicPermissionCard from '@/components/MicPermissionCard';
import RecentMoments from '@/components/RecentMoments';
import Onboarding from '@/components/Onboarding';
import EmotionSelector from '@/components/EmotionSelector';
import FollowUpCard from '@/components/FollowUpCard';
import useSpeechInput from '@/hooks/useSpeechInput';

const SYSTEM_PROMPT = `Eres 'Naran', un asistente conductual para parejas basado en el Instituto Gottman, Terapia Cognitivo-Conductual (TCC) y Comunicación No Violenta (CNV).

Tu tarea es intervenir en los primeros 60 segundos de un conflicto interno. El usuario está emocionalmente activado.

REGLAS DE ORO (NUNCA ROMPER):
1. NO validar suposiciones dañinas. Reformula el sentimiento, no el insulto.
2. NO tomar partido. Tu lealtad es a la RELACIÓN, no al usuario.
3. SIEMPRE usar la estructura: "Cuando [HECHO ESPECÍFICO], me siento [EMOCIÓN VULNERABLE], necesito [PETICIÓN POSITIVA Y ACCIONABLE]."
4. SER BREVE en el reframe_message. Menos de 200 caracteres.

DETECCIÓN DE PATRONES:
- Crítica ("Siempre/Nunca") -> Usa "Inicio Suave" (Gentle Start-Up).
- Desprecio ("Ridículo/Patético") -> Traduce a una necesidad de Aprecio/Respeto.
- Actitud Defensiva ("No es mi culpa, es que tú...") -> Ayuda a tomar un 5% de responsabilidad.
- Actitud Evasiva (input vago o monosílabos de enfado) -> Ofrece una frase de pausa segura.

GUARDRAIL: Si el texto contiene lenguaje muy agresivo o insultos directos, responde con cognitive_note: "Lenguaje de alta intensidad detectado." y reframe_message: "Necesito un momento para calmarme. Hablemos más tarde."`;

// Solo bloquea insultos DIRIGIDOS a la pareja, nunca expresiones de vulnerabilidad propia
const DIRECTED_INSULT_PATTERN = /\b(eres|es|sos)\s+(un|una)\s+(idiota|inútil|estúpid[oa]|imbécil|puta|bastard[oa]|maldita?)/i;
const HIGH_AGGRESSION_WORDS = ["puta madre", "hijo de puta", "me cago en"];

async function analyzeConflict(text) {
  const lower = text.toLowerCase();
  const isDirectedInsult = DIRECTED_INSULT_PATTERN.test(text);
  const isHighAggression = HIGH_AGGRESSION_WORDS.some(w => lower.includes(w));

  if (isDirectedInsult || isHighAggression) {
    return {
      original_text: text,
      cognitive_note: "Lenguaje de alta intensidad detectado.",
      reframe_message: "Necesito un momento para calmarme. Hablemos más tarde.",
    };
  }

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `${SYSTEM_PROMPT}\n\nTexto del usuario: "${text}"`,
    response_json_schema: {
      type: "object",
      properties: {
        cognitive_note: { type: "string" },
        reframe_message: { type: "string" },
      },
      required: ["cognitive_note", "reframe_message"],
    },
  });

  return {
    original_text: text,
    cognitive_note: result.cognitive_note,
    reframe_message: result.reframe_message,
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('naran_onboarded'));
  const [showEmotionSelector, setShowEmotionSelector] = useState(false);
  const [pendingMicAction, setPendingMicAction] = useState(false); // true = mic, false = text
  const [emotionLabel, setEmotionLabel] = useState(null);
  const [followUpLog, setFollowUpLog] = useState(null);
  const pendingTextRef = useRef(null); // texto guardado para analizar tras selección de emoción

  const { listening, transcript, error, startListening, stopListening, resetTranscript, browserSupported } = useSpeechInput();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    base44.entities.ConflictLog.list('-created_date', 5).then(logs => {
      setLogs(logs.slice(0, 3));
      // Check for pending follow-up (sent/saved > 20h ago, status still pending)
      const cutoff = Date.now() - 20 * 60 * 60 * 1000;
      const pending = logs.find(l =>
        l.status === 'pending' &&
        l.action_taken &&
        new Date(l.created_date).getTime() < cutoff
      );
      setFollowUpLog(pending || null);
    }).catch(() => {});
  }, [analyzing]);

  // Keep textarea in sync with live transcript
  useEffect(() => {
    if (listening) setText(transcript);
  }, [transcript, listening]);

  const handleMicClick = () => {
    if (listening) {
      if (navigator.vibrate) navigator.vibrate(5);
      stopListening();
      // analyze will happen after emotion selection
    } else {
      // Show emotion selector before starting mic
      setPendingMicAction(true);
      setShowEmotionSelector(true);
    }
  };

  const startMicAfterEmotion = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setText('');
    resetTranscript();
    startListening();
    setShowEmotionSelector(false);
  };

  const handleEmotionSelect = (emotion) => {
    setEmotionLabel(emotion);
    if (pendingMicAction) {
      startMicAfterEmotion();
    } else {
      setShowEmotionSelector(false);
      // Si había texto pendiente, analizar ahora con la emoción seleccionada
      if (pendingTextRef.current) {
        const txt = pendingTextRef.current;
        pendingTextRef.current = null;
        handleAnalyzeWithEmotion(txt, emotion);
      }
    }
  };

  const handleEmotionSkip = () => {
    setEmotionLabel(null);
    if (pendingMicAction) {
      startMicAfterEmotion();
    } else {
      setShowEmotionSelector(false);
      // Si había texto pendiente, analizar sin emoción
      if (pendingTextRef.current) {
        const txt = pendingTextRef.current;
        pendingTextRef.current = null;
        handleAnalyzeWithEmotion(txt, null);
      }
    }
  };

  // When mic stops with transcript, analyze
  useEffect(() => {
    if (!listening && transcript.trim() && pendingMicAction) {
      const finalText = transcript.trim();
      resetTranscript();
      setPendingMicAction(false);
      handleAnalyze(finalText);
    }
  }, [listening]);

  const handleAnalyzeWithEmotion = async (content, emotion) => {
    if (!content) return;
    setAnalyzing(true);
    const prompt = emotion
      ? `El usuario reporta sentirse: ${emotion}. Su mensaje: "${content}"`
      : content;
    const result = await analyzeConflict(prompt);
    result.emotion_label = emotion;
    navigate('/reframe', { state: result });
  };

  const handleAnalyze = async (inputText) => {
    const content = (inputText ?? text).trim();
    handleAnalyzeWithEmotion(content, emotionLabel);
  };

  const handleAnalyzeFromText = () => {
    if (!text.trim()) return;
    pendingTextRef.current = text.trim(); // guardar texto antes de mostrar selector
    setPendingMicAction(false);
    setShowEmotionSelector(true);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (showOnboarding) {
    return <Onboarding onDone={() => setShowOnboarding(false)} />;
  }

  if (showEmotionSelector) {
    return (
      <AnimatePresence mode="wait">
        <EmotionSelector
          key="emotion"
          onSelect={handleEmotionSelect}
          onSkip={handleEmotionSkip}
        />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {analyzing ? (
        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
          <AnalyzingLoader />
        </motion.div>
      ) : (
        <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col px-6 py-8">

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
          <div className="flex flex-col items-center gap-3 mb-8">
            <MicButton isListening={listening} onClick={handleMicClick} disabled={!browserSupported} />

            {/* Listening indicator */}
            {listening && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                <span className="text-sm text-primary font-medium">Escuchando</span>
                <span className="flex gap-0.5">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.span
                      key={i}
                      className="w-1 h-1 rounded-full bg-primary inline-block"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay }}
                    />
                  ))}
                </span>
              </motion.div>
            )}

            {!browserSupported && (
              <p className="text-xs text-center text-muted-foreground px-4">
                Escribe tu mensaje abajo para continuar.
              </p>
            )}
          </div>

          {/* Text input */}
          <div className="flex flex-col gap-3">
            <textarea
              value={text}
              onChange={e => !listening && setText(e.target.value)}
              placeholder="Escribe aquí lo que pasó..."
              rows={4}
              className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />

            {/* Error message / permission card */}
            {error && (
              error.includes('permiso') || error.includes('not-allowed')
                ? <MicPermissionCard />
                : <p className="text-xs px-1" style={{ color: '#E07A5F' }}>{error}</p>
            )}

            {text.trim() && !listening && (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleAnalyzeFromText}
                className="w-full h-12 rounded-2xl text-white text-sm font-medium shadow-md active:scale-95 transition-transform"
                style={{ background: '#E07A5F' }}
              >
                Analizar
              </motion.button>
            )}
          </div>

          {/* Follow-up card for pending logs */}
          {followUpLog && (
            <FollowUpCard
              log={followUpLog}
              onDone={() => setFollowUpLog(null)}
            />
          )}

          {/* Recent moments */}
          <RecentMoments logs={logs} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}