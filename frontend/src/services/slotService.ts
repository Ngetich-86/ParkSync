import api from './api';
import type { ParkingSlot, Floor } from '../types/types';

export const slotService = {
  getSlots: async (): Promise<ParkingSlot[]> => {
    const response = await api.get('/parking-slots');
    return response.data;
  },

  getFloors: async (): Promise<Floor[]> => {
    const response = await api.get('/floors');
    return response.data;
  },

  getAvailableSlots: async (): Promise<ParkingSlot[]> => {
    const response = await api.get('/parking-slots/available');
    return response.data;
  },

  getSlotsByFloor: async (floorId: number): Promise<ParkingSlot[]> => {
    const response = await api.get(`/parking-slots/floor/${floorId}`);
    return response.data;
  },
};
