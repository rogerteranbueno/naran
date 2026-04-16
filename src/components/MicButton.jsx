import { Mic, StopCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MicButton({ isListening, onClick, disabled }) {
  return (
    <div className="relative flex items-center justify-center">
      {isListening && (
        <>
          <motion.div
            className="absolute rounded-full bg-primary/10"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 120, height: 120 }}
          />
          <motion.div
            className="absolute rounded-full bg-primary/5"
            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            style={{ width: 120, height: 120 }}
          />
        </>
      )}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: 0.93 }}
        animate={!isListening ? { scale: [1, 1.04, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-[120px] h-[120px] rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/30 disabled:opacity-50"
      >
        {isListening
          ? <StopCircle className="w-12 h-12 text-white" strokeWidth={1.5} />
          : <Mic className="w-12 h-12 text-white" strokeWidth={1.5} />
        }
      </motion.button>
    </div>
  );
}