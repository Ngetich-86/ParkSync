import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Vehicle } from '../../types/types';

interface VehicleState {
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
}

const initialState: VehicleState = {
  vehicles: [],
  currentVehicle: null,
  loading: false,
  error: null,
};

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    fetchVehiclesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVehiclesSuccess: (state, action: PayloadAction<Vehicle[]>) => {
      state.loading = false;
      state.vehicles = action.payload;
      state.error = null;
    },
    fetchVehiclesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addVehicleStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addVehicleSuccess: (state, action: PayloadAction<Vehicle>) => {
      state.loading = false;
      state.vehicles.push(action.payload);
      state.error = null;
    },
    addVehicleFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.currentVehicle = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchVehiclesStart,
  fetchVehiclesSuccess,
  fetchVehiclesFailure,
  addVehicleStart,
  addVehicleSuccess,
  addVehicleFailure,
  setCurrentVehicle,
  clearError,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
