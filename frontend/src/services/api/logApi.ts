import { axiosInstance } from './axiosInstance';

export interface DailyLogItem {
  id: string;
  trip: string;
  day_number: number;
  off_duty_hours: number;
  sleeper_berth_hours: number;
  driving_hours: number;
  on_duty_not_driving_hours: number;
  total_miles_driven: number;
  created_at: string;
}

export const logApi = {
  getLogs: async () => {
    const res = await axiosInstance.get('/logs/');
    return res.data;
  },

  downloadPDF: async (logId: string) => {
    const res = await axiosInstance.get(`/logs/${logId}/pdf/`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
