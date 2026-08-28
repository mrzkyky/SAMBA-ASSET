import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import HierarchyView from './components/HierarchyView';
import AssetTable from './components/AssetTable';
import AssetModal from './components/AssetModal';
import BranchManager from './components/BranchManager';
import SiteManager from './components/SiteManager';
import CategoryManager from './components/CategoryManager';
import SegmentManager from './components/SegmentManager';
import UserManager from './components/UserManager';
import LoginModal from './components/LoginModal';
import QRCodeModal from './components/QRCodeModal';
import QRScannerModal from './components/QRScannerModal';
import TransferModal from './components/TransferModal';
import BASTModal from './components/BASTModal';
import TransferHistory from './components/TransferHistory';
import AuditLogView from './components/AuditLogView';
import ImportAssetModal from './components/ImportAssetModal';

import {
  getProfile,
  getStats,
  getHierarchy,
  getBranches,
  getSites,
  getCategories,
  getSegments,
  getAssets,
  deleteAsset,
  getUsers,
} from './api';

function App() {
  // Auth State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  // Active Navigation Tab: 'hierarchy', 'master', 'transfers', 'audit', 'users', 'branches', 'sites', 'categories'
  const [activeTab, setActiveTab] = useState('hierarchy');

  // Filter States
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOwnership, setSelectedOwnership] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [stats, setStats] = useState(null);
  const [hierarchy, setHierarchy] = useState([]);
  const [branches, setBranches] = useState([]);
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [segments, setSegments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [assetsData, setAssetsData] = useState({ data: [], total: 0, page: 1, limit: 10, total_pages: 1 });

  // Pagination State for Master Asset Table
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        });
    }
  }, [token, user]);

  const handleLoginSuccess = (loggedInUser) => {
    // Token is already saved to localStorage by LoginModal
    setToken(localStorage.getItem('token'));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Enforce branch filter automatically for branch-assigned users (e.g. Branch Admin)
  useEffect(() => {
    if (user?.branch_id && user.role !== 'Super Admin') {
      setSelectedBranch(String(user.branch_id));
    }
  }, [user]);

  // Fetch Stats Data (scoped to selectedBranch or National)
  const fetchStats = useCallback(async () => {
    try {
      const data = await getStats(selectedBranch);
      setStats(data);
    } catch (err) {
      console.error('Gagal mengambil statistik dashboard:', err);
    }
  }, [selectedBranch]);

  // Fetch Master Data Lists (Branches, Sites, Categories, Segments, Users)
  const fetchMasterData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        getBranches(),
        getSites(),
        getCategories(),
        getSegments(),
        getUsers().catch(() => []),
      ]);

      if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) {
        setBranches(results[0].value);
      }
      if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) {
        setSites(results[1].value);
      }
      if (results[2].status === 'fulfilled' && Array.isArray(results[2].value)) {
        setCategories(results[2].value);
      }
      if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) {
        setSegments(results[3].value);
      }
      if (results[4].status === 'fulfilled' && Array.isArray(results[4].value)) {
        setUsersList(results[4].value);
      }
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
        segment_id: selectedSegment,
        status: selectedStatus,
        ownership: selectedOwnership,
      };
      const res = await getAssets(params);
      setAssetsData(res);
    } catch (err) {
      console.error('Gagal mengambil data master aset:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedBranch, selectedCategory, selectedSegment, selectedStatus, selectedOwnership]);

  // Global Data Refresh Trigger
  const refreshAllData = useCallback(() => {
    fetchStats();
    fetchMasterData();
    fetchHierarchyData();
    fetchAssetsTableData();
  }, [fetchStats, fetchMasterData, fetchHierarchyData, fetchAssetsTableData]);

  // Reset pagination to page 1 whenever search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBranch, selectedCategory, selectedSegment, selectedStatus, selectedOwnership]);

  // Effect Trigger on Filter & Tab Changes
  useEffect(() => {
    if (token) {
      refreshAllData();
    }
  }, [token, activeTab, selectedBranch, selectedCategory, selectedSegment, selectedStatus, selectedOwnership, searchQuery, currentPage, refreshAllData]);

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
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenQRScannerModal={() => setIsQRScannerOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedBranch={selectedBranch}
      />

      {/* Main Content Area */}
      <main className="w-full px-2.5 sm:px-6 lg:px-8 mt-3 sm:mt-6 space-y-4 sm:space-y-6">
        
        {/* Dashboard Key Metrics Banner */}
        <StatsOverview
          stats={stats}
          selectedBranch={selectedBranch}
          branches={branches}
          user={user}
        />

        {/* Tab 1: 4-Level Hierarchy View */}
        {activeTab === 'hierarchy' && (
          <HierarchyView
            user={user}
            hierarchy={hierarchy}
            branches={branches}
            segments={segments}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            selectedSegment={selectedSegment}
            setSelectedSegment={setSelectedSegment}
            selectedOwnership={selectedOwnership}
            setSelectedOwnership={setSelectedOwnership}
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
            selectedSegment={selectedSegment}
            setSelectedSegment={setSelectedSegment}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedOwnership={selectedOwnership}
            setSelectedOwnership={setSelectedOwnership}
            branches={branches}
            categories={categories}
            segments={segments}
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

        {/* Tab 4: System Audit Trail Log & Edit History (Super Admin & Branch Admin) */}
        {activeTab === 'audit' && (user?.role === 'Super Admin' || user?.role === 'Branch Admin') && (
          <AuditLogView />
        )}

        {/* Tab 5: User Management RBAC (Super Admin) */}
        {activeTab === 'users' && user?.role === 'Super Admin' && (
          <UserManager users={usersList} branches={branches} onRefresh={refreshAllData} />
        )}

        {/* Level 1: Branch Management */}
        {activeTab === 'branches' && user?.role === 'Super Admin' && (
          <BranchManager branches={branches} onRefresh={refreshAllData} />
        )}

        {/* Level 2: Site Management (Super Admin & Branch Admin) */}
        {activeTab === 'sites' && (user?.role === 'Super Admin' || user?.role === 'Branch Admin') && (
          <SiteManager sites={sites} branches={branches} user={user} onRefresh={refreshAllData} />
        )}

        {/* Level 3: Category Management (Super Admin & Branch Admin) */}
        {activeTab === 'categories' && (user?.role === 'Super Admin' || user?.role === 'Branch Admin') && (
          <CategoryManager categories={categories} user={user} onRefresh={refreshAllData} />
        )}

        {/* Segment Management */}
        {activeTab === 'segments' && user?.role === 'Super Admin' && (
          <SegmentManager segments={segments} onRefresh={refreshAllData} />
        )}
      </main>

      {/* Asset CRUD Form Modal */}
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        asset={editingAsset}
        sites={sites}
        categories={categories}
        segments={segments}
        onSaveSuccess={refreshAllData}
      />

      {/* Bulk Spreadsheet / CSV Import Modal */}
      <ImportAssetModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        sites={sites}
        branches={branches}
        user={user}
        onImportSuccess={refreshAllData}
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
