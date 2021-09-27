import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import roomReducer from '../features/roomSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    room: roomReducer,
  },
});
