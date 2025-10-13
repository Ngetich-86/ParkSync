import api from './api';
import type { ParkingSlot, Floor } from '../types/types';

// Map backend ParkingSlot (camelCase + booleans) to frontend shape
const mapSlot = (raw: any): ParkingSlot => {
  const status: 'available' | 'occupied' | 'maintenance' = raw.isMaintenance
    ? 'maintenance'
    : raw.isOccupied
      ? 'occupied'
      : 'available';

  return {
    slot_id: raw.parkingSlotId,
    floor_id: raw.floorId,
    slot_number: raw.slotNumber,
    // Frontend expects 'public' | 'reserved'
    slot_type: (raw.reservationType || 'PUBLIC').toLowerCase(),
    status,
    // Backend doesn't expose hourly rate in entity shown; default to 0 if absent
    hourly_rate: raw.hourlyRate ?? 0,
    created_at: raw.createdAt,
    updated_at: raw.updatedAt,
  } as ParkingSlot;
};

export const slotService = {
  getSlots: async (): Promise<ParkingSlot[]> => {
    const response = await api.get('/parking-slots');
    const items = Array.isArray(response.data) ? response.data : response.data.data || [];
    return items.map(mapSlot);
  },

  getFloors: async (): Promise<Floor[]> => {
    const response = await api.get('/floors');
    return response.data;
  },

  getAvailableSlots: async (): Promise<ParkingSlot[]> => {
    const response = await api.get('/parking-slots/available');
    const items = Array.isArray(response.data) ? response.data : response.data.data || [];
    return items.map(mapSlot);
  },

  getSlotsByFloor: async (floorId: number): Promise<ParkingSlot[]> => {
    const response = await api.get(`/parking-slots/floor/${floorId}`);
    const items = Array.isArray(response.data) ? response.data : response.data.data || [];
    return items.map(mapSlot);
  },
};
