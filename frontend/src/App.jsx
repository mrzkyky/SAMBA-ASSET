import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import HierarchyView from './components/HierarchyView';
import AssetTable from './components/AssetTable';
import AssetModal from './components/AssetModal';
import BranchManager from './components/BranchManager';
import SiteManager from './components/SiteManager';
import CategoryManager from './components/CategoryManager';
import UserManager from './components/UserManager';
import LoginModal from './components/LoginModal';
import QRCodeModal from './components/QRCodeModal';
import QRScannerModal from './components/QRScannerModal';
import TransferModal from './components/TransferModal';
import BASTModal from './components/BASTModal';
import TransferHistory from './components/TransferHistory';
import AuditLogView from './components/AuditLogView';

import {
  getProfile,
  getStats,
  getHierarchy,
  getBranches,
  getSites,
  getCategories,
  getAssets,
  deleteAsset,
} from './api';

function App() {
  // Auth State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  // Active Navigation Tab: 'hierarchy', 'master', 'transfers', 'audit', 'users', 'branches', 'sites', 'categories'
  const [activeTab, setActiveTab] = useState('hierarchy');

  // Filter States
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [stats, setStats] = useState(null);
  const [hierarchy, setHierarchy] = useState([]);
  const [branches, setBranches] = useState([]);
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assetsData, setAssetsData] = useState({ data: [], total: 0, page: 1, limit: 10, total_pages: 1 });

  // Pagination State for Master Asset Table
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [selectedQRAsset, setSelectedQRAsset] = useState(null);

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAsset, setTransferAsset] = useState(null);

  const [isBASTModalOpen, setIsBASTModalOpen] = useState(false);
  const [bastTransfer, setBastTransfer] = useState(null);
  const [bastAsset, setBastAsset] = useState(null);

  const [loading, setLoading] = useState(false);

  // Load User Profile if token exists
  useEffect(() => {
    if (token && !user) {
      getProfile()
        .then((u) => {
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        })
        .catch(() => handleLogout());
    }
  }, [token, user]);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Enforce Branch Admin scope filter automatically
  useEffect(() => {
    if (user?.role === 'Branch Admin' && user.branch_id) {
      setSelectedBranch(String(user.branch_id));
    }
  }, [user]);

  // Fetch Stats Data
  const fetchStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      console.error('Gagal mengambil statistik dashboard:', err);
    }
  }, []);

  // Fetch Master Data Lists (Branches, Sites, Categories)
  const fetchMasterData = useCallback(async () => {
    try {
      const [b, s, c] = await Promise.all([getBranches(), getSites(), getCategories()]);
      setBranches(b || []);
      setSites(s || []);
      setCategories(c || []);
    } catch (err) {
      console.error('Gagal mengambil data master:', err);
    }
  }, []);

  // Fetch Hierarchy Tree
  const fetchHierarchyData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHierarchy(selectedBranch);
      setHierarchy(data || []);
    } catch (err) {
      console.error('Gagal mengambil data hirarki:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch]);

  // Fetch Assets Page Data (Master Table)
  const fetchAssetsTableData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        q: searchQuery,
        branch_id: selectedBranch,
        category_id: selectedCategory,
        status: selectedStatus,
      };
      const res = await getAssets(params);
      setAssetsData(res);
    } catch (err) {
      console.error('Gagal mengambil data master aset:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedBranch, selectedCategory, selectedStatus]);

  // Global Data Refresh Trigger
  const refreshAllData = useCallback(() => {
    fetchStats();
    fetchMasterData();
    fetchHierarchyData();
    fetchAssetsTableData();
  }, [fetchStats, fetchMasterData, fetchHierarchyData, fetchAssetsTableData]);

  // Effect Trigger on Filter & Tab Changes
  useEffect(() => {
    if (token) {
      refreshAllData();
    }
  }, [token, activeTab, selectedBranch, selectedCategory, selectedStatus, searchQuery, currentPage, refreshAllData]);

  // Handlers for Asset Modals
  const handleOpenCreateAssetModal = () => {
    setEditingAsset(null);
    setIsAssetModalOpen(true);
  };

  const handleOpenEditAssetModal = (asset) => {
    setEditingAsset(asset);
    setIsAssetModalOpen(true);
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data aset ini?')) return;
    try {
      await deleteAsset(assetId);
      refreshAllData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus aset.');
    }
  };

  const handleOpenQRCodeModal = (asset) => {
    setSelectedQRAsset(asset);
    setIsQRCodeModalOpen(true);
  };

  const handleOpenTransferModal = (asset) => {
    setTransferAsset(asset);
    setIsTransferModalOpen(true);
  };

  const handleOpenBASTModal = (transferOrAsset) => {
    if (transferOrAsset.reference_no) {
      setBastTransfer(transferOrAsset);
      setBastAsset(null);
    } else {
      setBastAsset(transferOrAsset);
      setBastTransfer(null);
    }
    setIsBASTModalOpen(true);
  };

  // If not logged in, render Login Dialog
  if (!token) {
    return <LoginModal isOpen={true} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950 pb-16">
      
      {/* Responsive Header Bar */}
      <Header
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAssetModal={handleOpenCreateAssetModal}
        onOpenQRScannerModal={() => setIsQRScannerOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedBranch={selectedBranch}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Dashboard Key Metrics Banner */}
        <StatsOverview stats={stats} />

        {/* Tab 1: 4-Level Hierarchy View */}
        {activeTab === 'hierarchy' && (
          <HierarchyView
            user={user}
            hierarchy={hierarchy}
            branches={branches}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            onEditAsset={handleOpenEditAssetModal}
            onDeleteAsset={handleDeleteAsset}
            onOpenQRCodeModal={handleOpenQRCodeModal}
            onOpenTransferModal={handleOpenTransferModal}
            searchQuery={searchQuery}
          />
        )}

        {/* Tab 2: Master Asset Grid Table */}
        {activeTab === 'master' && (
          <AssetTable
            user={user}
            assets={assetsData.data || []}
            total={assetsData.total || 0}
            page={assetsData.page || 1}
            limit={assetsData.limit || 10}
            totalPages={assetsData.total_pages || 1}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            branches={branches}
            categories={categories}
            onEditAsset={handleOpenEditAssetModal}
            onDeleteAsset={handleDeleteAsset}
            onOpenQRCodeModal={handleOpenQRCodeModal}
            onOpenTransferModal={handleOpenTransferModal}
          />
        )}

        {/* Tab 3: Asset Transfer & Mutation History */}
        {activeTab === 'transfers' && (
          <TransferHistory
            onOpenBASTModal={(transfer) => handleOpenBASTModal(transfer)}
          />
        )}

        {/* Tab 4: System Audit Trail Log (Super Admin) */}
        {activeTab === 'audit' && user?.role === 'Super Admin' && (
          <AuditLogView />
        )}

        {/* Tab 5: User Management RBAC (Super Admin) */}
        {activeTab === 'users' && user?.role === 'Super Admin' && (
          <UserManager users={[]} branches={branches} onRefresh={refreshAllData} />
        )}

        {/* Level 1: Branch Management */}
        {activeTab === 'branches' && user?.role === 'Super Admin' && (
          <BranchManager branches={branches} onRefresh={refreshAllData} />
        )}

        {/* Level 2: Site Management */}
        {activeTab === 'sites' && user?.role === 'Super Admin' && (
          <SiteManager sites={sites} branches={branches} onRefresh={refreshAllData} />
        )}

        {/* Level 3: Category Management */}
        {activeTab === 'categories' && user?.role === 'Super Admin' && (
          <CategoryManager categories={categories} onRefresh={refreshAllData} />
        )}
      </main>

      {/* Asset CRUD Form Modal */}
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        asset={editingAsset}
        sites={sites}
        categories={categories}
        onSaveSuccess={refreshAllData}
      />

      {/* Printable QR Code Sticker Modal */}
      <QRCodeModal
        isOpen={isQRCodeModalOpen}
        onClose={() => setIsQRCodeModalOpen(false)}
        asset={selectedQRAsset}
      />

      {/* Live Web Camera QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanResult={(scannedSN) => setSearchQuery(scannedSN)}
      />

      {/* Asset Transfer & Mutation Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        asset={transferAsset}
        sites={sites}
        onTransferSuccess={refreshAllData}
      />

      {/* Printable BAST PDF Document Modal */}
      <BASTModal
        isOpen={isBASTModalOpen}
        onClose={() => setIsBASTModalOpen(false)}
        transfer={bastTransfer}
        asset={bastAsset}
      />
    </div>
  );
}

export default App;
