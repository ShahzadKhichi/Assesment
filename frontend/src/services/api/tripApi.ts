import { axiosInstance } from './axiosInstance';

export interface PlanTripPayload {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_hours_used?: number;
}

export interface StopItem {
  id: string;
  location: string;
  stop_type: string;
  sequence: number;
  duration_hours: number;
  notes: string;
  lat?: number;
  lng?: number;
}

export interface RouteCoordinates {
  origin: { lat: number; lng: number };
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
}

export interface TripItem {
  id: string;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_hours_used: number;
  total_distance_miles: number;
  estimated_duration_hours: number;
  status: string;
  stops: StopItem[];
  stops_with_coords?: StopItem[];
  route_coordinates?: RouteCoordinates;
  created_at: string;
}

export const tripApi = {
  planTrip: async (payload: PlanTripPayload) => {
    const res = await axiosInstance.post('/trips/plan/', payload);
    return res.data;
  },

  getSuggestions: async (query: string) => {
    const res = await axiosInstance.get('/trips/suggestions/', { params: { q: query } });
    return res.data;
  },

  getTrips: async () => {
    const res = await axiosInstance.get('/trips/');
    return res.data;
  },

  getTripById: async (id: string) => {
    const res = await axiosInstance.get(`/trips/${id}/`);
    return res.data;
  },
  updateTripStatus: async (id: string, status: string) => {
    const res = await axiosInstance.patch(`/trips/${id}/`, { status });
    return res.data;
  },
};

