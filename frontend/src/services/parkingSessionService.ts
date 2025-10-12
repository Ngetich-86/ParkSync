import api from './api';
import type { ParkingSession } from '../types/types';

export interface StartSessionData {
  vehicle_id: number;
  slot_id?: number; // Optional for reserved slots
}

export const parkingSessionService = {
  startSession: async (sessionData: StartSessionData): Promise<ParkingSession> => {
    const response = await api.post('/parking-sessions/start', sessionData);
    return response.data;
  },

  endSession: async (sessionId: number): Promise<ParkingSession> => {
    const response = await api.post(`/parking-sessions/end/${sessionId}`);
    return response.data;
  },

  getCurrentSession: async (): Promise<ParkingSession | null> => {
    const response = await api.get('/parking-sessions/current');
    return response.data;
  },

  getSessionHistory: async (): Promise<ParkingSession[]> => {
    const response = await api.get('/parking-sessions/history');
    return response.data;
  },

  getSessionById: async (sessionId: number): Promise<ParkingSession> => {
    const response = await api.get(`/parking-sessions/${sessionId}`);
    return response.data;
  },
};
