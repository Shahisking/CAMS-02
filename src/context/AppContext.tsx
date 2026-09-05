// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Asset,
  MaintenanceTicket,
  AllocationHistory,
  HistoryEvent,
  User,
  NotificationItem,
  SystemSettings,
  CategoryType,
  ChairType,
  Department,
  Role,
  AuditLog,
  BlockItem,
  RoomItem,
  VendorDetails,
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_MAINTENANCE_TICKETS,
  INITIAL_ALLOCATION_LOGS,
  INITIAL_HISTORY_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_VENDORS,
  AUTHORIZED_EMAILS,
} from '../data/mockData';

// Axios API utilities (to be implemented in src/api)
import {
  fetchAssets,
  fetchAllocationLogs,
  fetchHistoryEvents,
  fetchNotifications,
  fetchUsers,
  fetchBlocks,
  fetchRooms,
  fetchVendors,
  createAsset as apiCreateAsset,
  updateAsset as apiUpdateAsset,
  deleteAsset as apiDeleteAsset,
  createBlock as apiCreateBlock,
  updateBlock as apiUpdateBlock,
  deleteBlockApi as apiDeleteBlockApi,
  createRoom as apiCreateRoom,
  updateRoom as apiUpdateRoom,
  deleteRoomApi as apiDeleteRoomApi,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from '../api';

export type ActiveTab =
  | 'splash'
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'assets'
  | 'departments'
  | 'blocks'
  | 'categories'
  | 'vendors'
  | 'requests'
  | 'issue-return'
  | 'add-asset'
  | 'allocation'
  | 'maintenance'
  | 'disposal'
  | 'qr'
  | 'history'
  | 'audit-logs'
  | 'reports'
  | 'notifications'
  | 'users'
  | 'roles'
  | 'settings'
  | 'profile'
  | 'help'
  | 'system-monitor';

interface AppContextType {
  // Existing fields above...
  // Added fields for notifications, settings, users, audit logs, and vendor management
  historyEvents: HistoryEvent[];
  notifications: NotificationItem[];
  addNotification: (notif: Omit<NotificationItem, 'id'>) => Promise<void>;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  settings: SystemSettings;
  updateSettings: (updates: Partial<SystemSettings>) => void;
  resetAllData: () => void;
  auditLogs: AuditLog[];
  users: User[];
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  failedAttemptsMap: Record<string, number>;
  unlockAccount: (id: string) => void;
  vendors: VendorDetails[];
  addVendor: (vendor: Omit<VendorDetails, 'id'>) => Promise<void>;
  // Existing fields continue below
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCategoryFilter: CategoryType | null;
  setSelectedCategoryFilter: (cat: CategoryType | null) => void;
  selectedChairTypeFilter: ChairType | null;
  setSelectedChairTypeFilter: (chairType: ChairType | null) => void;
  selectedDepartmentFilter: Department | null;
  setSelectedDepartmentFilter: (dept: Department | null) => void;
  selectedBuildingFilter: string | null;
  setSelectedBuildingFilter: (b: string | null) => void;
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password?: string, role?: Role) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  register: (user: Partial<User> & { password?: string }) => Promise<boolean>;
  isConfirmLogoutOpen: boolean;
  setIsConfirmLogoutOpen: (open: boolean) => void;
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => Promise<Asset>;
  updateAsset: (id: string, updated: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  blocks: BlockItem[];
  buildingBlocks: string[];
  addBlock: (name: string, description?: string) => Promise<void>;
  updateBlock: (id: string, name: string, description?: string) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  rooms: RoomItem[];
  addRoom: (room: Omit<RoomItem, 'id'>) => Promise<void>;
  updateRoom: (id: string, updated: Partial<RoomItem>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  selectedRoomFilter: string | null;
  setSelectedRoomFilter: (room: string | null) => void;
  selectedBlockFilter: string | null;
  setSelectedBlockFilter: (block: string | null) => void;
  maintenanceTickets: MaintenanceTicket[];
  addMaintenanceTicket: (ticket: Omit<MaintenanceTicket, 'id' | 'requestDate'>) => Promise<void>;
  updateMaintenanceTicket: (id: string, updated: Partial<MaintenanceTicket>) => Promise<void>;
  allocationLogs: AllocationHistory[];
  transferAsset: (assetId: string, toLocation: string, comment?: string, user?: User) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppContextProvider');
  return ctx;
};

// Alias hook with conventional name `useApp` for backward compatibility
export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppContextProvider');
  return ctx;
};

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTabState, setActiveTabState] = useState<ActiveTab>('splash');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryType | null>(null);
  const [selectedChairTypeFilter, setSelectedChairTypeFilter] = useState<ChairType | null>(null);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<Department | null>(null);
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cams_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure role is normalized
        const ROLE_MAP: Record<string, string> = { 'System Monitor': 'Monitor' };
        if (parsed.role && ROLE_MAP[parsed.role]) {
          parsed.role = ROLE_MAP[parsed.role];
        }
        return parsed;
      }
    } catch {}
    return null;
  });
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [failedAttemptsMap, setFailedAttemptsMap] = useState<Record<string, number>>({});

  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string | null>(null);
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [appError, setAppError] = useState<Error | null>(null);

  // Blocks and rooms from DB API (with asset-derived fallbacks)
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);

  const derivedBlocks = React.useMemo(() => {
    if (blocks.length > 0) return blocks;
    const uniqueBuildings = Array.from(new Set(assets.map((a) => a.building).filter(Boolean)));
    return uniqueBuildings.map((b) => ({
      id: `blk-${b}`,
      name: b,
      code: b!.substring(0, 3).toUpperCase(),
      description: `${b} Building`,
      lastUpdated: new Date().toISOString(),
    } as BlockItem));
  }, [blocks, assets]);

  const derivedRooms = React.useMemo(() => {
    if (rooms.length > 0) return rooms;
    const uniqueRoomsMap = new Map<string, RoomItem>();
    assets.forEach((a) => {
      if (!a.building || !a.roomNumber) return;
      const key = `${a.building}-${a.roomNumber}`;
      if (!uniqueRoomsMap.has(key)) {
        uniqueRoomsMap.set(key, {
          id: `rm-${key}`,
          block: a.building,
          roomNumber: a.roomNumber,
          department: a.department || 'General',
          type: 'Classroom',
          capacity: 60,
          status: 'Occupied',
        });
      }
    });
    return Array.from(uniqueRoomsMap.values());
  }, [rooms, assets]);

  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(INITIAL_MAINTENANCE_TICKETS);
  // Added state for users and vendors
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [vendors, setVendors] = useState<VendorDetails[]>(INITIAL_VENDORS);
  const [allocationLogs, setAllocationLogs] = useState<AllocationHistory[]>(INITIAL_ALLOCATION_LOGS);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>(INITIAL_HISTORY_EVENTS);
  

  const toggleDarkMode = () => setIsDarkMode(d => !d);

  const setActiveTab = (tab: ActiveTab) => {
    const hasSavedUser = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('cams_current_user'));
    if (!currentUser && !hasSavedUser && tab !== 'splash' && tab !== 'landing' && tab !== 'login') {
      setActiveTabState('login');
      return;
    }
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load protected data only after the user is authenticated.
  useEffect(() => {
    const load = async () => {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('cams_jwt') : null;
      if (!token) {
        setIsLoading(false);
        setAppError(null);
        return;
      }

      try {
        setIsLoading(true);
        const [a, al, h, n, u, b, r, v] = await Promise.all([
          fetchAssets(),
          fetchAllocationLogs(),
          fetchHistoryEvents(),
          fetchNotifications(),
          fetchUsers(),
          fetchBlocks(),
          fetchRooms(),
          fetchVendors(),
        ]);
        setAssets(a.length ? a : INITIAL_ASSETS);
        setAllocationLogs(al.length ? al : INITIAL_ALLOCATION_LOGS);
        setHistoryEvents(h.length ? h : INITIAL_HISTORY_EVENTS);
        setNotifications(n.length ? n : INITIAL_NOTIFICATIONS);
        setUsers(u.length ? u : INITIAL_USERS);
        setVendors(v.length ? v : INITIAL_VENDORS);
        setBlocks(b);
        setRooms(r);
        setAppError(null);
      } catch (e) {
        console.error('Failed to load protected app data', e);
        setAppError(e instanceof Error ? e : new Error('Failed to connect to the backend API.'));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [currentUser?.email, currentUser?.id]);

  // Auth handlers (JWT based)
  const login = async (emailInput: string, passwordInput?: string, roleOverride?: Role): Promise<boolean> => {
    const email = emailInput.trim().toLowerCase();
    const password = (passwordInput || '').trim();
    if (!password) return false;
    try {
      const { token, user } = await apiLogin(email, password, roleOverride);
      // Map backend field names to frontend User type
      const mappedUser = {
        ...user,
        fullName: user.full_name || user.fullName || user.name || '',
        staffId: user.staff_id || user.staffId || '',
      };
      localStorage.setItem('cams_jwt', token);
      localStorage.setItem('cams_current_user', JSON.stringify(mappedUser));
      setCurrentUser(mappedUser);
      setActiveTabState('dashboard');
      return true;
    } catch (e) {
      console.error('Login error', e);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    console.warn('Google login not implemented');
    return false;
  };

  const logout = async () => {
    await apiLogout();
    localStorage.removeItem('cams_jwt');
    localStorage.removeItem('cams_current_user');
    setCurrentUser(null);
    setActiveTabState('login');
  };

  const register = async (user: Partial<User> & { password?: string }) => {
    try {
      const { token, user: newUser } = await apiRegister(user);
      const mappedUser = {
        ...newUser,
        fullName: newUser.full_name || newUser.fullName || newUser.name || '',
        staffId: newUser.staff_id || newUser.staffId || '',
      };
      localStorage.setItem('cams_jwt', token);
      localStorage.setItem('cams_current_user', JSON.stringify(mappedUser));
      setCurrentUser(mappedUser);
      setActiveTabState('dashboard');
      return true;
    } catch (e) {
      console.error('Register error', e);
      return false;
    }
  };

  // Asset CRUD
  const addAsset = async (asset: Omit<Asset, 'id'>) => {
    const created = await apiCreateAsset(asset);
    setAssets(p => [created, ...p]);
    return created;
  };
  const updateAsset = async (id: string, upd: Partial<Asset>) => {
    await apiUpdateAsset(id, upd);
    setAssets(p => p.map(a => (a.id === id ? { ...a, ...upd } : a)));
  };
  const deleteAsset = async (id: string) => {
    await apiDeleteAsset(id);
    setAssets(p => p.filter(a => a.id !== id));
  };

  // Block management
  const addBlock = async (name: string, description?: string) => {
    const created = await apiCreateBlock(name, description);
    setBlocks(p => [...p, created]);
  };
  const updateBlock = async (id: string, name: string, description?: string) => {
    await apiUpdateBlock(id, name, description);
    setBlocks(p => p.map(b => (b.id === id ? { ...b, name, description: description || b.description } : b)));
  };
  const deleteBlock = async (id: string) => {
    await apiDeleteBlockApi(id);
    setBlocks(p => p.filter(b => b.id !== id));
  };

  // Room management
  const addRoom = async (room: Omit<RoomItem, 'id'>) => {
    const created = await apiCreateRoom(room);
    setRooms(p => [...p, { ...room, id: String(created.id) }]);
  };
  const updateRoom = async (id: string, upd: Partial<RoomItem>) => {
    await apiUpdateRoom(id, upd);
    setRooms(p => p.map(r => (r.id === id ? { ...r, ...upd } : r)));
  };
  const deleteRoom = async (id: string) => {
    await apiDeleteRoomApi(id);
    setRooms(p => p.filter(r => r.id !== id));
  };

  const transferAsset = async (assetId: string, toLocation: string, comment?: string, user?: User) => {
      const newLog: AllocationHistory = {
        id: `alloc-${Date.now()}`,
        assetId,
        assetName: assets.find(a => a.id === assetId)?.name || 'Unknown',
        fromLocation: assets.find(a => a.id === assetId)?.location || 'Unknown',
        toLocation,
        fromAssignee: assets.find(a => a.id === assetId)?.assignedTo || 'Unknown',
        toAssignee: toLocation,
        transferredBy: user?.fullName || currentUser?.fullName || 'System',
        date: new Date().toISOString(),
        reason: comment ?? ''
      };
    setAllocationLogs(p => [newLog, ...p]);
  };

  const value: AppContextType = {
    activeTab: activeTabState,
    setActiveTab,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedChairTypeFilter,
    setSelectedChairTypeFilter,
    selectedDepartmentFilter,
    setSelectedDepartmentFilter,
    selectedBuildingFilter,
    setSelectedBuildingFilter,
    selectedAssetId,
    setSelectedAssetId,
    searchQuery,
    setSearchQuery,
    isDarkMode,
    toggleDarkMode,
    currentUser,
    setCurrentUser,
    login,
    loginWithGoogle,
    logout,
    register,
    isConfirmLogoutOpen,
    setIsConfirmLogoutOpen,
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    blocks: derivedBlocks,
    buildingBlocks: derivedBlocks.map(b => b.name),
    addBlock,
    updateBlock,
    deleteBlock,
    rooms: derivedRooms,
    addRoom,
    updateRoom,
    deleteRoom,
    selectedRoomFilter,
    setSelectedRoomFilter,
    selectedBlockFilter,
    setSelectedBlockFilter,
    maintenanceTickets,
      addMaintenanceTicket: async (ticket) => {
        const newTicket = { ...ticket, id: `ticket-${Date.now()}`, requestDate: new Date().toISOString() } as MaintenanceTicket;
        setMaintenanceTickets(p => [newTicket, ...p]);
      },
    updateMaintenanceTicket: async (id, upd) => {},
    allocationLogs,
    transferAsset,
    // New added fields
    historyEvents,
    notifications,
    addNotification: async (notif) => {
      const newNotif = { ...notif, id: `notif-${Date.now()}`, read: false } as NotificationItem;
      setNotifications(p => [newNotif, ...p]);
    },
    markNotificationRead: (id) => {
      setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    },
    clearAllNotifications: () => setNotifications([]),
    settings,
    updateSettings: (upd) => setSettings(s => ({ ...s, ...upd })),
    resetAllData: () => {
      setAssets(INITIAL_ASSETS);
      setSettings(INITIAL_SETTINGS);
      setUsers(INITIAL_USERS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setVendors(INITIAL_VENDORS);
    },
    auditLogs,
    users,
    addUser: async (user) => {
      const newUser = { ...user, id: `user-${Date.now()}` } as User;
      setUsers(p => [newUser, ...p]);
    },
    updateUser: (id, upd) => {
      setUsers(p => p.map(u => u.id === id ? { ...u, ...upd } : u));
    },
    deleteUser: (id) => setUsers(p => p.filter(u => u.id !== id)),
    failedAttemptsMap,
    unlockAccount: (id) => {
      // stub: no-op
    },
    vendors,
    addVendor: async (vendor) => {
      const newVendor = { ...vendor, id: `vendor-${Date.now()}` } as VendorDetails;
      setVendors(p => [newVendor, ...p]);
    },
  } as any;

  if (appError) {
    throw appError;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
        <p className="text-slate-500 font-medium">Initializing Application Data...</p>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
