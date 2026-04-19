import { useState } from 'react';
import { Drawer } from 'vaul';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * SelectBottomSheet: iOS-style Action Sheet para selecciones
 * Props:
 *   - label: Texto del botón trigger
 *   - value: Valor seleccionado actual
 *   - options: Array de {label, value}
 *   - onChange: Callback cuando se selecciona
 *   - variant: "outline" | "default" (default)
 */
export default function SelectBottomSheet({
  label,
  value,
  options = [],
  onChange,
  variant = 'default',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || label;

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          disabled={disabled}
          className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors touch-none select-none disabled:opacity-40 ${
            variant === 'outline'
              ? 'border border-border bg-white hover:bg-secondary/40'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {selectedLabel}
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-w-md mx-auto w-full">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="px-6 py-6"
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-foreground mb-4 text-center">{label}</h2>

            {/* Options */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm transition-colors hover:bg-secondary/60 active:bg-secondary"
                >
                  <span className="flex-1 text-foreground">{option.label}</span>
                  {value === option.value && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>

            {/* Cancel button */}
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full py-3 rounded-2xl text-sm text-muted-foreground hover:bg-secondary/40 transition-colors"
            >
              Cancelar
            </button>
          </motion.div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}