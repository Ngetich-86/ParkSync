import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Payment } from '../../types/types';

interface PaymentState {
  currentPayment: Payment | null;
  paymentHistory: Payment[];
  loading: boolean;
  error: string | null;
  razorpayOrderId: string | null;
}

const initialState: PaymentState = {
  currentPayment: null,
  paymentHistory: [],
  loading: false,
  error: null,
  razorpayOrderId: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    createPaymentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createPaymentSuccess: (state, action: PayloadAction<{ payment: Payment; order: { order_id: string; amount: number; currency: string } }>) => {
      state.loading = false;
      state.currentPayment = action.payload.payment;
      state.razorpayOrderId = action.payload.order.order_id;
      state.error = null;
    },
    createPaymentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    processPaymentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    processPaymentSuccess: (state, action: PayloadAction<Payment>) => {
      state.loading = false;
      state.currentPayment = action.payload;
      state.paymentHistory.unshift(action.payload);
      state.razorpayOrderId = null;
      state.error = null;
    },
    processPaymentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchPaymentHistoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPaymentHistorySuccess: (state, action: PayloadAction<Payment[]>) => {
      state.loading = false;
      state.paymentHistory = action.payload;
      state.error = null;
    },
    fetchPaymentHistoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
      state.razorpayOrderId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  createPaymentStart,
  createPaymentSuccess,
  createPaymentFailure,
  processPaymentStart,
  processPaymentSuccess,
  processPaymentFailure,
  fetchPaymentHistoryStart,
  fetchPaymentHistorySuccess,
  fetchPaymentHistoryFailure,
  clearCurrentPayment,
  clearError,
} = paymentSlice.actions;

export default paymentSlice.reducer;
