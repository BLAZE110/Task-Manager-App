import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('taskflow-theme') || 'midnight',
  setTheme: (theme) => {
    localStorage.setItem('taskflow-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
}));
