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
    return response.data;
  },

  createReservation: async (reservationData: CreateReservationData): Promise<Reservation> => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },

  cancelReservation: async (reservationId: number): Promise<Reservation> => {
    const response = await api.put(`/reservations/${reservationId}/cancel`);
    return response.data;
  },

  getReservationById: async (reservationId: number): Promise<Reservation> => {
    const response = await api.get(`/reservations/${reservationId}`);
    return response.data;
  },
};
