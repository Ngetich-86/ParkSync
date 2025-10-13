import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { fetchSlotsStart, fetchSlotsSuccess, fetchSlotsFailure } from '../features/parkingSlot/parking-slotSlice';
import { fetchCurrentSessionStart, fetchCurrentSessionSuccess, fetchCurrentSessionFailure } from '../features/parkingSession/parkingSessionSlice';
import { slotService } from '../services/slotService';
import { parkingSessionService } from '../services/parkingSessionService';
import { Link } from 'react-router-dom';
import { ParkingCircle, CheckCircle, Car, Clock, Calendar, Truck } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { slots, availableSlots, loading: slotsLoading } = useSelector((state: RootState) => state.slot);
  const { currentSession, loading: sessionLoading } = useSelector((state: RootState) => state.parkingSession);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchSlotsStart());
        const slotsData = await slotService.getSlots();
        dispatch(fetchSlotsSuccess(slotsData));

        dispatch(fetchCurrentSessionStart());
        const currentSessionData = await parkingSessionService.getCurrentSession();
        dispatch(fetchCurrentSessionSuccess(currentSessionData));
      } catch (error) {
        dispatch(fetchSlotsFailure('Failed to fetch data'));
        dispatch(fetchCurrentSessionFailure('Failed to fetch current session'));
      }
    };

    fetchData();
  }, [dispatch]);

  const occupiedSlots = slots.filter(slot => slot.status === 'occupied').length;
  const totalSlots = slots.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your parking experience from here
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <ParkingCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Slots</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {slotsLoading ? '...' : totalSlots}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {slotsLoading ? '...' : availableSlots.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <Car className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {slotsLoading ? '...' : occupiedSlots}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Your Session</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {sessionLoading ? '...' : currentSession ? 'Active' : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Session */}
        {currentSession && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Parking Session</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Entry Time</p>
                <p className="font-medium">
                  {new Date(currentSession.entry_time).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Slot Number</p>
                <p className="font-medium">Slot {currentSession.slot_id}</p>
              </div>
              <div>
                <Link
                  to="/exit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Exit Vehicle
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/park"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Car className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Park Vehicle</h3>
                <p className="text-gray-600">Enter the garage</p>
              </div>
            </div>
          </Link>

          <Link
            to="/reservations"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Reservations</h3>
                <p className="text-gray-600">Book a slot in advance</p>
              </div>
            </div>
          </Link>

          <Link
            to="/vehicles"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">My Vehicles</h3>
                <p className="text-gray-600">Manage your vehicles</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
