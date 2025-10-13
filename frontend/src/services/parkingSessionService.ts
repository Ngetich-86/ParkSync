import api from './api';
import type { ParkingSession } from '../types/types';

export interface StartSessionData {
  vehicle_id: number;
  slot_id: number;
  entry_time?: string;
}

const mapSession = (raw: any): ParkingSession => ({
  session_id: raw.id,
  user_id: raw.userId ?? 0,
  vehicle_id: raw.vehicleId,
  slot_id: raw.slotId,
  entry_time: raw.entryTime,
  exit_time: raw.exitTime,
  total_duration: raw.duration,
  total_fee: raw.amountPaid,
  status: raw.exitTime ? 'completed' : 'active',
  created_at: raw.createdAt,
  updated_at: raw.updatedAt,
});

export const parkingSessionService = {
  startSession: async (sessionData: StartSessionData): Promise<ParkingSession> => {
    const payload = {
      vehicleId: sessionData.vehicle_id,
      slotId: sessionData.slot_id,
      entryTime: sessionData.entry_time,
    };
    const response = await api.post('/parking-sessions', payload);
    return mapSession(response.data);
  },

  endSession: async (sessionId: string, exitTime?: string): Promise<ParkingSession> => {
    const response = await api.post(`/parking-sessions/${sessionId}/checkout`, { exitTime });
    return mapSession(response.data);
  },

  getCurrentSession: async (): Promise<ParkingSession | null> => {
    // Backend exposes /parking-sessions/active; pick the first as current
    const response = await api.get('/parking-sessions/active');
    const items = Array.isArray(response.data) ? response.data : response.data?.data || [];
    if (!items.length) return null;
    return mapSession(items[0]);
  },

  getSessionHistory: async (): Promise<ParkingSession[]> => {
    const response = await api.get('/parking-sessions');
    const items = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return items.map(mapSession);
  },

  getSessionById: async (sessionId: string): Promise<ParkingSession> => {
    const response = await api.get(`/parking-sessions/${sessionId}`);
    return mapSession(response.data);
  },
};
