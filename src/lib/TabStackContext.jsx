import { createContext, useContext, useState, useCallback } from 'react';

const TabStackContext = createContext();

export function TabStackProvider({ children }) {
  // Store scroll positions per tab
  const [scrollMap, setScrollMap] = useState({});

  const saveScroll = useCallback((tabPath, scrollTop) => {
    setScrollMap(prev => ({
      ...prev,
      [tabPath]: scrollTop,
    }));
    // Also persist to sessionStorage as fallback
    sessionStorage.setItem(`tab_scroll_${tabPath}`, scrollTop);
  }, []);

  const getScroll = useCallback((tabPath) => {
    return scrollMap[tabPath] || parseInt(sessionStorage.getItem(`tab_scroll_${tabPath}`), 10) || 0;
  }, [scrollMap]);

  return (
    <TabStackContext.Provider value={{ saveScroll, getScroll, scrollMap }}>
      {children}
    </TabStackContext.Provider>
  );
}

export function useTabStack() {
  const context = useContext(TabStackContext);
  if (!context) {
    throw new Error('useTabStack must be used within TabStackProvider');
  }
  return context;
}