import { useState } from 'react';
import SelectBottomSheet from '@/components/SelectBottomSheet';

/**
 * Example: Using SelectBottomSheet for mobile-native select experience
 * 
 * Replace traditional <Select> with SelectBottomSheet for:
 * - iOS-style Action Sheet feel
 * - Better mobile UX with bottom drawer
 * - Touch-optimized controls
 */
export default function SelectBottomSheetExample() {
  const [priority, setPriority] = useState('medium');

  const priorityOptions = [
    { label: 'Baja', value: 'low' },
    { label: 'Media', value: 'medium' },
    { label: 'Alta', value: 'high' },
  ];

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Prioridad</label>
      
      {/* Old way (desktop-style) */}
      {/* <Select value={priority} onValueChange={setPriority}> ... */}

      {/* New way (mobile-native bottom sheet) */}
      <SelectBottomSheet
        label="Seleccionar prioridad"
        value={priority}
        options={priorityOptions}
        onChange={setPriority}
        variant="outline"
      />

      <p className="text-xs text-muted-foreground">
        Seleccionado: <strong>{priorityOptions.find(o => o.value === priority)?.label}</strong>
      </p>
    </div>
  );
}

/**
 * Integration notes:
 * - SelectBottomSheet uses vaul's Drawer for native feel
 * - Automatically handles touch, keyboard, and desktop interactions
 * - Works with all screen sizes
 * - Persists within tab stack on mobile
 */