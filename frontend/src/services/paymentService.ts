import api from './api';
import type { Payment } from '../types/types';

export interface CreatePaymentData {
  session_id: number;
  amount: number;
  payment_method: 'razorpay' | 'cash' | 'card';
}

export interface RazorpayOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
}

export const paymentService = {
  createPayment: async (paymentData: CreatePaymentData): Promise<{ payment: Payment; order: RazorpayOrderResponse }> => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  processRazorpayPayment: async (paymentId: number, razorpayPaymentId: string): Promise<Payment> => {
    const response = await api.post(`/payments/${paymentId}/razorpay`, {
      razorpay_payment_id: razorpayPaymentId,
    });
    return response.data;
  },

  getPaymentHistory: async (): Promise<Payment[]> => {
    const response = await api.get('/payments/history');
    return response.data;
  },

  getPaymentById: async (paymentId: number): Promise<Payment> => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },
};
