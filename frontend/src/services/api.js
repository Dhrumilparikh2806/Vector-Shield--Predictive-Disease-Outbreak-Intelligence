import axios from 'axios';

const isProduction = import.meta.env.PROD;
const API_BASE_URL = isProduction
  ? '/api/v1'
  : 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

export const getLivePodData = async () => {
  const response = await api.get('/dashboard/live-pod-data');
  return response.data;
};

export const getMapZones = async () => {
  const response = await api.get('/map/zones');
  return response.data;
};

export const getHeatmapData = async () => {
  const response = await api.get('/map/heatmap');
  return response.data;
};

export const getPredictions48h = async () => {
  const response = await api.get('/prediction/48h');
  return response.data;
};

export const getLiveAlerts = async () => {
  const response = await api.get('/alerts/live');
  return response.data;
};

export const reloadBackend = async () => {
  const response = await api.post('/system/reload');
  return response.data;
};

// Export endpoints
export const exportZonesCSV = async () => {
  try {
    const response = await api.get('/export/zones', { responseType: 'blob' });
    return response.data;
  } catch (err) {
    console.error('Export CSV endpoint not available, returning frontend export:', err);
    return null;
  }
};

export const getExportableData = async () => {
  const [summary, zones, alerts] = await Promise.all([
    getDashboardSummary(),
    getMapZones(),
    getLiveAlerts()
  ]);
  return { summary, zones, alerts };
};

// Demo Endpoints
export const startDemo = async () => {
  const response = await api.post('/demo/start');
  return response.data;
};

export const stopDemo = async () => {
  const response = await api.post('/demo/stop');
  return response.data;
};

export const getRiskExplanation = async (location) => {
  const response = await api.get(`/demo/explanation/${location}`);
  return response.data;
};

export const getCorrelations = async () => {
  const response = await api.get('/demo/correlations');
  return response.data;
};

export const simulateTick = async () => {
  const response = await api.post('/simulate-tick');
  return response.data;
};

export const uploadScenario = async (hospitalFile, waterFile) => {
  const formData = new FormData();
  formData.append('hospital_file', hospitalFile);
  formData.append('water_file', waterFile);

  const response = await api.post('/scenario/scenario-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export default api;
