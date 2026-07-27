import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tripApi, PlanTripPayload, TripItem } from '../../services/api/tripApi';

interface TripState {
  trips: TripItem[];
  activeTrip: TripItem | null;
  isLoading: boolean;
  isPlanning: boolean;
  error: string | null;
}

const initialState: TripState = {
  trips: [],
  activeTrip: null,
  isLoading: false,
  isPlanning: false,
  error: null,
};

export const planTrip = createAsyncThunk(
  'trips/planTrip',
  async (payload: PlanTripPayload, { rejectWithValue }) => {
    try {
      const response = await tripApi.planTrip(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tripApi.getTrips();
      return response.results || response.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    clearTripError: (state) => {
      state.error = null;
    },
    setActiveTrip: (state, action) => {
      state.activeTrip = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(planTrip.pending, (state) => {
        state.isPlanning = true;
        state.error = null;
      })
      .addCase(planTrip.fulfilled, (state, action) => {
        state.isPlanning = false;
        const tripData = action.payload.trip;
        if (tripData) {
          // Merge geocoded stop coordinates from backend into the trip object
          if (action.payload.stops_with_coords) {
            tripData.stops_with_coords = action.payload.stops_with_coords;
          }
          if (action.payload.route_coordinates) {
            tripData.route_coordinates = action.payload.route_coordinates;
          }
          state.activeTrip = tripData;
          state.trips.unshift(tripData);
        }
      })
      .addCase(planTrip.rejected, (state, action) => {
        state.isPlanning = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTrips.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTripError, setActiveTrip } = tripSlice.actions;
export default tripSlice.reducer;
