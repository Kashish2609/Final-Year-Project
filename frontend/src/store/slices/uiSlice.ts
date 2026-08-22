import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UIState {
  theme: 'dark' | 'light' | 'system';
  sidebarCollapsed: boolean;
  createProjectModalOpen: boolean;
  createTaskModalOpen: boolean;
  inviteMemberModalOpen: boolean;
  toasts: ToastMessage[];
}

const initialTheme = (localStorage.getItem('theme') as 'dark' | 'light' | 'system') || 'dark';

const initialState: UIState = {
  theme: initialTheme,
  sidebarCollapsed: false,
  createProjectModalOpen: false,
  createTaskModalOpen: false,
  inviteMemberModalOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'dark' | 'light' | 'system'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);

      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      if (action.payload === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(action.payload);
      }
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setCreateProjectModalOpen: (state, action: PayloadAction<boolean>) => {
      state.createProjectModalOpen = action.payload;
    },
    setCreateTaskModalOpen: (state, action: PayloadAction<boolean>) => {
      state.createTaskModalOpen = action.payload;
    },
    setInviteMemberModalOpen: (state, action: PayloadAction<boolean>) => {
      state.inviteMemberModalOpen = action.payload;
    },
    addToast: (state, action: PayloadAction<{ type: 'success' | 'error' | 'info'; message: string }>) => {
      const id = Math.random().toString(36).substring(2, 9);
      state.toasts.push({ id, ...action.payload });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setCreateProjectModalOpen,
  setCreateTaskModalOpen,
  setInviteMemberModalOpen,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
