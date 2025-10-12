export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  vehicle_id: number;
  user_id: number;
  license_plate: string;
  make: string;
  model: string;
  color: string;
  vehicle_type: 'car' | 'motorcycle' | 'truck';
  created_at: string;
  updated_at: string;
}

export interface ParkingSlot {
  slot_id: number;
  floor_id: number;
  slot_number: string;
  slot_type: 'public' | 'reserved';
  status: 'available' | 'occupied' | 'maintenance';
  hourly_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Floor {
  floor_id: number;
  floor_number: number;
  total_slots: number;
  available_slots: number;
  created_at: string;
  updated_at: string;
}

export interface ParkingSession {
  session_id: number;
  user_id: number;
  vehicle_id: number;
  slot_id: number;
  entry_time: string;
  exit_time?: string;
  total_duration?: number; // in minutes
  total_fee?: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  reservation_id: number;
  user_id: number;
  vehicle_id: number;
  slot_id: number;
  start_time: string;
  end_time: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Payment {
  payment_id: number;
  session_id: number;
  amount: number;
  payment_method: 'razorpay' | 'cash' | 'card';
  payment_status: 'pending' | 'completed' | 'failed';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}