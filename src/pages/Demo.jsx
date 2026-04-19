import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookmarkPlus, Share2, Check, Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Demo scenarios the user can pick
const SCENARIOS = [
  {
    id: 1,
    emoji: '😤',
    label: 'Calcetines tirados',
    text: 'Odio que siempre dejes los calcetines tirados, eres un desastre.',
    cognitive_note: 'Crítica + generalización ("siempre")',
    reframe: 'Cuando encuentro ropa tirada me siento agotada porque necesito que compartamos el orden del hogar. ¿Podemos acordar un lugar para dejarlos?',
  },
  {
    id: 2,
    emoji: '😔',
    label: 'Me ignoraste',
    text: 'Me ignoraste toda la noche como si no existiera.',
    cognitive_note: 'Inicio duro — asume intención negativa',
    reframe: 'Esta noche sentí que no me veías y me dolió. Necesito momentos de conexión contigo. ¿Podemos hablar?',
  },
  {
    id: 3,
    emoji: '😰',
    label: 'Siempre lo mismo',
    text: 'Siempre pasa lo mismo, nunca cambias.',
    cognitive_note: 'Generalización + defensividad anticipada',
    reframe: 'Cuando este patrón se repite me siento sin esperanza. Necesito saber que podemos hacer algo diferente juntos.',
  },
];

const STEPS = ['elegir', 'reframe', 'resultado'];

