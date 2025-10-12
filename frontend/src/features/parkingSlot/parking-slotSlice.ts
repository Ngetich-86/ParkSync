import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ParkingSlot, Floor } from '../../types/types';

interface SlotState {
  slots: ParkingSlot[];
  floors: Floor[];
  availableSlots: ParkingSlot[];
  loading: boolean;
  error: string | null;
}

const initialState: SlotState = {
  slots: [],
  floors: [],
  availableSlots: [],
  loading: false,
  error: null,
};

const slotSlice = createSlice({
  name: 'slot',
  initialState,
  reducers: {
    fetchSlotsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSlotsSuccess: (state, action: PayloadAction<ParkingSlot[]>) => {
      state.loading = false;
      state.slots = action.payload;
      state.availableSlots = action.payload.filter(slot => slot.status === 'available');
      state.error = null;
    },
    fetchSlotsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchFloorsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFloorsSuccess: (state, action: PayloadAction<Floor[]>) => {
      state.loading = false;
      state.floors = action.payload;
      state.error = null;
    },
    fetchFloorsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateSlotStatus: (state, action: PayloadAction<{ slotId: number; status: 'available' | 'occupied' | 'maintenance' }>) => {
      const slot = state.slots.find(s => s.slot_id === action.payload.slotId);
      if (slot) {
        slot.status = action.payload.status;
        state.availableSlots = state.slots.filter(s => s.status === 'available');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchSlotsStart,
  fetchSlotsSuccess,
  fetchSlotsFailure,
  fetchFloorsStart,
  fetchFloorsSuccess,
  fetchFloorsFailure,
  updateSlotStatus,
  clearError,
} = slotSlice.actions;

export default slotSlice.reducer;
