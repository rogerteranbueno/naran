import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useSpeechInput from '@/hooks/useSpeechInput';
import MicButton from '@/components/MicButton';
import MicPermissionCard from '@/components/MicPermissionCard';
import EmotionChips from '@/components/EmotionChips';
import RecentMoments from '@/components/RecentMoments';
import AnalyzingLoader from '@/components/AnalyzingLoader';
import Onboarding from '@/components/Onboarding';
import FollowUpCard from '@/components/FollowUpCard';
import MainMenu from '@/components/MainMenu';

const AGGRESSIVE_RE = /\b(eres\s+un[a]?\s+\w+)\b/i;

async function analyzeText(text, emotionLabel) {
  const emotionCtx = emotionLabel ? `El usuario siente principalmente: ${emotionLabel}. ` : '';
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `${emotionCtx}El usuario está en conflicto con su pareja y escribió: "${text}". 
Eres Naran, un asistente de comunicación basado en CNV (Comunicación No Violenta) y el Método Gottman.
Devuelve un JSON con:
- cognitive_note: una frase corta (máx 12 palabras) que describe el patrón de comunicación detectado (ej: "crítica con generalización", "inicio duro")
- reframe_message: un mensaje alternativo empático y asertivo en primera persona, listo para enviar (máx 3 frases)`,
    response_json_schema: {
      type: 'object',
      properties: {
        cognitive_note: { type: 'string' },
        reframe_message: { type: 'string' },
      },
    },
  });
  return result;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [emotionLabel, setEmotionLabel] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [followUpLog, setFollowUpLog] = useState(null);
  const [guardrailMsg, setGuardrailMsg] = useState('');

  const { transcript, isListening, startListening, stopListening, resetTranscript, supported, permissionDenied } = useSpeechInput();

  // Onboarding check
  useEffect(() => {
    if (!localStorage.getItem('naran_onboarded')) {
      setShowOnboarding(true);
    }
  }, []);

  // Sync transcript to textarea
  useEffect(() => {
    if (transcript) setText(transcript);
  }, [transcript]);

  // Load recent logs
  useEffect(() => {
    base44.entities.ConflictLog.list('-created_date', 10)
      .then(data => {
        setLogs(data);
        // Follow-up: find a log from yesterday that has no status update
        const yesterday = Date.now() - 24 * 60 * 60 * 1000;
        const candidate = data.find(l => {
          const t = new Date(l.created_date).getTime();
          return t < Date.now() && t > yesterday - 24 * 60 * 60 * 1000 && l.status === 'pending';
        });
        if (candidate) setFollowUpLog(candidate);
      })
      .catch(() => {})
      .finally(() => setLoadingLogs(false));
  }, []);

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleAnalyze = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (AGGRESSIVE_RE.test(trimmed)) {
      setGuardrailMsg('Naran detectó una frase muy intensa. Intenta describir cómo te sientes en lugar de definir a tu pareja.');
      setTimeout(() => setGuardrailMsg(''), 4000);
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeText(trimmed, emotionLabel);
      navigate('/reframe', {
        state: {
          original_text: trimmed,
          cognitive_note: result.cognitive_note,
          reframe_message: result.reframe_message,
          emotion_label: emotionLabel,
        },
      });
    } catch {
      setAnalyzing(false);
    }
  };

  if (showOnboarding) {
    return <Onboarding onDone={() => setShowOnboarding(false)} />;
  }

  if (analyzing) {
    return <AnalyzingLoader />;
  }

  return (
    <div className="flex-1 flex flex-col px-5 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Naran</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Una pausa antes de reaccionar</p>
        </div>
        <MainMenu />
      </div>

      {/* Follow-up card */}
      <AnimatePresence>
        {followUpLog && (
          <FollowUpCard log={followUpLog} onDone={() => setFollowUpLog(null)} />
        )}
      </AnimatePresence>

      {/* Mic button */}
      {supported && (
        <div className="flex flex-col items-center mb-8 gap-4">
          <MicButton isListening={isListening} onClick={handleMicToggle} />
          <p className="text-xs text-muted-foreground">
            {isListening ? 'Escuchando… toca para parar' : 'Toca para hablar'}
          </p>
        </div>
      )}

      {/* Permission warning */}
      <AnimatePresence>
        {permissionDenied && <MicPermissionCard />}
      </AnimatePresence>

      {/* Emotion chips */}
      <EmotionChips selected={emotionLabel} onSelect={setEmotionLabel} />

      {/* Text input */}
      <div className="mt-4 mb-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="O escribe aquí lo que quieres decir…"
          rows={4}
          className="w-full resize-none rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Guardrail message */}
      <AnimatePresence>
        {guardrailMsg && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs mb-3 leading-relaxed px-1"
            style={{ color: '#E07A5F' }}
          >
            {guardrailMsg}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Analyze button */}
      <motion.button
        onClick={handleAnalyze}
        disabled={!text.trim() || analyzing}
        whileTap={{ scale: 0.97 }}
        className="w-full h-14 rounded-2xl text-white text-base font-medium flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-40 mt-1"
        style={{ background: '#E07A5F', boxShadow: '0 8px 24px rgba(224,122,95,0.25)' }}
      >
        {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reencuadrar mensaje'}
      </motion.button>

      {/* Recent moments */}
      {loadingLogs ? (
        <div className="flex justify-center mt-8">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <RecentMoments logs={logs} />
      )}
    </div>
  );
}