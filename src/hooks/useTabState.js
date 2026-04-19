import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Preserve scroll position when switching between tabs
 * Automatically saves scroll when leaving a tab and restores when returning
 */
export function useTabScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollContainer = document.querySelector('[data-scroll-container]');
    if (!scrollContainer) return;

    // Restore scroll from session storage
    const saved = sessionStorage.getItem(`tab_scroll_${pathname}`);
    if (saved) {
      setTimeout(() => {
        scrollContainer.scrollTop = parseInt(saved, 10);
      }, 50);
    }

    // Save scroll when component unmounts (tab switch)
    return () => {
      sessionStorage.setItem(`tab_scroll_${pathname}`, scrollContainer.scrollTop || 0);
    };
  }, [pathname]);
}