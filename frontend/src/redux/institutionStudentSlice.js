import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import toast from "react-hot-toast";

/* ✅ FETCH INSTITUTION STUDENTS */
export const fetchInstitutionStudents = createAsyncThunk(
  "institutionStudents/fetchInstitutionStudents",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/institution/students");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch students");
    }
  }
);

const institutionStudentSlice = createSlice({
  name: "institutionStudents",
  initialState: {
    students: [],
    status: "idle",
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchInstitutionStudents.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInstitutionStudents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.students = action.payload;
      })
      .addCase(fetchInstitutionStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default institutionStudentSlice.reducer;
