import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  modalOpen: null,
  openModal: (name) => set({ modalOpen: name }),
  closeModal: () => set({ modalOpen: null }),

  filters: {},
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
}));

export default useUIStore;
