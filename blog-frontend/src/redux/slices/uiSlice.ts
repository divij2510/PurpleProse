import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  showAuthModal: boolean;
  authMode: 'login' | 'signup';
}

const initialState: UiState = {
  showAuthModal: false,
  authMode: 'login',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleAuthModal: (state) => {
      state.showAuthModal = !state.showAuthModal;
    },
    setAuthMode: (state, action: PayloadAction<'login' | 'signup'>) => {
      state.authMode = action.payload;
    },
    openAuthModal: (state, action: PayloadAction<'login' | 'signup'>) => {
      state.showAuthModal = true;
      state.authMode = action.payload;
    },
    closeAuthModal: (state) => {
      state.showAuthModal = false;
    },
  },
});

export const { toggleAuthModal, setAuthMode, openAuthModal, closeAuthModal } = uiSlice.actions;

export default uiSlice.reducer;