import React, { useState, useRef, useEffect } from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  QrCode,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Menu,
  X,
  Package,
  Boxes,
  Tag,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CategoryType } from '../../types';

interface NavbarProps {
  onToggleSidebarMobile?: () => void;
  onOpenAddAssetModal?: () => void;
  onOpenQRScanner?: () => void;
  onSelectAsset?: (assetId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebarMobile,
  onOpenAddAssetModal,
  onOpenQRScanner,
  onSelectAsset,
}) => {
  const {
    currentUser,
    isDarkMode,
    toggleDarkMode,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationRead,
    setActiveTab,
    setIsConfirmLogoutOpen,
    assets,
    setSelectedCategoryFilter,
    setSelectedAssetId,
  } = useApp();

  const isSystemMonitor =
    currentUser?.role === 'Monitor' ||
    currentUser?.role?.toLowerCase().includes('monitor') ||
    currentUser?.email?.toLowerCase().includes('monitor');

  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close search dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const CATEGORIES: CategoryType[] = [
    'Bench',
    'Chair',
    'Table',
    'Computer',
    'Projector',
    'Printer',
    'Laboratory Equipment',
    'Sports Equipment',
    'Library Assets',
    'Hostel Assets',
    'Electrical Equipment',
    'Fans',
    'LED Lights',
    'Mini Notice Board',
    'Dustbin',
    'Student Bench',
    'Open Rack',
    'Closed Bureau',
    'Projector Screen',
    'Black Board',
    'Computer Table',
    'Fire Extinguisher',
    'Staff Cabin Table',
    'Staff Table',
    'Small Bench',
    'Long Bench',
    'Drawer',
    'First Aid Kit Box',
    'White Board',
    'Cupboard',
    'Long Lab Switch Table',
    'Lab Stool',
    'Washbasin',
    'Microphone Speaker',
    'Camera',
    'Speaker',
    'Other Assets',
  ];

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // Matching categories from state / list
  const matchingCategories = trimmedQuery
    ? CATEGORIES.filter((cat) => cat.toLowerCase().includes(trimmedQuery))
    : [];

  // Matching assets from state
  const matchingAssets = trimmedQuery
    ? assets
        .filter(
          (a) =>
            a.name.toLowerCase().includes(trimmedQuery) ||
            a.id.toLowerCase().includes(trimmedQuery) ||
            a.category.toLowerCase().includes(trimmedQuery) ||
            a.department.toLowerCase().includes(trimmedQuery) ||
            a.building.toLowerCase().includes(trimmedQuery) ||
            a.roomNumber.toLowerCase().includes(trimmedQuery) ||
            a.assignedTo.toLowerCase().includes(trimmedQuery)
        )
        .slice(0, 5)
    : [];

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    if (onSelectAsset) {
      onSelectAsset(assetId);
    }
    setActiveTab('assets');
    setIsSearchFocused(false);
  };

  const handleSelectCategory = (cat: CategoryType) => {
    setSelectedCategoryFilter(cat);
    setSearchQuery('');
    setActiveTab('assets');
    setIsSearchFocused(false);
  };

  const handleViewAllResults = () => {
    setActiveTab('assets');
    setIsSearchFocused(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleViewAllResults();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Hamburger (mobile) + College Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <CollegeLogo size="md" variant="icon-only" />
            <div className="hidden sm:block">
              <div className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight font-display tracking-tight">
                Adithya Institute of Technology
              </div>
              <div className="text-[10px] badge-bold text-slate-600 dark:text-slate-400 tracking-wider">
                CAMS – Smart Asset Monitoring System
              </div>
            </div>
          </div>
        </div>

        {/* Center: Search Bar with Suggestions Dropdown */}
        <div className="flex-1 max-w-md mx-2 relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search assets by ID, name, building, department..."
              className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-10 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-800 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-800">
              
              {/* Category Suggestions Section */}
              {matchingCategories.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-slate-700 dark:text-slate-300" />
                    Categories ({matchingCategories.length})
                  </div>
                  <div className="mt-1 space-y-1">
                    {matchingCategories.map((cat) => {
                      const count = assets.filter((a) => a.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => handleSelectCategory(cat)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                              <Boxes className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                              {cat}
                            </span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {count} {count === 1 ? 'asset' : 'assets'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Asset Suggestions Section */}
              {matchingAssets.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Package className="w-3 h-3 text-emerald-500" />
                    Matching Assets ({matchingAssets.length})
                  </div>
                  <div className="mt-1 space-y-1">
                    {matchingAssets.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => handleSelectAsset(asset.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                          <div className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 shrink-0">
                            {asset.id}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-slate-900 dark:group-hover:text-white">
                              {asset.name}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1.5">
                              <span>{asset.category}</span>
                              <span>•</span>
                              <span>{asset.building} ({asset.roomNumber})</span>
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          asset.status === 'Active' || asset.status === 'In Use'
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                            : asset.status === 'Under Maintenance'
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                            : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                        }`}>
                          {asset.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Matches Found State */}
              {matchingCategories.length === 0 && matchingAssets.length === 0 && (
                <div className="p-6 text-center">
                  <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No matching assets or categories
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Try searching by asset ID, category, or location
                  </div>
                </div>
              )}

              {/* Footer / Press Enter Action */}
              <div className="p-2 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleViewAllResults}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    View all search results in Asset Management
                  </span>
                  <div className="flex items-center gap-1 text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md shadow-xs text-slate-500 font-mono">
                    Enter <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Right: Quick Actions, Theme, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Asset Button */}
          {isSystemMonitor && (
            <button
              onClick={onOpenAddAssetModal}
              className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Add New Asset"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Asset</span>
            </button>
          )}

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationsDropdown(!showNotificationsDropdown);
                setShowUserDropdown(false);
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    Notifications ({notifications.length})
                  </div>
                  <button
                    onClick={() => {
                      setShowNotificationsDropdown(false);
                      setActiveTab('notifications');
                    }}
                    className="text-xs text-slate-900 dark:text-white font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-2 max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800/50">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">No notifications</div>
                  ) : (
                    notifications.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          markNotificationRead(item.id);
                          setShowNotificationsDropdown(false);
                          setActiveTab('notifications');
                        }}
                        className={`pt-2 cursor-pointer p-2 rounded-xl transition-colors ${
                          !item.read ? 'bg-slate-100/80 dark:bg-slate-800/80' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {item.type === 'alert' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                          {item.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                          {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                          {item.type === 'info' && <Clock className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {item.message}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 font-mono">{item.timestamp}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotificationsDropdown(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                }
                alt={currentUser?.fullName || 'User'}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-slate-300 dark:ring-slate-700"
              />
              <div className="hidden lg:block text-left pr-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {currentUser?.fullName || 'Guest User'}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wider">
                  {currentUser?.role || 'Staff'}
                </div>
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{currentUser?.fullName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded text-[10px] font-semibold">
                    {currentUser?.department}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setActiveTab('profile');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    User Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setActiveTab('settings');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    System Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setIsConfirmLogoutOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl mt-1"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
