import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import slices
import authReducer from "../features/auth/authSlice";
import vehicleReducer from "../features/vehicle/vehicleSlice";
import slotReducer from "../features/parkingSlot/parking-slotSlice";
import parkingSessionReducer from "../features/parkingSession/parkingSessionSlice";
import reservationReducer from "../features/reservation/reservationSlice";
import paymentReducer from "../features/payment/paymentSlice";

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // only auth will be persisted
}

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  vehicle: vehicleReducer,
  slot: slotReducer,
  parkingSession: parkingSessionReducer,
  reservation: reservationReducer,
  payment: paymentReducer,
});

// Add persist reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
});

export const persistedStore = persistStore(store);

// Define RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
