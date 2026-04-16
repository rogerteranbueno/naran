import { motion } from 'framer-motion';

export default function AnalyzingLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="text-5xl select-none"
      >
        🍊
      </motion.div>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">Naran está escuchando…</p>
        <p className="text-sm text-muted-foreground">Un momento de pausa para una mejor conexión.</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay }}
          />
        ))}
      </div>
    </div>
  );
}