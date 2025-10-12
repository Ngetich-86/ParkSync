import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../app/store';
import { fetchVehiclesStart, fetchVehiclesSuccess, fetchVehiclesFailure } from '../../features/vehicle/vehicleSlice';
import { fetchSlotsStart, fetchSlotsSuccess, fetchSlotsFailure } from '../../features/parkingSlot/parking-slotSlice';
import { createReservationStart, createReservationSuccess, createReservationFailure } from '../../features/reservation/reservationSlice';
import { vehicleService } from '../../services/vehicleService';
import { slotService } from '../../services/slotService';
import { reservationService, type CreateReservationData } from '../../services/reservationService';

const CreateReservation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { slots } = useSelector((state: RootState) => state.slot);
  const { loading: reservationLoading } = useSelector((state: RootState) => state.reservation);

  const [formData, setFormData] = useState<CreateReservationData>({
    vehicle_id: 0,
    slot_id: 0,
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchVehiclesStart());
        const vehiclesData = await vehicleService.getVehicles();
        dispatch(fetchVehiclesSuccess(vehiclesData));

        dispatch(fetchSlotsStart());
        const slotsData = await slotService.getSlots();
        dispatch(fetchSlotsSuccess(slotsData));
      } catch (error) {
        dispatch(fetchVehiclesFailure('Failed to fetch data'));
        dispatch(fetchSlotsFailure('Failed to fetch slots'));
      }
    };

    fetchData();
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dispatch(createReservationStart());
      const reservation = await reservationService.createReservation(formData);
      dispatch(createReservationSuccess(reservation));
      navigate('/reservations');
    } catch (error) {
      dispatch(createReservationFailure('Failed to create reservation'));
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Reservation</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Vehicle
              </label>
              <select
                name="vehicle_id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.vehicle_id}
                onChange={handleChange}
              >
                <option value={0}>Choose a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    {getVehicleTypeIcon(vehicle.vehicle_type)} {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Slot
              </label>
              <select
                name="slot_id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.slot_id}
                onChange={handleChange}
              >
                <option value={0}>Choose a slot</option>
                {slots.filter(slot => slot.status === 'available').map((slot) => (
                  <option key={slot.slot_id} value={slot.slot_id}>
                    🅿️ Slot {slot.slot_number} - Floor {slot.floor_id} (${slot.hourly_rate}/hour)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.start_time}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.end_time}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/reservations')}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reservationLoading || !formData.vehicle_id || !formData.slot_id}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {reservationLoading ? 'Creating...' : 'Create Reservation'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReservation;
