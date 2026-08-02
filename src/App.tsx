import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/splash/SplashScreen';
import { LandingPage } from './components/landing/LandingPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { ConfirmLogoutModal } from './components/common/ConfirmLogoutModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { AssetManagementView } from './components/assets/AssetManagementView';
import { AddAssetModal } from './components/assets/AddAssetModal';
import { AssetDetailModal } from './components/assets/AssetDetailModal';
import { CategoriesView } from './components/categories/CategoriesView';
import { DepartmentsView } from './components/departments/DepartmentsView';
import { BlocksView } from './components/blocks/BlocksView';
import { VendorsView } from './components/vendors/VendorsView';
import { AllocationView } from './components/allocation/AllocationView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { QRScannerModal } from './components/qr/QRScannerModal';
import { AssetHistoryView } from './components/history/AssetHistoryView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { UserManagementView } from './components/users/UserManagementView';
import { SettingsView } from './components/settings/SettingsView';
import { ProfileView } from './components/profile/ProfileView';
import { HelpSupportView } from './components/help/HelpSupportView';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useApp();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [selectedAssetDetailId, setSelectedAssetDetailId] = useState<string | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Splash Screen view
  if (activeTab === 'splash') {
    return <SplashScreen onFinish={() => setActiveTab('login')} />;
  }

  // Login requirement check: If user is not authenticated, render LoginPage directly
  if (!currentUser) {
    if (activeTab === 'register') {
      return (
        <RegisterModal
          isOpen={true}
          onClose={() => setActiveTab('login')}
          onSwitchToLogin={() => setActiveTab('login')}
        />
      );
    }
    return <LoginPage onClose={() => setActiveTab('dashboard')} />;
  }

  // Full-screen Dedicated Login Page view if explicitly navigated to
  if (activeTab === 'login') {
    return <LoginPage onClose={() => setActiveTab('dashboard')} />;
  }

  // Landing Page view (for unauthenticated or guests exploring)
  if (activeTab === 'landing') {
    return (
      <>
        <LandingPage
          onLoginClick={() => setActiveTab('login')}
          onRegisterClick={() => setIsRegisterOpen(true)}
        />
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onSwitchToRegister={() => {
            setIsLoginOpen(false);
            setIsRegisterOpen(true);
          }}
        />
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onSwitchToLogin={() => {
            setIsRegisterOpen(false);
            setActiveTab('login');
          }}
        />
      </>
    );
  }

  // Main Dashboard Application Layout
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-200">
      <Navbar
        onToggleSidebarMobile={() => setIsMobileSidebarOpen((prev) => !prev)}
        onOpenAddAssetModal={() => setIsAddAssetOpen(true)}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        onSelectAsset={(id) => setSelectedAssetDetailId(id)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenAddAssetModal={() => setIsAddAssetOpen(true)}
          onOpenQRScanner={() => setIsQRScannerOpen(true)}
          onOpenLogoutModal={() => setIsLogoutConfirmOpen(true)}
        />

        <main className="flex-1 overflow-y-auto pb-16">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenAddAssetModal={() => setIsAddAssetOpen(true)}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
            />
          )}

          {activeTab === 'assets' && (
            <AssetManagementView
              onOpenAddAssetModal={() => setIsAddAssetOpen(true)}
              onSelectAsset={(id) => setSelectedAssetDetailId(id)}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
            />
          )}

          {activeTab === 'departments' && (
            <DepartmentsView onOpenAddAssetModal={() => setIsAddAssetOpen(true)} />
          )}

          {activeTab === 'blocks' && <BlocksView />}

          {activeTab === 'vendors' && (
            <VendorsView onOpenAddAssetModal={() => setIsAddAssetOpen(true)} />
          )}

          {activeTab === 'disposal' && (
            <AssetManagementView
              onOpenAddAssetModal={() => setIsAddAssetOpen(true)}
              onSelectAsset={(id) => setSelectedAssetDetailId(id)}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
            />
          )}

          {activeTab === 'categories' && <CategoriesView />}

          {(activeTab === 'requests' || activeTab === 'maintenance') && <MaintenanceView />}

          {(activeTab === 'allocation' || activeTab === 'issue-return') && <AllocationView />}

          {activeTab === 'history' && <AssetHistoryView />}

          {activeTab === 'audit-logs' && <AuditLogsView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'notifications' && <NotificationsView />}

          {(activeTab === 'users' || activeTab === 'roles') && <UserManagementView />}

          {activeTab === 'settings' && <SettingsView />}

          {activeTab === 'profile' && <ProfileView />}

          {activeTab === 'help' && <HelpSupportView />}
        </main>
      </div>

      {/* Global Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <ConfirmLogoutModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
      />

      <AddAssetModal
        isOpen={isAddAssetOpen}
        onClose={() => setIsAddAssetOpen(false)}
      />

      <AssetDetailModal
        assetId={selectedAssetDetailId}
        onClose={() => setSelectedAssetDetailId(null)}
        onRaiseMaintenance={(id) => {
          setActiveTab('maintenance');
        }}
        onReallocate={(id) => {
          setActiveTab('allocation');
        }}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onSelectAssetDetails={(id) => {
          setIsQRScannerOpen(false);
          setSelectedAssetDetailId(id);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
