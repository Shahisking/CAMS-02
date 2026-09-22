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
  Category,
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
  fetchMaintenanceTickets,
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
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  createMaintenanceTicket as apiCreateMaintenanceTicket,
  updateMaintenanceTicketApi,
  createNotificationApi,
  markNotificationReadApi,
  clearAllNotificationsApi,
  createAllocationApi,
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
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
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
      code: typeof b === 'string' ? b.substring(0, 3).toUpperCase() : 'BLK',
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
          roomName: `Room ${a.roomNumber}`,
          floor: 'First Floor',
          department: a.department || 'General',
          roomType: 'Classroom',
          capacity: 60,
          status: 'Occupied',
        });
      }
    });
    return Array.from(uniqueRoomsMap.values());
  }, [rooms, assets]);

  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(INITIAL_MAINTENANCE_TICKETS);
  // Added state for users
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [allocationLogs, setAllocationLogs] = useState<AllocationHistory[]>(INITIAL_ALLOCATION_LOGS);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>(INITIAL_HISTORY_EVENTS);

  const [categories, setCategories] = useState<Category[]>([
    { id: 'cat-1', name: 'Computer', icon: 'Monitor', description: 'Workstations, All-In-One PCs, Servers & Thin Clients', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-2', name: 'Projector', icon: 'Projector', description: 'Overhead HD Projectors, Smart Screens & Interactive Displays', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-3', name: 'Printer', icon: 'Printer', description: 'Laser Printers, Copiers, 3D Printers & Scanners', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-4', name: 'Chair', icon: 'Armchair', description: 'Manage all types of chairs including normal, plastic, cushion, and rolling chairs.', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-5', name: 'Table', icon: 'Table', description: 'Computer Lab Workbenches, Conference Tables & Faculty Desks', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-6', name: 'Laboratory Equipment', icon: 'FlaskConical', description: 'Oscilloscopes, CNC Machines, Surveying Total Stations & Testers', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-7', name: 'Sports Equipment', icon: 'Trophy', description: 'Badminton Courts, Cricket Nets, Gym Equipment & Game Tables', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-8', name: 'Library Assets', icon: 'BookOpen', description: 'Steel Bookshelves, RFID Kiosks, Reading Desks & Digital Catalogues', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-9', name: 'Hostel Assets', icon: 'BedDouble', description: 'Double Bunk Beds, Locker Units, Study Units & Mess Furniture', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-10', name: 'Electrical Equipment', icon: 'Zap', description: 'Power Switch Panels, UPS Systems, Motor Testing Benches', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-11', name: 'Fans', icon: 'Fan', description: 'Ceiling fans, wall fans, exhaust fans & pedestal fans', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-12', name: 'LED Lights', icon: 'Lightbulb', description: 'LED tube lights, bulbs, panel lights & outdoor lighting', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-13', name: 'Mini Notice Board', icon: 'Clipboard', description: 'Cork boards, whiteboards & glass notice boards', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-14', name: 'Dustbin', icon: 'Trash2', description: 'Plastic, metal, dry/wet waste & recycling bins', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-15', name: 'Student Bench', icon: 'Sofa', description: 'Wooden and metal benches for students', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-16', name: 'Open Rack', icon: 'Archive', description: 'Open shelving units and storage racks', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-17', name: 'Closed Bureau', icon: 'Archive', description: 'Closed storage cabinets and almirahs', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-18', name: 'Projector Screen', icon: 'Presentation', description: 'Pull-down and motorized projector screens', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-19', name: 'Black Board', icon: 'Columns', description: 'Classic blackboards and chalkboards', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-20', name: 'Computer Table', icon: 'Table', description: 'Specialized tables for computer labs', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-21', name: 'Fire Extinguisher', icon: 'HelpCircle', description: 'Safety equipment and fire extinguishers', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-22', name: 'Staff Cabin Table', icon: 'Table', description: 'Premium tables for staff cabins', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-23', name: 'Staff Table', icon: 'Table', description: 'Standard desks for faculty and staff', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-24', name: 'Small Bench', icon: 'Sofa', description: 'Small seating benches', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-25', name: 'Long Bench', icon: 'Sofa', description: 'Long seating benches for corridors and common areas', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-26', name: 'Drawer', icon: 'Archive', description: 'Storage drawers and filing cabinets', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-27', name: 'First Aid Kit Box', icon: 'BriefcaseMedical', description: 'Medical supplies and first aid kits', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-28', name: 'White Board', icon: 'Presentation', description: 'Dry-erase whiteboards and smart boards', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-29', name: 'Cupboard', icon: 'Columns', description: 'Wooden and steel cupboards', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-30', name: 'Long Lab Switch Table', icon: 'Zap', description: 'Laboratory tables with integrated electrical switches', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-31', name: 'Lab Stool', icon: 'Armchair', description: 'High stools for laboratories', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-32', name: 'Washbasin', icon: 'Droplets', description: 'Washbasins and plumbing fixtures', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-33', name: 'Microphone Speaker', icon: 'Mic', description: 'Microphones and audio speaker systems', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-34', name: 'Camera', icon: 'Camera', description: 'DSLRs, webcams, security cameras, and video equipment', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-35', name: 'Speaker', icon: 'Speaker', description: 'Bluetooth speakers, PA systems, and monitors', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'cat-36', name: 'Other Assets', icon: 'Boxes', description: 'Miscellaneous Facilities, Air Conditioners & Signage', isCustom: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]);

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat => (cat.id === id ? { ...cat, ...updates, updatedAt: new Date().toISOString() } : cat)));
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };
  

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
        const [a, al, h, n, u, b, r, mt] = await Promise.all([
          fetchAssets(),
          fetchAllocationLogs(),
          fetchHistoryEvents(),
          fetchNotifications(),
          fetchUsers(),
          fetchBlocks(),
          fetchRooms(),
          fetchMaintenanceTickets(),
        ]);
        setAssets(a.length ? a : INITIAL_ASSETS);
        setAllocationLogs(al.length ? al : INITIAL_ALLOCATION_LOGS);
        setHistoryEvents(h.length ? h : INITIAL_HISTORY_EVENTS);
        setNotifications(n.length ? n : INITIAL_NOTIFICATIONS);
        setUsers(u.length ? u : INITIAL_USERS);
        setBlocks(b);
        setRooms(r);
        setMaintenanceTickets(mt.length ? mt : INITIAL_MAINTENANCE_TICKETS);
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
    const password = passwordInput || '';   // do NOT trim — bcrypt compares the exact string
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
    } catch (e: any) {
      console.error('Login error', e);
      // Surface the real backend error (401 invalid credentials, 403 role
      // mismatch, 500 server error, 404 missing API, network failure, …)
      // instead of masking everything as an invalid password.
      if (e?.response) {
        const serverMessage = e.response?.data?.message;
        throw new Error(serverMessage || `Login failed (HTTP ${e.response.status}).`);
      }
      throw new Error('Cannot reach the authentication server. Please try again later.');
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
    const result = await apiRegister(user);
    // Backend register does not return a token — redirect to login
    setActiveTabState('login');
    return true;
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
      const asset = assets.find(a => a.id === assetId);
      const allocationData = {
        assetId,
        assetName: asset?.name || 'Unknown',
        fromLocation: asset?.location || asset?.roomNumber || 'Unknown',
        toLocation,
        fromAssignee: asset?.assignedTo || 'Unknown',
        toAssignee: toLocation,
        transferredBy: user?.fullName || currentUser?.fullName || 'System',
        date: new Date().toISOString(),
        reason: comment ?? '',
      };
      const created = await createAllocationApi(allocationData);
      const newLog: AllocationHistory = {
        ...allocationData,
        id: created.id || `alloc-${Date.now()}`,
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
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    selectedRoomFilter,
    setSelectedRoomFilter,
    selectedBlockFilter,
    setSelectedBlockFilter,
    maintenanceTickets,
      addMaintenanceTicket: async (ticket) => {
        const created = await apiCreateMaintenanceTicket(ticket);
        setMaintenanceTickets(p => [created, ...p]);
      },
    updateMaintenanceTicket: async (id, upd) => {
      const updated = await updateMaintenanceTicketApi(id, upd);
      setMaintenanceTickets(p => p.map(t => (t.id === id ? { ...t, ...updated } : t)));
    },
    allocationLogs,
    transferAsset,
    // New added fields
    historyEvents,
    notifications,
    addNotification: async (notif) => {
      const created = await createNotificationApi({
        title: notif.title,
        message: notif.message,
        type: notif.type,
        category: notif.category,
        assetId: notif.assetId,
        recipientRole: (notif as any).recipientRole,
      });
      const newNotif: NotificationItem = {
        ...notif,
        id: created.id || `notif-${Date.now()}`,
        read: false,
      };
      setNotifications(p => [newNotif, ...p]);
    },
    markNotificationRead: async (id) => {
      await markNotificationReadApi(id);
      setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    },
    clearAllNotifications: async () => {
      await clearAllNotificationsApi();
      setNotifications([]);
    },
    settings,
    updateSettings: (upd) => setSettings(s => ({ ...s, ...upd })),
    resetAllData: () => {
      setAssets(INITIAL_ASSETS);
      setSettings(INITIAL_SETTINGS);
      setUsers(INITIAL_USERS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
    },
    auditLogs,
    users,
    addUser: async (user) => {
      try {
        const created = await apiCreateUser({
          email: user.email,
          password: (user as any).password || 'Temp@123',
          name: user.fullName,
          role: user.role,
          department: user.department,
          staffId: user.staffId,
        });
        const mapped = {
          id: String(created.id),
          fullName: created.fullName || created.name || '',
          email: created.email,
          department: created.department || 'Administrative Office',
          staffId: created.staffId || '',
          mobile: created.mobile || '',
          role: created.role || 'Staff',
          avatar: created.avatar || '',
          status: created.status || 'Active',
          lastLogin: created.lastLogin || '',
        } as User;
        setUsers(p => [mapped, ...p]);
      } catch (err) {
        console.error('addUser API error:', err);
        throw err;
      }
    },
    updateUser: async (id, upd) => {
      try {
        await apiUpdateUser(id, upd);
        setUsers(p => p.map(u => (u.id === id ? { ...u, ...upd } : u)));
      } catch (err) {
        console.error('updateUser API error:', err);
        throw err;
      }
    },
    deleteUser: (id) => setUsers(p => p.filter(u => u.id !== id)),
    failedAttemptsMap,
    unlockAccount: (id) => {
      // stub: no-op
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
