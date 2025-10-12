import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Reservation } from '../../types/types';

interface ReservationState {
  reservations: Reservation[];
  currentReservation: Reservation | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReservationState = {
  reservations: [],
  currentReservation: null,
  loading: false,
  error: null,
};

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    fetchReservationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchReservationsSuccess: (state, action: PayloadAction<Reservation[]>) => {
      state.loading = false;
      state.reservations = action.payload;
      state.error = null;
    },
    fetchReservationsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createReservationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createReservationSuccess: (state, action: PayloadAction<Reservation>) => {
      state.loading = false;
      state.reservations.push(action.payload);
      state.error = null;
    },
    createReservationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    cancelReservationStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    cancelReservationSuccess: (state, action: PayloadAction<number>) => {
      state.loading = false;
      const index = state.reservations.findIndex(r => r.reservation_id === action.payload);
      if (index !== -1) {
        state.reservations[index].status = 'cancelled';
      }
      state.error = null;
    },
    cancelReservationFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentReservation: (state, action: PayloadAction<Reservation | null>) => {
      state.currentReservation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchReservationsStart,
  fetchReservationsSuccess,
  fetchReservationsFailure,
  createReservationStart,
  createReservationSuccess,
  createReservationFailure,
  cancelReservationStart,
  cancelReservationSuccess,
  cancelReservationFailure,
  setCurrentReservation,
  clearError,
} = reservationSlice.actions;

export default reservationSlice.reducer;
