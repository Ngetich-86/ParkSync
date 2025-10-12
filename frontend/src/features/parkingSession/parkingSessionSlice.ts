import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ParkingSession } from '../../types/types';

interface ParkingSessionState {
  currentSession: ParkingSession | null;
  sessionHistory: ParkingSession[];
  loading: boolean;
  error: string | null;
}

const initialState: ParkingSessionState = {
  currentSession: null,
  sessionHistory: [],
  loading: false,
  error: null,
};

const parkingSessionSlice = createSlice({
  name: 'parkingSession',
  initialState,
  reducers: {
    startSessionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    startSessionSuccess: (state, action: PayloadAction<ParkingSession>) => {
      state.loading = false;
      state.currentSession = action.payload;
      state.error = null;
    },
    startSessionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    endSessionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    endSessionSuccess: (state, action: PayloadAction<ParkingSession>) => {
      state.loading = false;
      if (state.currentSession?.session_id === action.payload.session_id) {
        state.currentSession = null;
      }
      state.sessionHistory.unshift(action.payload);
      state.error = null;
    },
    endSessionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchCurrentSessionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCurrentSessionSuccess: (state, action: PayloadAction<ParkingSession | null>) => {
      state.loading = false;
      state.currentSession = action.payload;
      state.error = null;
    },
    fetchCurrentSessionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchSessionHistoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSessionHistorySuccess: (state, action: PayloadAction<ParkingSession[]>) => {
      state.loading = false;
      state.sessionHistory = action.payload;
      state.error = null;
    },
    fetchSessionHistoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  startSessionStart,
  startSessionSuccess,
  startSessionFailure,
  endSessionStart,
  endSessionSuccess,
  endSessionFailure,
  fetchCurrentSessionStart,
  fetchCurrentSessionSuccess,
  fetchCurrentSessionFailure,
  fetchSessionHistoryStart,
  fetchSessionHistorySuccess,
  fetchSessionHistoryFailure,
  clearCurrentSession,
  clearError,
} = parkingSessionSlice.actions;

export default parkingSessionSlice.reducer;
