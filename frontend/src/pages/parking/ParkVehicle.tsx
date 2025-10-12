

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { RootState, AppDispatch } from '../../app/store';
import { fetchVehiclesStart, fetchVehiclesSuccess, fetchVehiclesFailure } from '../../features/vehicle/vehicleSlice';
import { fetchSlotsStart, fetchSlotsSuccess, fetchSlotsFailure } from '../../features/parkingSlot/parking-slotSlice';
import { startSessionStart, startSessionSuccess, startSessionFailure } from '../../features/parkingSession/parkingSessionSlice';
import { vehicleService } from '../../services/vehicleService';
import { slotService } from '../../services/slotService';
import { parkingSessionService } from '../../services/parkingSessionService';

const ParkVehicle = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { vehicles, loading: vehiclesLoading } = useSelector((state: RootState) => state.vehicle);
  const { availableSlots, loading: slotsLoading } = useSelector((state: RootState) => state.slot);
  const { loading: sessionLoading } = useSelector((state: RootState) => state.parkingSession);

  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchVehiclesStart());
        const vehiclesData = await vehicleService.getVehicles();
        dispatch(fetchVehiclesSuccess(vehiclesData));

        dispatch(fetchSlotsStart());
        const slotsData = await slotService.getAvailableSlots();
        dispatch(fetchSlotsSuccess(slotsData));
      } catch (error) {
        dispatch(fetchVehiclesFailure('Failed to fetch data'));
        dispatch(fetchSlotsFailure('Failed to fetch slots'));
      }
    };

    fetchData();
  }, [dispatch]);

  const handleParkVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      dispatch(startSessionStart());
      const sessionData = {
        vehicle_id: selectedVehicle,
        slot_id: selectedSlot || undefined,
      };
      const session = await parkingSessionService.startSession(sessionData);
      dispatch(startSessionSuccess(session));
      toast.success('Vehicle parked successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to start parking session';
      dispatch(startSessionFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'car': return '🚗';
      case 'motorcycle': return '🏍️';
      case 'truck': return '🚛';
      default: return '🚗';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Park Vehicle</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vehicle Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Select Vehicle</h2>
            {vehiclesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading vehicles...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🚗</div>
                <p className="text-gray-600 mb-4">No vehicles found</p>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Vehicle
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.vehicle_id}
                    onClick={() => setSelectedVehicle(vehicle.vehicle_id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVehicle === vehicle.vehicle_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">
                        {getVehicleTypeIcon(vehicle.vehicle_type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-600">{vehicle.license_plate}</p>
                        <p className="text-sm text-gray-500">{vehicle.color}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slot Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Available Slots</h2>
            {slotsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading slots...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🅿️</div>
                <p className="text-gray-600">No available slots</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">🎯</div>
                    <div>
                      <h3 className="font-medium text-gray-900">Auto Assign</h3>
                      <p className="text-sm text-gray-600">Let the system choose the best slot</p>
                    </div>
                    <div className="ml-auto">
                      <input
                        type="radio"
                        name="slot"
                        checked={selectedSlot === null}
                        onChange={() => setSelectedSlot(null)}
                        className="h-4 w-4 text-blue-600"
                      />
                    </div>
                  </div>
                </div>
                {availableSlots.map((slot) => (
                  <div
                    key={slot.slot_id}
                    onClick={() => setSelectedSlot(slot.slot_id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSlot === slot.slot_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">🅿️</div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Slot {slot.slot_number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Floor {slot.floor_id} • ${slot.hourly_rate}/hour
                          </p>
                          <p className="text-sm text-gray-500 capitalize">
                            {slot.slot_type}
                          </p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="slot"
                        checked={selectedSlot === slot.slot_id}
                        onChange={() => setSelectedSlot(slot.slot_id)}
                        className="h-4 w-4 text-blue-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleParkVehicle}
            disabled={!selectedVehicle || sessionLoading}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
          >
            {sessionLoading ? 'Parking Vehicle...' : 'Park Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParkVehicle;