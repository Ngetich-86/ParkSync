import api from './api';
import type { Vehicle } from '../types/types';

const mapVehicle = (raw: any): Vehicle => {
  const vehicleType = (raw.vehicleType || '').toString();
  const mappedType: 'car' | 'motorcycle' | 'truck' = vehicleType === 'TWO_WHEELER'
    ? 'motorcycle'
    : vehicleType === 'FOUR_WHEELER'
      ? 'car'
      : 'car';

  return {
    vehicle_id: raw.vehicleId,
    user_id: raw.userId ?? 0,
    license_plate: raw.licensePlate,
    make: raw.make ?? '',
    model: raw.model ?? '',
    color: raw.color ?? '',
    vehicle_type: mappedType,
    created_at: raw.createdAt,
    updated_at: raw.updatedAt,
  } as Vehicle;
};

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
    // Handle paginated response from backend and map to frontend shape
    const items = Array.isArray(response.data) ? response.data : response.data.data || [];
    return items.map(mapVehicle);
  },

  createVehicle: async (vehicleData: CreateVehicleData): Promise<Vehicle> => {
    // Backend expects camelCase fields: licensePlate, vehicleType
    // Map our frontend payload to backend DTO
    const mappedPayload: any = {
      licensePlate: vehicleData.license_plate,
      vehicleType: vehicleData.vehicle_type === 'car'
        ? 'FOUR_WHEELER'
        : vehicleData.vehicle_type === 'motorcycle'
          ? 'TWO_WHEELER'
          : 'FOUR_WHEELER',
    };

    const response = await api.post('/vehicles', mappedPayload);
    return mapVehicle(response.data);
  },

  updateVehicle: async (vehicleId: number, vehicleData: Partial<CreateVehicleData>): Promise<Vehicle> => {
    const response = await api.put(`/vehicles/${vehicleId}`, vehicleData);
    return mapVehicle(response.data);
  },

  deleteVehicle: async (vehicleId: number): Promise<void> => {
    await api.delete(`/vehicles/${vehicleId}`);
  },
};
