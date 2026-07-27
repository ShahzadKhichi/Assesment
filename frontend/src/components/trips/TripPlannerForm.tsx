import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { planTrip } from '../../store/slices/tripSlice';
import { tripApi } from '../../services/api/tripApi';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PlaceIcon from '@mui/icons-material/Place';
import SendIcon from '@mui/icons-material/Send';

/**
 * Trip Planner Form — the main entry form for planning an HOS-compliant trip.
 * Collects origin, pickup, dropoff locations and current cycle hours.
 */
export const TripPlannerForm: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const { isPlanning, error } = useAppSelector((s) => s.trips);

  const [form, setForm] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    cycle_hours_used: 0,
  });
  const [suggestions, setSuggestions] = useState<{ label: string; value: string }[]>([]);
  const [activeField, setActiveField] = useState<'current' | 'pickup' | 'dropoff' | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (!activeField) {
      setSuggestions([]);
      return;
    }

    const fieldValue = form[
      activeField === 'current'
        ? 'current_location'
        : activeField === 'pickup'
          ? 'pickup_location'
          : 'dropoff_location'
    ];

    if (fieldValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const response = await tripApi.getSuggestions(fieldValue);
        setSuggestions(response.suggestions || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [activeField, form.current_location, form.pickup_location, form.dropoff_location]);

  const handleChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const handleSlider = useCallback((_: Event, value: number | number[]) => {
    setForm((prev) => ({ ...prev, cycle_hours_used: value as number }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(planTrip(form));
    },
    [dispatch, form]
  );

  const handleSuggestionSelect = useCallback((field: 'current' | 'pickup' | 'dropoff') => (_: unknown, value: string | { label: string; value: string } | null) => {
    if (!value) return;
    const selectedValue = typeof value === 'string' ? value : value.value;
    const key = field === 'current' ? 'current_location' : field === 'pickup' ? 'pickup_location' : 'dropoff_location';
    setForm((prev) => ({ ...prev, [key]: selectedValue }));
  }, []);

  const renderLocationField = useCallback(
    (field: 'current' | 'pickup' | 'dropoff', label: string, placeholder: string, icon: React.ReactNode, colorClass: string) => {
      const valueKey = field === 'current' ? 'current_location' : field === 'pickup' ? 'pickup_location' : 'dropoff_location';
      const currentValue = form[valueKey];

      return (
        <Autocomplete
          freeSolo
          fullWidth
          options={suggestions}
          inputValue={currentValue}
          loading={loadingSuggestions}
          onInputChange={(_, newValue) => {
            setActiveField(field);
            setForm((prev) => ({ ...prev, [valueKey]: newValue }));
          }}
          onChange={handleSuggestionSelect(field)}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder}
              required
              InputProps={{
                ...params.InputProps,
                startAdornment: <div className={`mr-2 ${colorClass}`}>{icon}</div>,
              }}
            />
          )}
        />
      );
    },
    [form, handleSuggestionSelect, loadingSuggestions, suggestions]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass-card p-6 sm:p-8"
    >
      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <div className="bg-teal-100 text-teal-700 p-2 rounded-lg">
          <LocalShippingIcon />
        </div>
        Plan New Trip
      </h2>

      {error && (
        <Alert severity="error" className="mb-4" variant="outlined">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {renderLocationField('current', 'Current Location', 'e.g. New York, NY', <MyLocationIcon fontSize="small" />, 'text-teal-600')}
        {renderLocationField('pickup', 'Pickup Location', 'e.g. Philadelphia, PA', <PlaceIcon fontSize="small" />, 'text-teal-600')}
        {renderLocationField('dropoff', 'Dropoff Location', 'e.g. Chicago, IL', <PlaceIcon fontSize="small" />, 'text-teal-600')}

        {/* Cycle Hours Used */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Current Cycle Hours Used:{' '}
            <span className="text-teal-700 font-bold">{form.cycle_hours_used}h</span>
            <span className="text-slate-400 ml-1">/ 70h</span>
          </label>
          <Slider
            value={form.cycle_hours_used}
            onChange={handleSlider}
            min={0}
            max={70}
            step={0.5}
            valueLabelDisplay="auto"
            sx={{
              color: '#0f766e',
              '& .MuiSlider-thumb': { width: 20, height: 20 },
              '& .MuiSlider-track': { height: 6 },
              '& .MuiSlider-rail': { height: 6, opacity: 0.35 },
            }}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>0h (Fresh Start)</span>
            <span>70h (Max Cycle)</span>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isPlanning}
          endIcon={!isPlanning && <SendIcon />}
          sx={{
            py: 1.5,
            fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0d9488 0%, #134e4a 100%)',
            },
          }}
        >
          {isPlanning ? 'Computing HOS Schedule...' : 'Plan HOS Compliant Trip'}
        </Button>
      </form>
    </motion.div>
  );
});

TripPlannerForm.displayName = 'TripPlannerForm';
