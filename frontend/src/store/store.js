import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import fileReducer from "./fileSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        file: fileReducer,
    },
});

export default store;
