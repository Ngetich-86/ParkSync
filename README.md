Parksync - Full Stack Parking Management
=======================================

Prerequisites
-------------
- Node.js 18+ and pnpm 9+
- PostgreSQL 14+

Backend (NestJS)
----------------
1) cd nest-backend
2) Copy .env.example to .env and set:
   - DATABASE_URL=postgres://user:pass@localhost:5432/parksync
   - JWT secrets
   - PORT=5000
3) pnpm install
4) Run migrations: pnpm run build && pnpm run typeorm:migration:run (or use provided migration scripts)
5) Start dev: pnpm run start:dev

Key endpoints require Bearer access token. Use auth endpoints to obtain tokens. Parking slots and vehicles are paginated; responses may be either array or { data, total, ... }.

Frontend (React + Vite)
-----------------------
1) cd frontend
2) pnpm install
3) Ensure API base in src/utils/ApiDomain.ts points to backend (default http://localhost:5000)
4) pnpm run dev (Vite dev server on http://localhost:5173)

Notes
-----
- Vehicles: Frontend maps backend fields (licensePlate, vehicleType) to UI fields (license_plate, vehicle_type). Types TWO_WHEELER/FOUR_WHEELER are displayed as motorcycle/car.
- Parking Slots: Frontend maps parkingSlotId/slotNumber/isOccupied/isMaintenance to slot_id/slot_number/status and filters available slots accordingly.
- Reservations: Frontend maps reservationId/parkingSlotId/startTime/endTime/... to UI shape.

Troubleshooting
---------------
- If lists appear empty, check your token, CORS, and that backend returns data. The frontend extracts array from either raw array or paginated response (response.data.data).
- After schema changes run migrations and rebuild the backend.

