import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import type { RootState } from './app/store';
import HeaderGlass from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import VehiclesPage from './pages/VehiclesPage';
import ParkVehicle from './pages/parking/ParkVehicle';
import ExitVehicle from './pages/parking/ExitVehicle';
import PaymentPage from './pages/PaymentPage';
import CreateReservation from './pages/reservation/CreateReservation';
import ReservationList from './pages/reservation/ReservationList';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const router = createBrowserRouter([
    {
      path: '/login',
      element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />,
    },
    {
      path: '/register',
      element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />,
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <HeaderGlass />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: 'dashboard',
          element: <Dashboard />,
        },
        {
          path: 'vehicles',
          element: <VehiclesPage />,
        },
        {
          path: 'park',
          element: <ParkVehicle />,
        },
        {
          path: 'exit',
          element: <ExitVehicle />,
        },
        {
          path: 'payment/:sessionId',
          element: <PaymentPage />,
        },
        {
          path: 'reservations',
          element: <ReservationList />,
        },
        {
          path: 'reservations/create',
          element: <CreateReservation />,
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
