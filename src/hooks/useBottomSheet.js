import { useState } from 'react';

/**
 * Hook para manejar Bottom Sheet (Drawer) en mobile
 * Retorna state y handlers para abrir/cerrar
 */
export function useBottomSheet() {
  const [open, setOpen] = useState(false);

  const openSheet = () => setOpen(true);
  const closeSheet = () => setOpen(false);
  const toggleSheet = () => setOpen(!open);

  return { open, openSheet, closeSheet, toggleSheet };
}