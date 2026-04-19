import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const SCENARIOS = [
  {
    id: 'dinero',
    emoji: '💰',
    title: 'Dinero',
    subtitle: 'Gastos, ahorro y decisiones económicas',
    color: 'rgba(251,191,36,0.12)',
    opening: 'Otra vez te gastaste dinero en algo que no necesitábamos. Nunca pensamos en el futuro.',
  },
  {
    id: 'familia',
    emoji: '👵',
    title: 'Familia Política',
    subtitle: 'Límites, visitas y lealtades',
    color: 'rgba(167,139,250,0.12)',
    opening: 'Tu madre opina de todo lo que hacemos. ¿Cuándo vas a poner límites?',
  },
  {
    id: 'tareas',
    emoji: '🧹',
    title: 'Tareas del Hogar',
    subtitle: 'Distribución, carga mental y expectativas',
    color: 'rgba(74,222,128,0.12)',
    opening: 'Llevo semanas haciéndolo todo yo. Es como si viviera sola.',
  },
  {
    id: 'intimidad',
    emoji: '❤️',
    title: 'Intimidad',
    subtitle: 'Conexión emocional y física',
    color: 'rgba(251,113,133,0.12)',
    opening: 'Siento que ya no me ves. Llevamos días sin conectar de verdad.',
  },
];

export default function Practica() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [coach, setCoach] = useState(null);
  const [coachOpen, setCoachOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (scenario) {
      setMessages([{ role: 'partner', text: scenario.opening }]);
      setCoach(null);
    }
  }, [scenario]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, coach]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput('');
    setCoach(null);
    setCoachOpen(false);

    const newMessages = [...messages, { role: 'user', text: trimmed }];
    setMessages(newMessages);
    setLoading(true);

    const history = newMessages.map(m => `${m.role === 'user' ? 'Usuario' : 'Pareja'}: ${m.text}`).join('\n');

    const [partnerRes, coachRes] = await Promise.all([
      base44.integrations.Core.InvokeLLM({
        prompt: `Eres la pareja de práctica en un ejercicio de CNV. Escenario: ${scenario.title} — ${scenario.subtitle}.
Historial de conversación:\n${history}
Responde al último mensaje del Usuario en 1-2 frases, de forma realista y emocional. A veces estás a la defensiva, a veces triste, a veces empiezas a abrirte. NO des consejos. Solo reacciona como una pareja real.`,
      }),
      base44.integrations.Core.InvokeLLM({
        prompt: `Eres un entrenador experto en Comunicación No Violenta (CNV) y método Gottman.
El usuario acaba de decir en una práctica de pareja: "${trimmed}"
Evalúa brevemente si usó Observación, Sentimiento, Necesidad o Petición (los 4 componentes de CNV).
Da UN solo consejo alentador y práctico en 1-2 frases. Sé cálido y específico. Empieza con lo positivo.`,
      }),
    ]);

    const partnerText = typeof partnerRes === 'string' ? partnerRes : partnerRes?.response || '…';
    const coachText = typeof coachRes === 'string' ? coachRes : coachRes?.response || '…';

    setMessages(prev => [...prev, { role: 'partner', text: partnerText }]);
    setCoach(coachText);
    setCoachOpen(true);
    setLoading(false);
  };

  if (!scenario) {
    return (
      <div className="flex-1 flex flex-col"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(224,122,95,0.10) 0%, #FDFBF7 65%)' }}>
        <div className="h-4" />

        <div className="flex-1 px-5 pb-10 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Práctica Guiada</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Entrena tu CNV antes de la próxima conversación difícil. Elige un escenario.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {SCENARIOS.map((s, i) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setScenario(s)}
                className="flex flex-col items-start gap-2 rounded-3xl px-4 py-5 border border-border/40 bg-white shadow-sm hover:shadow-md transition-all text-left"
                style={{ background: s.color }}
              >
                <span className="text-3xl">{s.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5">{s.subtitle}</p>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 rounded-2xl px-4 py-4 border border-primary/15"
            style={{ background: 'rgba(224,122,95,0.06)' }}
          >
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">¿Cómo funciona?</span> La IA simula a tu pareja de forma realista. Tú respondes aplicando CNV. El Entrenador te da feedback después de cada turno.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-10 pb-4 border-b border-border/40">
        <button onClick={() => setScenario(null)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-lg">{scenario.emoji}</span>
        <div>
          <p className="text-sm font-semibold text-foreground">{scenario.title}</p>
          <p className="text-xs text-muted-foreground">Práctica de CNV</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'text-white rounded-br-sm'
                  : 'text-foreground rounded-bl-sm border border-border/40'
              }`}
              style={msg.role === 'user'
                ? { background: '#E07A5F' }
                : { background: '#F3F1EB' }
              }
            >
              {msg.role === 'partner' && (
                <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Pareja</p>
              )}
              {msg.text}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm px-4 py-3 border border-border/40" style={{ background: '#F3F1EB' }}>
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
          </div>
        )}

        {/* Coach feedback */}
        <AnimatePresence>
          {coach && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-primary/20 overflow-hidden"
              style={{ background: 'rgba(224,122,95,0.07)' }}
            >
              <button
                onClick={() => setCoachOpen(o => !o)}
                className="w-full flex items-center gap-2 px-4 py-3"
              >
                <span className="text-sm">✨</span>
                <p className="text-xs font-semibold text-primary flex-1 text-left">Consejo del Entrenador</p>
                {coachOpen ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />}
              </button>
              <AnimatePresence>
                {coachOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-foreground/80 leading-relaxed">{coach}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/40 bg-white/80 backdrop-blur-sm px-4 py-3 pb-6">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Responde aplicando CNV…"
            rows={2}
            className="flex-1 resize-none rounded-2xl border border-border/60 bg-background px-4 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 disabled:opacity-40 transition-all"
            style={{ background: '#E07A5F' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}