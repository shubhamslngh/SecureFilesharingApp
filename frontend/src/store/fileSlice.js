import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    files: [],
};

const fileSlice = createSlice({
    name: "file",
    initialState,
    reducers: {
        setFiles: (state, action) => {
            state.files = action.payload;
        },
    },
});

export const { setFiles } = fileSlice.actions;
export default fileSlice.reducer;