export default function Demo() {
  const navigate = useNavigate();
  const [step, setStep] = useState('elegir');
  const [selected, setSelected] = useState(null);
  const [customText, setCustomText] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [reframeText, setReframeText] = useState('');
  const [cognitiveNote, setCognitiveNote] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSelectScenario = async (scenario) => {
    setSelected(scenario);
    setAnalyzing(true);
    setStep('analyzing');

    // Use real AI for the reframe
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `El usuario está en conflicto con su pareja y escribió: "${scenario.text}". 
Eres Naran, un asistente de comunicación basado en CNV y el Método Gottman.
Devuelve un JSON con:
- cognitive_note: frase corta (máx 12 palabras) del patrón detectado
- reframe_message: mensaje alternativo empático en primera persona, listo para enviar (máx 3 frases)`,
        response_json_schema: {
          type: 'object',
          properties: {
            cognitive_note: { type: 'string' },
            reframe_message: { type: 'string' },
          },
        },
      });
      setCognitiveNote(result.cognitive_note || scenario.cognitive_note);
      setReframeText(result.reframe_message || scenario.reframe);
    } catch {
      setCognitiveNote(scenario.cognitive_note);
      setReframeText(scenario.reframe);
    }

    setAnalyzing(false);
    setStep('reframe');
  };

  const handleCustomSubmit = async () => {
    if (!customText.trim()) return;
    const fakeScenario = { text: customText.trim(), emoji: '💭', label: 'Tu mensaje', cognitive_note: '', reframe: '' };
    setSelected(fakeScenario);
    setAnalyzing(true);
    setStep('analyzing');

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `El usuario está en conflicto con su pareja y escribió: "${customText.trim()}". 
Eres Naran, un asistente de comunicación basado en CNV y el Método Gottman.
Devuelve un JSON con:
- cognitive_note: frase corta (máx 12 palabras) del patrón detectado
- reframe_message: mensaje alternativo empático en primera persona, listo para enviar (máx 3 frases)`,
        response_json_schema: {
          type: 'object',
          properties: {
            cognitive_note: { type: 'string' },
            reframe_message: { type: 'string' },
          },
        },
      });
      setCognitiveNote(result.cognitive_note);
      setReframeText(result.reframe_message);
    } catch {
      setCognitiveNote('Patrón de comunicación reactivo detectado');
      setReframeText('Cuando esto sucede siento... Necesito... ¿Podríamos...');
    }

    setAnalyzing(false);
    setStep('reframe');
  };

  const handleRegister = () => {
    base44.auth.redirectToLogin('/home');
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(224,122,95,0.12) 0%, #FDFBF7 70%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <button
          onClick={() => step === 'elegir' ? navigate('/') : setStep('elegir')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>
        <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(224,122,95,0.12)', color: '#E07A5F' }}>
          ✨ Modo demo
        </span>
      </div>

      <AnimatePresence mode="wait">

        {/* STEP: elegir escenario */}
        {step === 'elegir' && (
          <motion.div
            key="elegir"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex-1 flex flex-col px-5 pb-8 overflow-y-auto"
          >
            <div className="text-center mb-8">
              <p className="text-3xl mb-3">🍊</p>
              <h1 className="text-xl font-semibold text-foreground mb-2">Prueba Naran ahora</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Elige un escenario real o escribe el tuyo. Naran lo transformará en un mensaje de conexión.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {SCENARIOS.map((s) => (
                <motion.button
                  key={s.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectScenario(s)}
                  className="w-full text-left rounded-2xl border border-border/60 bg-white px-4 py-4 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{s.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">{s.label}</p>
                      <p className="text-xs text-muted-foreground italic leading-relaxed">"{s.text}"</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5 ml-auto" />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Custom input */}
            <div className="mb-6">
              {!showCustom ? (
                <button
                  onClick={() => setShowCustom(true)}
                  className="flex items-center gap-2 mx-auto text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Escribir mi propio mensaje
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <textarea
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    placeholder="Escribe exactamente lo que quisieras decir…"
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40 shadow-sm"
                    autoFocus
                  />
                  {customText.trim() && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleCustomSubmit}
                      className="mt-3 w-full h-12 rounded-2xl text-white text-sm font-medium shadow-md transition-all"
                      style={{ background: '#E07A5F', boxShadow: '0 6px 20px rgba(224,122,95,0.3)' }}
                    >
                      Transformar mensaje →
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>

            {/* CTA registro */}
            <div className="rounded-2xl border border-primary/20 px-4 py-4 text-center" style={{ background: 'rgba(224,122,95,0.06)' }}>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Regístrate gratis para guardar tu historial, llevar una racha y usar el modo de voz.
              </p>
              <button
                onClick={handleRegister}
                className="h-10 px-6 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: '#E07A5F' }}
              >
                Crear cuenta gratis →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP: analyzing */}
        {step === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 px-6"
          >
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
          </motion.div>
        )}

        {/* STEP: reframe resultado */}
        {step === 'reframe' && (
          <motion.div
            key="reframe"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex-1 flex flex-col px-5 pb-6 overflow-y-auto"
          >
            {/* Original tachado */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
              <p className="text-xs text-muted-foreground/60 mb-2 uppercase tracking-wide font-medium">Lo que ibas a decir</p>
              <div className="rounded-2xl px-4 py-3" style={{ background: '#F0EDE6' }}>
                <p className="text-sm text-muted-foreground/60 leading-relaxed line-through italic">"{selected?.text}"</p>
              </div>
            </motion.div>

            {/* Nota cognitiva */}
            {cognitiveNote && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-5">
                <p className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-2">Lo que hay detrás</p>
                <div className="rounded-xl px-4 py-3 border border-primary/15" style={{ background: 'rgba(224,122,95,0.08)' }}>
                  <p className="text-sm text-foreground/80 leading-relaxed">{cognitiveNote}</p>
                </div>
              </motion.div>
            )}

            {/* Reframe editable */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-6">
              <p className="text-xs text-muted-foreground/60 uppercase tracking-wide font-medium mb-3">Naran sugiere</p>
              <div className="rounded-3xl bg-white border-2 border-primary/20 shadow-sm overflow-hidden focus-within:border-primary/50 transition-colors">
                <textarea
                  value={reframeText}
                  onChange={e => setReframeText(e.target.value)}
                  rows={5}
                  className="w-full resize-none px-5 pt-6 pb-6 text-lg leading-relaxed bg-transparent focus:outline-none tracking-wide"
                  style={{ color: '#2C2C2C' }}
                />
              </div>
              <div className="mt-3 rounded-xl px-4 py-3 bg-muted/40 border border-muted/60">
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "Expresar lo que necesitas en lugar de lo que el otro hizo mal abre una puerta."
                </p>
              </div>
            </motion.div>

            {/* Acciones demo */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex gap-3 mb-6">
              <button
                onClick={() => { navigator.clipboard.writeText(reframeText).catch(() => {}); showToast('Copiado ✓'); }}
                className="flex-1 h-12 rounded-2xl border border-border/60 bg-white text-sm text-muted-foreground flex items-center justify-center gap-2 hover:bg-secondary/40 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Copiar
              </button>
              <button
                onClick={() => { showToast('Regístrate para guardar tu historial completo →'); }}
                className="flex-1 h-12 rounded-2xl border border-border/60 bg-white text-sm text-muted-foreground flex items-center justify-center gap-2 hover:bg-secondary/40 transition-colors"
              >
                <BookmarkPlus className="w-4 h-4" /> Guardar
              </button>
            </motion.div>

            {/* Comparación antes/después visual */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
              className="rounded-2xl border border-border/40 bg-white p-4 mb-6 shadow-sm">
              <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">Antes vs Después</p>
              <div className="space-y-3">
                <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <p className="text-[11px] font-medium text-red-500 mb-1">❌ Ataca / Generaliza</p>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">"{selected?.text}"</p>
                </div>
                <div className="flex justify-center">
                  <span className="text-lg">↓</span>
                </div>
                <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <p className="text-[11px] font-medium text-green-600 mb-1">✅ Conecta / Expresa</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">"{reframeText}"</p>
                </div>
              </div>
            </motion.div>

            {/* CTA registro destacado */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="rounded-2xl p-5 text-center mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(224,122,95,0.12) 0%, rgba(224,122,95,0.05) 100%)', border: '1.5px solid rgba(224,122,95,0.25)' }}>
              <p className="text-2xl mb-2">🍊</p>
              <p className="text-sm font-semibold text-foreground mb-1">¿Quieres esto en tu vida?</p>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Guarda tu historial, lleva una racha diaria, usa el modo de voz y conecta con tu pareja.
              </p>
              <button
                onClick={handleRegister}
                className="w-full h-12 rounded-2xl text-white text-sm font-semibold shadow-lg transition-all"
                style={{ background: '#E07A5F', boxShadow: '0 8px 24px rgba(224,122,95,0.35)' }}
              >
                Crear cuenta gratis →
              </button>
              <button
                onClick={() => setStep('elegir')}
                className="mt-2 w-full h-10 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Probar otro escenario
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm px-5 py-3 rounded-2xl shadow-xl z-50 whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}