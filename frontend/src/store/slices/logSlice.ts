import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logApi, DailyLogItem } from '../../services/api/logApi';

interface LogState {
  logs: DailyLogItem[];
  isLoading: boolean;
  isDownloading: boolean;
  error: string | null;
}

const initialState: LogState = {
  logs: [],
  isLoading: false,
  isDownloading: false,
  error: null,
};

export const fetchLogs = createAsyncThunk(
  'logs/fetchLogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await logApi.getLogs();
      return response.results || response.data || response || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const downloadLogPDF = createAsyncThunk(
  'logs/downloadPDF',
  async (logId: string, { rejectWithValue }) => {
    try {
      const blob = await logApi.downloadPDF(logId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily_log_${logId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      return logId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    clearLogError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(downloadLogPDF.pending, (state) => {
        state.isDownloading = true;
      })
      .addCase(downloadLogPDF.fulfilled, (state) => {
        state.isDownloading = false;
      })
      .addCase(downloadLogPDF.rejected, (state, action) => {
        state.isDownloading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLogError } = logSlice.actions;
export default logSlice.reducer;
