import { MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MicPermissionCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-3 rounded-2xl border px-4 py-3"
      style={{ background: '#FDFBF7', borderColor: '#E07A5F33' }}
    >
      <MicOff className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#E07A5F' }} />
      <p className="text-xs leading-relaxed" style={{ color: '#E07A5F' }}>
        Naran usa el micrófono solo para transcribir tu momento. Puedes habilitarlo en ajustes o escribir tu mensaje abajo.
      </p>
    </motion.div>
  );
}