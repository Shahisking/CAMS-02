import axios from 'axios';
import {
  Asset,
  AllocationHistory,
  HistoryEvent,
  NotificationItem,
  User,
  BlockItem,
  VendorDetails,
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_ALLOCATION_LOGS,
  INITIAL_HISTORY_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
  INITIAL_BLOCKS,
  INITIAL_VENDORS,
} from '../data/mockData';

// Base URL for the backend API
const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('cams_jwt') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const withAuthHeaders = (config: Record<string, any> = {}) => ({
  ...config,
  headers: {
    ...(config.headers || {}),
    ...getAuthHeaders(),
  },
});

// ---------- FETCHERS (GET) ----------
export const fetchAssets = async (): Promise<Asset[]> => {
  const res = await axios.get<Asset[]>(`${API_BASE}/assets`, withAuthHeaders());
  return res.data;
};

export const fetchAllocationLogs = async (): Promise<AllocationHistory[]> => {
  const res = await axios.get<AllocationHistory[]>(`${API_BASE}/allocations`, withAuthHeaders());
  return res.data;
};

export const fetchHistoryEvents = async (): Promise<HistoryEvent[]> => {
  const res = await axios.get<HistoryEvent[]>(`${API_BASE}/history`, withAuthHeaders());
  return res.data;
};

export const fetchNotifications = async (): Promise<NotificationItem[]> => {
  const res = await axios.get<NotificationItem[]>(`${API_BASE}/notifications`, withAuthHeaders());
  return res.data;
};

export const fetchUsers = async (): Promise<User[]> => {
  const res = await axios.get<User[]>(`${API_BASE}/users`, withAuthHeaders());
  return res.data;
};

export const fetchBlocks = async (): Promise<BlockItem[]> => {
  const res = await axios.get<BlockItem[]>(`${API_BASE}/blocks`, withAuthHeaders());
  return res.data;
};

export const fetchRooms = async (): Promise<import('../types').RoomItem[]> => {
  const res = await axios.get<import('../types').RoomItem[]>(`${API_BASE}/rooms`, withAuthHeaders());
  return res.data || [];
};

export const fetchVendors = async (): Promise<VendorDetails[]> => {
  const res = await axios.get<VendorDetails[]>(`${API_BASE}/vendors`, withAuthHeaders());
  return res.data;
};

// ---------- CRUD (POST/PUT/DELETE) ----------
export const createAsset = async (asset: Omit<Asset, 'id'>): Promise<Asset> => {
  const res = await axios.post<Asset>(`${API_BASE}/assets`, asset, withAuthHeaders());
  return res.data;
};

export const updateAsset = async (id: string, updates: Partial<Asset>): Promise<void> => {
  await axios.put(`${API_BASE}/assets/${id}`, updates, withAuthHeaders());
};

export const deleteAsset = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/assets/${id}`, withAuthHeaders());
};

// ---------- BLOCKS CRUD ----------
export const createBlock = async (name: string, description?: string): Promise<BlockItem> => {
  const res = await axios.post<BlockItem>(`${API_BASE}/blocks`, { name, description }, withAuthHeaders());
  return res.data;
};

export const updateBlock = async (id: string, name: string, description?: string): Promise<void> => {
  await axios.put(`${API_BASE}/blocks/${id}`, { name, description }, withAuthHeaders());
};

export const deleteBlockApi = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/blocks/${id}`, withAuthHeaders());
};

// ---------- ROOMS CRUD ----------
export const createRoom = async (room: Omit<import('../types').RoomItem, 'id'>): Promise<import('../types').RoomItem> => {
  const res = await axios.post<import('../types').RoomItem>(`${API_BASE}/rooms`, room, withAuthHeaders());
  return res.data;
};

export const updateRoom = async (id: string, updates: Partial<import('../types').RoomItem>): Promise<void> => {
  await axios.put(`${API_BASE}/rooms/${id}`, updates, withAuthHeaders());
};

export const deleteRoomApi = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/rooms/${id}`, withAuthHeaders());
};

// ---------- AUTH ----------
export const login = async (email: string, password: string, role?: string) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password, role });
  return res.data; // { token, user }
};

export const logout = async () => {
  try {
    await axios.post(`${API_BASE}/auth/logout`, {}, withAuthHeaders());
  } catch { /* ignore */ }
  return;
};

export const register = async (user: Partial<User> & { password?: string }) => {
  const { password, ...rest } = user;
  // Map frontend field names to backend expected ones
  const payload = {
    full_name: (rest as any).fullName,
    staff_id: (rest as any).staffId,
    department: rest.department,
    role: rest.role,
    email: rest.email,
    password,
  };
  const res = await axios.post(`${API_BASE}/auth/register`, payload);
  return res.data; // { token, user }
};


// ---------- ADMIN USER MANAGEMENT ----------
export const createUser = async (data: { email: string; password: string; name: string; role: string; department?: string; staffId?: string }) => {
  const res = await axios.post(`${API_BASE}/users`, data, withAuthHeaders());
  return res.data;
};

export const updateUser = async (id: string, updates: Record<string, any>) => {
  const res = await axios.patch(`${API_BASE}/users/${id}`, updates, withAuthHeaders());
  return res.data;
};

export const fetchLoginHistory = async () => {
  const res = await axios.get(`${API_BASE}/auth/login-history`, withAuthHeaders());
  return res.data;
};

export const fetchAuditLogsApi = async () => {
  const res = await axios.get(`${API_BASE}/auth/audit-logs`, withAuthHeaders());
  return res.data;
};
