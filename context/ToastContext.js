import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

/**
 * Fila simples de toasts. Um por vez: o componente avisa quando terminou
 * de sair da tela e só então o próximo entra, evitando sobreposição quando
 * várias conquistas caem de uma vez.
 */
export function ToastProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const queue = useRef([]);

  const push = useCallback((toast) => {
    setCurrent((active) => {
      if (active) {
        queue.current.push(toast);
        return active;
      }
      return toast;
    });
  }, []);

  const showAchievements = useCallback(
    (achievements) => {
      (achievements ?? []).forEach((achievement) =>
        push({
          key: `${achievement.code}-${Date.now()}`,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
        })
      );
    },
    [push]
  );

  const dismiss = useCallback(() => {
    setCurrent(queue.current.shift() ?? null);
  }, []);

  return (
    <ToastContext.Provider value={{ current, push, showAchievements, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
