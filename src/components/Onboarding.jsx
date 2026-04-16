import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Mic, Lock, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    icon: Heart,
    title: 'Una pausa antes de reaccionar',
    text: 'Naran es tu espacio para convertir el enfado en claridad, antes de que las palabras hagan daño.',
  },
  {
    icon: Mic,
    title: '¿Cómo funciona?',
    text: 'Habla o escribe lo que sientes. Naran te sugiere una forma más amable y efectiva de expresarlo.',
  },
  {
    icon: Lock,
    title: 'Solo para ti',
    text: 'Tus momentos se guardan únicamente en tu cuenta. Naran no juzga, solo traduce.',
  },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('naran_onboarded', '1');
      onDone();
    } else {
      setStep(s => s + 1);
    }
  };

  const slide = SLIDES[step];
  const Icon = slide.icon;

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-8 py-14">
      {/* Slides */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="flex flex-col items-center text-center gap-6"
          >
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'rgba(224,122,95,0.12)' }}>
              <Icon className="w-10 h-10" style={{ color: '#E07A5F' }} strokeWidth={1.5} />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{slide.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">{slide.text}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === step ? 20 : 6,
              height: 6,
              background: i === step ? '#E07A5F' : '#E07A5F44',
            }}
          />
        ))}
      </div>

      {/* Button */}
      <button
        onClick={handleNext}
        className="w-full h-14 rounded-2xl text-white text-base font-medium flex items-center justify-center gap-2 shadow-lg"
        style={{ background: '#E07A5F', boxShadow: '0 8px 24px rgba(224,122,95,0.25)' }}
      >
        {isLast ? 'Comenzar' : 'Siguiente'}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}