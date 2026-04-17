import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

function getPillText(cognitiveNote = '') {
  const n = cognitiveNote.toLowerCase();
  if (n.includes('generalización') || n.includes('siempre') || n.includes('nunca'))
    return 'Evitar "siempre/nunca" reduce la actitud defensiva de tu pareja hasta un 70%.';
  if (n.includes('crítica') || n.includes('inicio suave'))
    return 'Un inicio suave tiene un 96% más de éxito que una queja directa (Gottman Institute).';
  if (n.includes('desprecio'))
    return 'El desprecio es el mayor predictor de ruptura. Expresar una necesidad lo contrarresta.';
  if (n.includes('evasiv') || n.includes('pausa') || n.includes('silencio'))
    return 'Pedir una pausa de 20 min permite que el sistema nervioso se regule antes de hablar.';
  if (n.includes('defensiv') || n.includes('responsabilidad'))
    return 'Asumir solo un 5% de responsabilidad abre la puerta al diálogo sin rendirse.';
  if (n.includes('ansiedad') || n.includes('miedo'))
    return 'Nombrar el miedo ("tengo miedo de perderte") activa la empatía del otro de forma inmediata.';
  return 'La CNV transforma reacciones en conexión al separar los hechos de las interpretaciones.';
}

export default function GottmanPill({ cognitiveNote }) {
  const [open, setOpen] = useState(false);
  const text = getPillText(cognitiveNote);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="mb-5 rounded-2xl border border-border overflow-hidden"
      style={{ background: '#FDFBF7' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <span className="text-lg">💡</span>
        <span className="flex-1 text-left text-xs font-medium text-foreground">¿Por qué funciona esto?</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed" style={{ color: '#6B6460' }}>
              {text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}