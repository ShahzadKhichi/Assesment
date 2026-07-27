import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tripApi, TripItem } from '../services/api/tripApi';
import { RouteMap, HOSBreakdown, RouteTimeline } from '../components/trips';
import { ShimmerTripDetail } from '../components/loaders';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<TripItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    tripApi
      .getTripById(id)
      .then((data) => {
        setTrip(data);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load trip details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id) return;
    const ok = window.confirm(`Change trip status to ${newStatus}?`);
    if (!ok) return;
    setLoading(true);
    try {
      const updated = await tripApi.updateTripStatus(id, newStatus);
      setTrip(updated);
      setError(null);
    } catch (e) {
      setError('Failed to update trip status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800">
          <ArrowBackIcon />
          <span className="font-semibold">Back</span>
        </Link>
        <h1 className="text-2xl font-bold">Trip Details</h1>
      </div>

      {loading && (
        <div className="glass-card p-6">
          <ShimmerTripDetail />
        </div>
      )}

      {error && (
        <div className="glass-card p-6 text-red-600">{error}</div>
      )}

      {!loading && trip && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RouteMap trip={trip} />
            </div>

            <div className="space-y-4">
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Current Status</h4>
                  <div className="text-sm text-slate-700 font-medium">{trip.status}</div>
                </div>
                <div className="flex items-center gap-2">
                  {trip.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleUpdateStatus('IN_PROGRESS')} className="px-3 py-2 bg-teal-600 text-white rounded-md">Start Trip</button>
                      <button onClick={() => handleUpdateStatus('CANCELLED')} className="px-3 py-2 bg-red-600 text-white rounded-md">Cancel</button>
                    </>
                  )}

                  {trip.status === 'IN_PROGRESS' && (
                    <>
                      <button onClick={() => handleUpdateStatus('COMPLETED')} className="px-3 py-2 bg-green-600 text-white rounded-md">Complete</button>
                      <button onClick={() => handleUpdateStatus('CANCELLED')} className="px-3 py-2 bg-red-600 text-white rounded-md">Cancel</button>
                    </>
                  )}
                </div>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-lg font-bold mb-2">Summary</h3>
                <p className="text-sm text-slate-700"><strong>Status:</strong> {trip.status}</p>
                <p className="text-sm text-slate-700"><strong>Created:</strong> {new Date(trip.created_at).toLocaleString()}</p>
                <p className="text-sm text-slate-700"><strong>From:</strong> {trip.current_location}</p>
                <p className="text-sm text-slate-700"><strong>Pickup:</strong> {trip.pickup_location}</p>
                <p className="text-sm text-slate-700"><strong>Dropoff:</strong> {trip.dropoff_location}</p>
                <p className="text-sm text-slate-700"><strong>Distance:</strong> {trip.total_distance_miles?.toFixed(1)} miles</p>
                <p className="text-sm text-slate-700"><strong>Est. Duration:</strong> {trip.estimated_duration_hours?.toFixed(1)} hrs</p>
              </div>

              <HOSBreakdown trip={trip} />
            </div>
          </div>

          <div>
            <RouteTimeline stops={trip.stops || []} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetailPage;
