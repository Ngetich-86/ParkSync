import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { RootState, AppDispatch } from '../../app/store';
import { fetchCurrentSessionStart, fetchCurrentSessionSuccess, fetchCurrentSessionFailure, endSessionStart, endSessionSuccess, endSessionFailure } from '../../features/parkingSession/parkingSessionSlice';
import { parkingSessionService } from '../../services/parkingSessionService';

const ExitVehicle = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentSession, loading } = useSelector((state: RootState) => state.parkingSession);

  useEffect(() => {
    const fetchCurrentSession = async () => {
      try {
        dispatch(fetchCurrentSessionStart());
        const session = await parkingSessionService.getCurrentSession();
        dispatch(fetchCurrentSessionSuccess(session));
      } catch (error) {
        dispatch(fetchCurrentSessionFailure('Failed to fetch current session'));
      }
    };

    fetchCurrentSession();
  }, [dispatch]);

  const handleExitVehicle = async () => {
    if (!currentSession) return;

    try {
      dispatch(endSessionStart());
      const endedSession = await parkingSessionService.endSession(currentSession.session_id);
      dispatch(endSessionSuccess(endedSession));
      toast.success('Session ended successfully! Redirecting to payment...');
      navigate(`/payment/${endedSession.session_id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to end parking session';
      dispatch(endSessionFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  const calculateDuration = (entryTime: string) => {
    const entry = new Date(entryTime);
    const now = new Date();
    const diffMs = now.getTime() - entry.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    return diffHours;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Session</h2>
          <p className="text-gray-600 mb-6">You don't have an active parking session</p>
          <button
            onClick={() => navigate('/park')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Park Vehicle
          </button>
        </div>
      </div>
    );
  }

  const duration = calculateDuration(currentSession.entry_time);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Exit Vehicle</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Session Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Entry Time:</span>
              <span className="font-medium">
                {new Date(currentSession.entry_time).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Slot Number:</span>
              <span className="font-medium">Slot {currentSession.slot_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{duration} hour{duration !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Fee:</span>
              <span className="font-medium text-lg">${duration * 5}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="text-yellow-400 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Once you exit, you'll be redirected to the payment page to complete your transaction.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleExitVehicle}
            disabled={loading}
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Exiting...' : 'Exit Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitVehicle;
