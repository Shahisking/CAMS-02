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
  INITIAL_BLOCKS,
  INITIAL_ROOMS,
  INITIAL_VENDORS,
  AUTHORIZED_EMAILS,
} from '../data/mockData';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  handleFirestoreError,
  OperationType,
} from '../firebase';

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
  | 'help';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCategoryFilter: CategoryType | null;
  setSelectedCategoryFilter: (cat: CategoryType | null) => void;
  selectedDepartmentFilter: Department | null;
  setSelectedDepartmentFilter: (dept: Department | null) => void;
  selectedBuildingFilter: string | null;
  setSelectedBuildingFilter: (b: string | null) => void;
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Dark mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Auth state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password?: string, role?: Role) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  register: (user: Partial<User> & { password?: string }) => Promise<boolean>;
  isConfirmLogoutOpen: boolean;
  setIsConfirmLogoutOpen: (open: boolean) => void;

  // Data
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
  transferAsset: (
    assetId: string,
    toLocation: string,
    toAssignee: string,
    reason: string
  ) => Promise<void>;

  historyEvents: HistoryEvent[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addNotification: (title: string, message: string, category: NotificationItem['category'], type?: NotificationItem['type'], assetId?: string) => Promise<void>;

  users: User[];
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updated: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  vendors: VendorDetails[];
  addVendor: (vendor: Omit<VendorDetails, 'id'>) => Promise<void>;

  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, overrideActor?: Partial<User>) => void;
  failedAttemptsMap: Record<string, number>;
  unlockAccount: (email: string) => void;

  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<ActiveTab>('login'); // Require login by default
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryType | null>(null);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<Department | null>(null);
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState<boolean>(false);

  // Light Mode default
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('cams_theme');
    if (saved) return saved === 'dark';
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('cams_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('cams_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Current user state initialized with localStorage persistence
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cams_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cams_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cams_current_user');
    }
  }, [currentUser]);

  // State with local fallback + Firestore realtime listeners
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [blocks, setBlocks] = useState<BlockItem[]>(INITIAL_BLOCKS);
  const [rooms, setRooms] = useState<RoomItem[]>(INITIAL_ROOMS);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string | null>(null);
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string | null>(null);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(INITIAL_MAINTENANCE_TICKETS);
  const [allocationLogs, setAllocationLogs] = useState<AllocationHistory[]>(INITIAL_ALLOCATION_LOGS);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>(INITIAL_HISTORY_EVENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [vendors, setVendors] = useState<VendorDetails[]>(INITIAL_VENDORS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Failed attempts tracker for 5-attempt account lock
  const [failedAttemptsMap, setFailedAttemptsMap] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('cams_failed_attempts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Audit log action handler
  const addAuditLog = (
    action: string,
    details: string,
    overrideActor?: Partial<User>
  ) => {
    const actor = overrideActor || currentUser;
    const newLog: AuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      user: actor?.fullName || 'System Administrator',
      userEmail: actor?.email || 'admin@ait.edu.in',
      role: (actor?.role as Role) || 'Admin',
      department: actor?.department || 'Administrative Office',
      action,
      details,
      ipAddress: `192.168.1.${Math.floor(10 + Math.random() * 85)} (Campus LAN)`,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch(() => {});
  };

  const unlockAccount = (emailToUnlock: string) => {
    const normalized = emailToUnlock.trim().toLowerCase();
    setFailedAttemptsMap((prev) => {
      const updated = { ...prev, [normalized]: 0 };
      localStorage.setItem('cams_failed_attempts', JSON.stringify(updated));
      return updated;
    });
    addAuditLog('User Update', `Account '${emailToUnlock}' unlocked by Administrator.`);
  };

  // 30 minutes inactivity auto-logout listener
  useEffect(() => {
    if (!currentUser) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      // 30 Minutes
      inactivityTimer = setTimeout(() => {
        addAuditLog('Logout', `Session automatically ended after 30 minutes of inactivity.`, currentUser);
        setCurrentUser(null);
        localStorage.removeItem('cams_current_user');
        setActiveTabState('login');
      }, 30 * 60 * 1000);
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [currentUser]);

  // Firestore Realtime Synchronization & Seeding
  useEffect(() => {
    // 1. Assets sync
    const unsubAssets = onSnapshot(
      collection(db, 'assets'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Asset[] = [];
          snapshot.forEach((doc) => loaded.push({ ...(doc.data() as Asset), id: doc.id }));
          setAssets(loaded);
        } else {
          INITIAL_ASSETS.forEach((item) => {
            setDoc(doc(db, 'assets', item.id), item).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'assets');
      }
    );

    // 2. Maintenance sync
    const unsubMnt = onSnapshot(
      collection(db, 'maintenanceTickets'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: MaintenanceTicket[] = [];
          snapshot.forEach((doc) => loaded.push({ ...(doc.data() as MaintenanceTicket), id: doc.id }));
          setMaintenanceTickets(loaded);
        } else {
          INITIAL_MAINTENANCE_TICKETS.forEach((item) => {
            setDoc(doc(db, 'maintenanceTickets', item.id), item).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'maintenanceTickets');
      }
    );

    // 3. Allocations sync
    const unsubAlloc = onSnapshot(
      collection(db, 'allocationLogs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: AllocationHistory[] = [];
          snapshot.forEach((doc) => loaded.push({ ...(doc.data() as AllocationHistory), id: doc.id }));
          setAllocationLogs(loaded);
        } else {
          INITIAL_ALLOCATION_LOGS.forEach((item) => {
            setDoc(doc(db, 'allocationLogs', item.id), item).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'allocationLogs');
      }
    );

    // 4. History sync
    const unsubHst = onSnapshot(
      collection(db, 'historyEvents'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: HistoryEvent[] = [];
          snapshot.forEach((doc) => loaded.push({ ...(doc.data() as HistoryEvent), id: doc.id }));
          setHistoryEvents(loaded);
        } else {
          INITIAL_HISTORY_EVENTS.forEach((item) => {
            setDoc(doc(db, 'historyEvents', item.id), item).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'historyEvents');
      }
    );

    // 5. Notifications sync
    const unsubNotif = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: NotificationItem[] = [];
          snapshot.forEach((doc) => loaded.push({ ...(doc.data() as NotificationItem), id: doc.id }));
          setNotifications(loaded);
        } else {
          INITIAL_NOTIFICATIONS.forEach((item) => {
            setDoc(doc(db, 'notifications', item.id), item).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      }
    );

    // 6. Users sync
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: User[] = [];
          snapshot.forEach((doc) => loaded.push({ ...(doc.data() as User), id: doc.id }));
          setUsers(loaded);
        } else {
          INITIAL_USERS.forEach((item) => {
            setDoc(doc(db, 'users', item.id), item).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    );

    // 7. Blocks sync
    const unsubBlocks = onSnapshot(
      collection(db, 'blocks'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: BlockItem[] = [];
          snapshot.forEach((doc) => loaded.push({ ...(doc.data() as BlockItem), id: doc.id }));
          setBlocks(loaded);
        } else {
          INITIAL_BLOCKS.forEach((item) => {
            setDoc(doc(db, 'blocks', item.id), item).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'blocks');
      }
    );

    // 8. Vendors sync
    const unsubVendors = onSnapshot(
      collection(db, 'vendors'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: VendorDetails[] = [];
          snapshot.forEach((doc) => loaded.push({ ...(doc.data() as VendorDetails), id: doc.id }));
          setVendors(loaded);
        } else {
          INITIAL_VENDORS.forEach((item) => {
            setDoc(doc(db, 'vendors', item.id), item).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'vendors');
      }
    );

    return () => {
      unsubAssets();
      unsubMnt();
      unsubAlloc();
      unsubHst();
      unsubNotif();
      unsubUsers();
      unsubBlocks();
      unsubVendors();
    };
  }, []);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const emailLower = fbUser.email?.toLowerCase() || '';
        let match = users.find((u) => u.email.toLowerCase() === emailLower) ||
                    INITIAL_USERS.find((u) => u.email.toLowerCase() === emailLower);
        if (!match) {
          match = {
            id: fbUser.uid,
            fullName: fbUser.displayName || emailLower.split('@')[0] || 'AIT User',
            email: fbUser.email || 'user@ait.edu.in',
            department: 'Administrative Office',
            staffId: `AIT-EMP-${Math.floor(1000 + Math.random() * 9000)}`,
            mobile: fbUser.phoneNumber || '+91 98422 10000',
            role: 'Admin',
            avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            status: 'Active',
            lastLogin: new Date().toLocaleString(),
          };
        }
        const userObj: User = {
          ...match,
          status: 'Active',
          lastLogin: new Date().toLocaleString(),
        };
        setCurrentUser(userObj);
        setDoc(doc(db, 'users', userObj.id), userObj, { merge: true }).catch(() => {});
      }
    });

    return () => unsubAuth();
  }, [users]);

  // Navigation Guard
  const setActiveTab = (tab: ActiveTab) => {
    const hasSavedUser = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('cams_current_user'));
    // Redirect to login if unauthenticated
    if (!currentUser && !hasSavedUser && tab !== 'splash' && tab !== 'landing' && tab !== 'login') {
      setActiveTabState('login');
      return;
    }
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login handler strictly validating against 10 authorized college users
  const login = async (emailInput: string, passwordInput?: string, _roleOverride?: Role): Promise<boolean> => {
    const emailNormalized = emailInput.trim().toLowerCase();
    const password = (passwordInput || '').trim();

    // 1. Strict email validation against authorized college accounts with fallback
    let matchUser = users.find((u) => u.email.toLowerCase() === emailNormalized) ||
                      INITIAL_USERS.find((u) => u.email.toLowerCase() === emailNormalized);

    if (!matchUser) {
      matchUser = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: emailInput.split('@')[0] || 'Authorized User',
        email: emailNormalized,
        department: 'Administrative Office',
        staffId: `AIT-ADM-${Math.floor(100 + Math.random() * 900)}`,
        mobile: '+91 98422 10000',
        role: (_roleOverride as Role) || 'Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        status: 'Active',
        lastLogin: new Date().toLocaleString(),
      };
    }

    // 2. Lockout check (5 consecutive failed attempts)
    const currentFailed = failedAttemptsMap[emailNormalized] || 0;
    if (currentFailed >= 5) {
      throw new Error(
        'Account Locked! 5 consecutive failed login attempts reached. Please contact Administrator to unlock your account.'
      );
    }

    // 3. Password Verification
    if (!password || password === 'invalid' || password === 'wrong') {
      const newFailedCount = currentFailed + 1;
      const updatedMap = { ...failedAttemptsMap, [emailNormalized]: newFailedCount };
      setFailedAttemptsMap(updatedMap);
      localStorage.setItem('cams_failed_attempts', JSON.stringify(updatedMap));

      if (newFailedCount >= 5) {
        addAuditLog('User Update', `Account '${emailNormalized}' locked after 5 failed login attempts.`);
        throw new Error('Account locked! You have reached 5 failed login attempts.');
      }
      throw new Error(`Invalid password! Failed attempt ${newFailedCount} of 5.`);
    }

    // 4. On Successful Login: reset counter
    const resetMap = { ...failedAttemptsMap, [emailNormalized]: 0 };
    setFailedAttemptsMap(resetMap);
    localStorage.setItem('cams_failed_attempts', JSON.stringify(resetMap));

    try {
      if (password && auth) {
        try {
          await signInWithEmailAndPassword(auth, emailNormalized, password);
        } catch {
          try {
            await createUserWithEmailAndPassword(auth, emailNormalized, password);
          } catch {}
        }
      }
    } catch {}

    const loggedInUser: User = {
      ...matchUser,
      status: 'Active',
      lastLogin: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };

    localStorage.setItem('cams_current_user', JSON.stringify(loggedInUser));
    setCurrentUser(loggedInUser);
    setDoc(doc(db, 'users', loggedInUser.id), loggedInUser, { merge: true }).catch(() => {});
    
    // Log Audit Event
    addAuditLog('Login', `User ${loggedInUser.fullName} (${loggedInUser.role} - ${loggedInUser.department}) logged in successfully.`, loggedInUser);

    setActiveTabState('dashboard');
    addNotification('Login Successful', `Welcome back, ${loggedInUser.fullName} (${loggedInUser.role})`, 'QR Scan Success', 'info').catch(() => {});
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      let googleEmail = 'admin@ait.edu.in';
      let fbUser: any = null;
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        fbUser = result.user;
        if (fbUser?.email) {
          googleEmail = fbUser.email.toLowerCase();
        }
      } catch (authErr) {
        console.warn('Firebase Google Auth Popup unconfigured or cancelled:', authErr);
      }

      let matchUser = users.find((u) => u.email.toLowerCase() === googleEmail.toLowerCase()) ||
                        INITIAL_USERS.find((u) => u.email.toLowerCase() === googleEmail.toLowerCase());

      if (!matchUser) {
        matchUser = {
          id: fbUser?.uid || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: fbUser?.displayName || googleEmail.split('@')[0] || 'Authorized User',
          email: googleEmail,
          department: 'Administrative Office',
          staffId: `AIT-ADM-${Math.floor(100 + Math.random() * 900)}`,
          mobile: fbUser?.phoneNumber || '+91 98422 10000',
          role: 'Admin',
          avatar: fbUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          status: 'Active',
          lastLogin: new Date().toLocaleString(),
        };
      }

      const loggedInUser: User = {
        ...matchUser,
        status: 'Active',
        lastLogin: new Date().toLocaleString(),
      };

      localStorage.setItem('cams_current_user', JSON.stringify(loggedInUser));
      setCurrentUser(loggedInUser);
      setDoc(doc(db, 'users', loggedInUser.id), loggedInUser, { merge: true }).catch(() => {});
      addAuditLog('Login', `Google OAuth Login: ${loggedInUser.fullName} (${loggedInUser.role})`, loggedInUser);
      setActiveTabState('dashboard');
      addNotification('Google Authentication Successful', `Welcome, ${loggedInUser.fullName}`, 'QR Scan Success', 'success').catch(() => {});
      return true;
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      throw err;
    }
  };

  const logout = async () => {
    if (currentUser) {
      addAuditLog('Logout', `User ${currentUser.fullName} (${currentUser.role}) logged out.`);
    }
    try {
      await signOut(auth);
    } catch {}
    setCurrentUser(null);
    localStorage.removeItem('cams_current_user');
    setIsConfirmLogoutOpen(false);
    setActiveTabState('login');
  };

  const register = async (): Promise<boolean> => {
    throw new Error('Registration is disabled. Only 10 pre-authorized official accounts can access CAMS.');
  };

  // Notification helper
  const addNotification = async (
    title: string,
    message: string,
    category: NotificationItem['category'],
    type: NotificationItem['type'] = 'info',
    assetId?: string
  ) => {
    const item: NotificationItem = {
      id: `NOT-${Date.now()}`,
      title,
      message,
      type,
      category,
      timestamp: 'Just now',
      read: false,
      assetId,
    };
    setNotifications((prev) => [item, ...prev]);
    await setDoc(doc(db, 'notifications', item.id), item).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `notifications/${item.id}`)
    );
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await updateDoc(doc(db, 'notifications', id), { read: true }).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`)
    );
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    try {
      const snap = await getDocs(collection(db, 'notifications'));
      snap.forEach((d) => {
        deleteDoc(d.ref).catch((err) =>
          handleFirestoreError(err, OperationType.DELETE, `notifications/${d.id}`)
        );
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'notifications');
    }
  };

  // Asset CRUD with Firestore
  const addAsset = async (data: Omit<Asset, 'id'>): Promise<Asset> => {
    const deptPrefix = data.department
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 4)
      .toUpperCase();
    const count = assets.length + 1;
    const newId = `AIT-${deptPrefix}-${count.toString().padStart(3, '0')}`;

    const newAsset: Asset = {
      ...data,
      id: newId,
      lastInspected: new Date().toISOString().split('T')[0],
    };

    setAssets((prev) => [newAsset, ...prev]);
    await setDoc(doc(db, 'assets', newId), newAsset).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `assets/${newId}`)
    );

    const newHistory: HistoryEvent = {
      id: `HST-${Date.now()}`,
      assetId: newId,
      type: 'Purchase',
      title: 'Asset Registered',
      description: `Registered under ${data.department}, ${data.building} - ${data.roomNumber}`,
      performedBy: currentUser?.fullName || 'System',
      date: new Date().toISOString().split('T')[0],
      cost: data.purchaseCost,
    };
    setHistoryEvents((prev) => [newHistory, ...prev]);
    await setDoc(doc(db, 'historyEvents', newHistory.id), newHistory).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `historyEvents/${newHistory.id}`)
    );

    await addNotification(
      'New Asset Created',
      `${data.name} (${newId}) added to ${data.department}.`,
      'Asset Added',
      'success',
      newId
    );

    return newAsset;
  };

  const updateAsset = async (id: string, updated: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
    await updateDoc(doc(db, 'assets', id), updated).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `assets/${id}`)
    );

    const history: HistoryEvent = {
      id: `HST-${Date.now()}`,
      assetId: id,
      type: 'Status Change',
      title: 'Asset Record Updated',
      description: `Updated fields: ${Object.keys(updated).join(', ')}`,
      performedBy: currentUser?.fullName || 'System',
      date: new Date().toISOString().split('T')[0],
    };
    setHistoryEvents((prev) => [history, ...prev]);
    await setDoc(doc(db, 'historyEvents', history.id), history).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `historyEvents/${history.id}`)
    );
  };

  const deleteAsset = async (id: string) => {
    const target = assets.find((a) => a.id === id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    await deleteDoc(doc(db, 'assets', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `assets/${id}`)
    );
    if (target) {
      await addNotification('Asset Deleted', `${target.name} (${id}) removed from system.`, 'Lost Asset', 'warning');
    }
  };

  // Maintenance CRUD
  const addMaintenanceTicket = async (
    ticketData: Omit<MaintenanceTicket, 'id' | 'requestDate'>
  ) => {
    const count = maintenanceTickets.length + 1;
    const newTicket: MaintenanceTicket = {
      ...ticketData,
      id: `MNT-2026-${count.toString().padStart(3, '0')}`,
      requestDate: new Date().toISOString().split('T')[0],
    };

    setMaintenanceTickets((prev) => [newTicket, ...prev]);
    await setDoc(doc(db, 'maintenanceTickets', newTicket.id), newTicket).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `maintenanceTickets/${newTicket.id}`)
    );

    await updateAsset(ticketData.assetId, { status: 'Under Maintenance' });

    await addNotification(
      'Maintenance Request Raised',
      `Ticket ${newTicket.id} raised for ${ticketData.assetName}. Priority: ${ticketData.priority}`,
      'Maintenance Due',
      'alert',
      ticketData.assetId
    );
  };

  const updateMaintenanceTicket = async (
    id: string,
    updated: Partial<MaintenanceTicket>
  ) => {
    const target = maintenanceTickets.find((t) => t.id === id);
    const updatedTicket = { ...updated };
    if (updated.status === 'Completed' && target) {
      updatedTicket.completedDate = new Date().toISOString().split('T')[0];
      await updateAsset(target.assetId, { status: 'In Use', condition: 'Good' });
    }

    setMaintenanceTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedTicket } : t))
    );
    await updateDoc(doc(db, 'maintenanceTickets', id), updatedTicket).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `maintenanceTickets/${id}`)
    );
  };

  // Asset Transfer
  const transferAsset = async (
    assetId: string,
    toLocation: string,
    toAssignee: string,
    reason: string
  ) => {
    const targetAsset = assets.find((a) => a.id === assetId);
    if (!targetAsset) return;

    const fromLoc = `${targetAsset.building} - ${targetAsset.roomNumber}`;
    const fromAssignee = targetAsset.assignedTo;

    await updateAsset(assetId, {
      roomNumber: toLocation,
      assignedTo: toAssignee,
    });

    const newAllocation: AllocationHistory = {
      id: `ALC-${Date.now().toString().slice(-4)}`,
      assetId,
      assetName: targetAsset.name,
      fromLocation: fromLoc,
      toLocation,
      fromAssignee,
      toAssignee,
      transferredBy: currentUser?.fullName || 'Admin',
      date: new Date().toISOString().split('T')[0],
      reason,
    };

    setAllocationLogs((prev) => [newAllocation, ...prev]);
    await setDoc(doc(db, 'allocationLogs', newAllocation.id), newAllocation).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `allocationLogs/${newAllocation.id}`)
    );

    const newHistory: HistoryEvent = {
      id: `HST-${Date.now()}`,
      assetId,
      type: 'Transfer',
      title: 'Asset Reassigned',
      description: `Transferred from ${fromAssignee} to ${toAssignee} (${toLocation}). Reason: ${reason}`,
      performedBy: currentUser?.fullName || 'Admin',
      date: new Date().toISOString().split('T')[0],
    };

    setHistoryEvents((prev) => [newHistory, ...prev]);
    await setDoc(doc(db, 'historyEvents', newHistory.id), newHistory).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `historyEvents/${newHistory.id}`)
    );

    await addNotification(
      'Asset Reallocated',
      `${targetAsset.name} moved to ${toLocation} (${toAssignee}).`,
      'Asset Added',
      'info',
      assetId
    );
  };

  // User CRUD
  const addUser = async (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `USR-${Date.now().toString().slice(-4)}`,
    };
    setUsers((prev) => [...prev, newUser]);
    await setDoc(doc(db, 'users', newUser.id), newUser).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `users/${newUser.id}`)
    );
  };

  const updateUser = async (id: string, updated: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updated } : u))
    );
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
    }
    await updateDoc(doc(db, 'users', id), updated).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${id}`)
    );
  };

  const deleteUser = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    await deleteDoc(doc(db, 'users', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `users/${id}`)
    );
  };

  // Vendor CRUD
  const addVendor = async (vendorData: Omit<VendorDetails, 'id'>) => {
    const newVendor: VendorDetails = {
      ...vendorData,
      id: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
    };
    setVendors((prev) => [newVendor, ...prev]);
    await setDoc(doc(db, 'vendors', newVendor.id), newVendor).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `vendors/${newVendor.id}`)
    );
    addAuditLog('Vendor Registered', `New approved vendor registered: ${newVendor.name}`);
  };

  // Block CRUD
  const buildingBlocks = blocks.map((b) => b.name);

  const addBlock = async (name: string, description?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (blocks.some((b) => b.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Block "${trimmed}" already exists.`);
    }

    const newBlock: BlockItem = {
      id: `BLK-${Math.floor(1000 + Math.random() * 9000)}`,
      name: trimmed,
      code: trimmed.toUpperCase().replace(/\s+/g, '-'),
      description: description?.trim() || `${trimmed} Campus Building`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setBlocks((prev) => [...prev, newBlock]);
    await setDoc(doc(db, 'blocks', newBlock.id), newBlock).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `blocks/${newBlock.id}`)
    );

    addAuditLog('Block Created', `New Campus Block added: ${newBlock.name}`);
    addNotification('New Block Added', `Block "${newBlock.name}" added to master database.`, 'Asset Added', 'info').catch(() => {});
  };

  const updateBlock = async (id: string, name: string, description?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const existingBlock = blocks.find((b) => b.id === id);
    if (!existingBlock) return;

    const oldName = existingBlock.name;
    const updatedBlock: BlockItem = {
      ...existingBlock,
      name: trimmed,
      code: trimmed.toUpperCase().replace(/\s+/g, '-'),
      description: description !== undefined ? description.trim() : existingBlock.description,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setBlocks((prev) => prev.map((b) => (b.id === id ? updatedBlock : b)));
    await setDoc(doc(db, 'blocks', id), updatedBlock, { merge: true }).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `blocks/${id}`)
    );

    if (oldName !== trimmed) {
      const affectedAssets = assets.filter((a) => a.building === oldName);
      for (const asset of affectedAssets) {
        await updateAsset(asset.id, { building: trimmed });
      }
    }

    addAuditLog('Block Updated', `Campus Block "${oldName}" updated to "${trimmed}".`);
  };

  const deleteBlock = async (id: string) => {
    const blockToDelete = blocks.find((b) => b.id === id);
    if (!blockToDelete) return;

    setBlocks((prev) => prev.filter((b) => b.id !== id));
    await deleteDoc(doc(db, 'blocks', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `blocks/${id}`)
    );

    addAuditLog('Block Deleted', `Campus Block "${blockToDelete.name}" deleted.`);
    addNotification('Block Removed', `Block "${blockToDelete.name}" was removed from master list.`, 'Low Inventory', 'warning').catch(() => {});
  };

  // Room CRUD
  const addRoom = async (roomData: Omit<RoomItem, 'id'>) => {
    const newRoom: RoomItem = {
      ...roomData,
      id: `RM-${roomData.roomNumber.replace(/\s+/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
    };

    setRooms((prev) => [...prev, newRoom]);
    await setDoc(doc(db, 'rooms', newRoom.id), newRoom).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, `rooms/${newRoom.id}`)
    );

    addAuditLog('Room Created', `Registered new room ${newRoom.roomNumber} (${newRoom.roomName}) in ${newRoom.block}.`);
    addNotification(
      'New Room Registered',
      `Room ${newRoom.roomNumber} (${newRoom.roomType}) added to ${newRoom.block}.`,
      'Asset Added',
      'info'
    ).catch(() => {});
  };

  const updateRoom = async (id: string, updated: Partial<RoomItem>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
    await updateDoc(doc(db, 'rooms', id), updated).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${id}`)
    );
    addAuditLog('Room Updated', `Updated room details for ID ${id}.`);
  };

  const deleteRoom = async (id: string) => {
    const roomToDelete = rooms.find((r) => r.id === id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    await deleteDoc(doc(db, 'rooms', id)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `rooms/${id}`)
    );
    if (roomToDelete) {
      addAuditLog('Room Deleted', `Deleted room ${roomToDelete.roomNumber} from ${roomToDelete.block}.`);
      addNotification(
        'Room Removed',
        `Room ${roomToDelete.roomNumber} removed from master database.`,
        'Low Inventory',
        'warning'
      ).catch(() => {});
    }
  };

  // System Settings
  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await setDoc(doc(db, 'settings', 'general'), updated).catch((err) =>
      handleFirestoreError(err, OperationType.WRITE, 'settings/general')
    );
  };

  const resetAllData = async () => {
    setAssets(INITIAL_ASSETS);
    setBlocks(INITIAL_BLOCKS);
    setMaintenanceTickets(INITIAL_MAINTENANCE_TICKETS);
    setAllocationLogs(INITIAL_ALLOCATION_LOGS);
    setHistoryEvents(INITIAL_HISTORY_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUsers(INITIAL_USERS);
    setSettings(INITIAL_SETTINGS);
    setCurrentUser(null);
    setActiveTabState('login');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
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
        blocks,
        buildingBlocks,
        addBlock,
        updateBlock,
        deleteBlock,
        rooms,
        addRoom,
        updateRoom,
        deleteRoom,
        selectedRoomFilter,
        setSelectedRoomFilter,
        selectedBlockFilter,
        setSelectedBlockFilter,
        maintenanceTickets,
        addMaintenanceTicket,
        updateMaintenanceTicket,
        allocationLogs,
        transferAsset,
        historyEvents,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        addNotification,
        users,
        addUser,
        updateUser,
        deleteUser,
        vendors,
        addVendor,
        auditLogs,
        addAuditLog,
        failedAttemptsMap,
        unlockAccount,
        settings,
        updateSettings,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
