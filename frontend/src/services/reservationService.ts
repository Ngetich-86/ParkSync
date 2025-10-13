import api from './api';
import type { Reservation } from '../types/types';

export interface CreateReservationData {
  vehicle_id: number;
  slot_id: number;
  start_time: string;
  end_time: string;
}

export const reservationService = {
  getReservations: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations');
    // Handle paginated response and map to frontend shape
    const items = Array.isArray(response.data) ? response.data : response.data.data || [];
    return items.map((raw: any): Reservation => ({
      reservation_id: raw.reservationId,
      user_id: raw.userId ?? 0,
      vehicle_id: raw.vehicleId,
      slot_id: raw.parkingSlotId ?? raw.slotId,
      start_time: raw.startTime,
      end_time: raw.endTime,
      status: (raw.status || 'active').toString().toLowerCase(),
      created_at: raw.createdAt,
      updated_at: raw.updatedAt,
    }));
  },

  createReservation: async (reservationData: CreateReservationData): Promise<Reservation> => {
    const response = await api.post('/reservations', reservationData);
    const raw = response.data;
    return {
      reservation_id: raw.reservationId,
      user_id: raw.userId ?? 0,
      vehicle_id: raw.vehicleId,
      slot_id: raw.parkingSlotId ?? raw.slotId,
      start_time: raw.startTime,
      end_time: raw.endTime,
      status: (raw.status || 'active').toString().toLowerCase(),
      created_at: raw.createdAt,
      updated_at: raw.updatedAt,
    } as Reservation;
  },

  cancelReservation: async (reservationId: number): Promise<Reservation> => {
    const response = await api.put(`/reservations/${reservationId}/cancel`);
    const raw = response.data;
    return {
      reservation_id: raw.reservationId,
      user_id: raw.userId ?? 0,
      vehicle_id: raw.vehicleId,
      slot_id: raw.parkingSlotId ?? raw.slotId,
      start_time: raw.startTime,
      end_time: raw.endTime,
      status: (raw.status || 'active').toString().toLowerCase(),
      created_at: raw.createdAt,
      updated_at: raw.updatedAt,
    } as Reservation;
  },

  getReservationById: async (reservationId: number): Promise<Reservation> => {
    const response = await api.get(`/reservations/${reservationId}`);
    const raw = response.data;
    return {
      reservation_id: raw.reservationId,
      user_id: raw.userId ?? 0,
      vehicle_id: raw.vehicleId,
      slot_id: raw.parkingSlotId ?? raw.slotId,
      start_time: raw.startTime,
      end_time: raw.endTime,
      status: (raw.status || 'active').toString().toLowerCase(),
      created_at: raw.createdAt,
      updated_at: raw.updatedAt,
    } as Reservation;
  },
};
