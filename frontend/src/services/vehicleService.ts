import api from './api';
import type { Vehicle } from '../types/types';

export interface CreateVehicleData {
  license_plate: string;
  make: string;
  model: string;
  color: string;
  vehicle_type: 'car' | 'motorcycle' | 'truck';
}

export const vehicleService = {
  getVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get('/vehicles');
    return response.data;
  },

  createVehicle: async (vehicleData: CreateVehicleData): Promise<Vehicle> => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  updateVehicle: async (vehicleId: number, vehicleData: Partial<CreateVehicleData>): Promise<Vehicle> => {
    const response = await api.put(`/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (vehicleId: number): Promise<void> => {
    await api.delete(`/vehicles/${vehicleId}`);
  },
};
