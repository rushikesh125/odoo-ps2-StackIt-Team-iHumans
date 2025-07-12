import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"; // Import the reducer, not the slice

const store = configureStore({
    reducer: {
        user: userReducer, // Use the reducer function
    }
});

export default store;