import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../app/store';
import { createPaymentStart, createPaymentSuccess, createPaymentFailure, processPaymentStart, processPaymentSuccess, processPaymentFailure } from '../features/payment/paymentSlice';
import { parkingSessionService } from '../services/parkingSessionService';
import { paymentService } from '../services/paymentService';

// Mock Razorpay script loading
declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { currentPayment, loading, error } = useSelector((state: RootState) => state.payment);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      try {
        const sessionData = await parkingSessionService.getSessionById(parseInt(sessionId));
        setSession(sessionData);
      } catch (error) {
        console.error('Failed to fetch session:', error);
      }
    };

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    if (!session || !sessionId) return;

    try {
      dispatch(createPaymentStart());
      const paymentData = {
        session_id: parseInt(sessionId),
        amount: session.total_fee || 0,
        payment_method: 'razorpay' as const,
      };
      const response = await paymentService.createPayment(paymentData);
      dispatch(createPaymentSuccess(response));

      // Initialize Razorpay
      const options = {
        key: 'rzp_test_1DP5mmOlF5G5ag', // Test key - replace with your actual key
        amount: response.order.amount,
        currency: response.order.currency,
        name: 'ParkSync',
        description: 'Parking Fee Payment',
        order_id: response.order.order_id,
        handler: async (response: any) => {
          try {
            dispatch(processPaymentStart());
            const payment = await paymentService.processRazorpayPayment(
              response.payment.payment_id,
              response.razorpay_payment_id
            );
            dispatch(processPaymentSuccess(payment));
            navigate('/dashboard');
          } catch (error) {
            dispatch(processPaymentFailure('Payment processing failed'));
          }
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      dispatch(createPaymentFailure('Failed to create payment'));
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading session details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Parking Session Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Entry Time:</span>
              <span className="font-medium">
                {new Date(session.entry_time).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Exit Time:</span>
              <span className="font-medium">
                {session.exit_time ? new Date(session.exit_time).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">
                {session.total_duration ? `${Math.round(session.total_duration / 60)} hours` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Slot Number:</span>
              <span className="font-medium">Slot {session.slot_id}</span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span className="text-green-600">${session.total_fee || 0}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="text-blue-400 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Secure Payment</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your payment is processed securely through Razorpay. We don't store your payment details.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay $${session.total_fee || 0}`}
          </button>
        </div>

        {currentPayment && currentPayment.payment_status === 'completed' && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-green-400 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Payment Successful!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your payment has been processed successfully. A receipt has been sent to your email.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
