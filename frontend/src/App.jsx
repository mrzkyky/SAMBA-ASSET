import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import HierarchyView from './components/HierarchyView';
import AssetTable from './components/AssetTable';
import BranchManager from './components/BranchManager';
import SiteManager from './components/SiteManager';
import CategoryManager from './components/CategoryManager';
import UserManager from './components/UserManager';
import AssetModal from './components/AssetModal';
import LoginModal from './components/LoginModal';
import QRCodeModal from './components/QRCodeModal';
import QRScannerModal from './components/QRScannerModal';
import {
  getStats,
  getHierarchy,
  getBranches,
  getSites,
  getCategories,
  getAssets,
  deleteAsset,
  getUsers,
  getProfile,
} from './api';

function App() {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('hierarchy'); // 'hierarchy' | 'table' | 'master' | 'users'
  const [stats, setStats] = useState(null);
  const [hierarchy, setHierarchy] = useState([]);
  const [branches, setBranches] = useState([]);
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Table state & filters
  const [assets, setAssets] = useState([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [qrAsset, setQrAsset] = useState(null);

  const [isQRScannerModalOpen, setIsQRScannerModalOpen] = useState(false);

  // Check initial Auth & Profile
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      if (parsedUser.role === 'Branch Admin' && parsedUser.branch_id) {
        setSelectedBranch(String(parsedUser.branch_id));
      }

      getProfile()
        .then((u) => {
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
          if (u.role === 'Branch Admin' && u.branch_id) {
            setSelectedBranch(String(u.branch_id));
          }
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsLoginModalOpen(true);
        });
    } else {
      setIsLoginModalOpen(true);
    }
  }, []);

  // Fetch Master Data
  const fetchMasterData = useCallback(async () => {
    try {
      const [sData, bData, stData, cData] = await Promise.all([
        getStats(),
        getBranches(),
        getSites(),
        getCategories(),
      ]);
      setStats(sData);
      setBranches(bData);
      setSites(stData);
      setCategories(cData);
    } catch (err) {
      console.error('Error fetching master data:', err);
    }
  }, []);

  // Fetch Users List (for Super Admin)
  const fetchUsersData = useCallback(async () => {
    if (user?.role === 'Super Admin') {
      try {
        const data = await getUsers();
        setUsersList(data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    }
  }, [user]);

  // Fetch Hierarchy Tree
  const fetchHierarchyTree = useCallback(async () => {
    try {
      const data = await getHierarchy(selectedBranch);
      setHierarchy(data);
    } catch (err) {
      console.error('Error fetching hierarchy:', err);
    }
  }, [selectedBranch]);

  // Fetch Assets List
  const fetchAssetsData = useCallback(async () => {
    try {
      const res = await getAssets({
        page,
        limit,
        q: searchQuery,
        branch_id: selectedBranch,
        category_id: selectedCategory,
        status: selectedStatus,
      });
      setAssets(res.data);
      setTotalAssets(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error('Error fetching assets:', err);
    }
  }, [page, limit, searchQuery, selectedBranch, selectedCategory, selectedStatus]);

  // Sync initial load
  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  useEffect(() => {
    fetchHierarchyTree();
  }, [fetchHierarchyTree]);

  useEffect(() => {
    fetchAssetsData();
  }, [fetchAssetsData]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsersData();
    }
  }, [activeTab, fetchUsersData]);

  // Auth Handlers
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setIsLoginModalOpen(false);
    if (loggedInUser.role === 'Branch Admin' && loggedInUser.branch_id) {
      setSelectedBranch(String(loggedInUser.branch_id));
    }
    fetchMasterData();
    fetchHierarchyTree();
    fetchAssetsData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSelectedBranch('');
    setIsLoginModalOpen(true);
  };

  // Asset Handlers
  const handleOpenAssetModal = (assetToEdit = null) => {
    setEditingAsset(assetToEdit);
    setIsAssetModalOpen(true);
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus aset ini?')) return;
    try {
      await deleteAsset(assetId);
      fetchMasterData();
      fetchHierarchyTree();
      fetchAssetsData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus aset.');
    }
  };

  const handleSaveSuccess = () => {
    fetchMasterData();
    fetchHierarchyTree();
    fetchAssetsData();
  };

  // QR Handlers
  const handleOpenQRCodeModal = (assetObj) => {
    setQrAsset(assetObj);
    setIsQRCodeModalOpen(true);
  };

  const handleScanQRSuccess = (scannedSN) => {
    setSearchQuery(scannedSN);
    setActiveTab('hierarchy');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header Bar */}
      <Header
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAssetModal={handleOpenAssetModal}
        onOpenQRScanner={() => setIsQRScannerModalOpen(true)}
        selectedBranch={selectedBranch}
        branches={branches}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top KPI Metrics Overview */}
        <StatsOverview stats={stats} />

        {/* Tab 1: 4-Level Hierarchy View */}
        {activeTab === 'hierarchy' && (
          <HierarchyView
            user={user}
            hierarchy={hierarchy}
            branches={branches}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            onEditAsset={handleOpenAssetModal}
            onDeleteAsset={handleDeleteAsset}
            onOpenQRCodeModal={handleOpenQRCodeModal}
            searchQuery={searchQuery}
          />
        )}

        {/* Tab 2: Full Master Asset Data Table */}
        {activeTab === 'table' && (
          <AssetTable
            user={user}
            assets={assets}
            total={totalAssets}
            page={page}
            limit={limit}
            totalPages={totalPages}
            onPageChange={setPage}
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
            onEditAsset={handleOpenAssetModal}
            onDeleteAsset={handleDeleteAsset}
            onOpenQRCodeModal={handleOpenQRCodeModal}
          />
        )}

        {/* Tab 3: Master Data Management (Branch, Site, Category) */}
        {activeTab === 'master' && user?.role !== 'Auditor' && (
          <div className="space-y-8">
            <BranchManager branches={branches} onRefresh={fetchMasterData} />
            <SiteManager sites={sites} branches={branches} onRefresh={fetchMasterData} />
            <CategoryManager categories={categories} onRefresh={fetchMasterData} />
          </div>
        )}

        {/* Tab 4: User Management (Super Admin Only) */}
        {activeTab === 'users' && user?.role === 'Super Admin' && (
          <UserManager users={usersList} branches={branches} onRefresh={fetchUsersData} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>National Asset Management System • Terintegrasi QR Code & RBAC Auth</p>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Create / Edit Asset Modal */}
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        asset={editingAsset}
        sites={sites}
        categories={categories}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* QR Code Printable Sticker Modal */}
      <QRCodeModal
        isOpen={isQRCodeModalOpen}
        onClose={() => setIsQRCodeModalOpen(false)}
        asset={qrAsset}
      />

      {/* Live Camera QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerModalOpen}
        onClose={() => setIsQRScannerModalOpen(false)}
        onScanSuccess={handleScanQRSuccess}
      />

    </div>
  );
}

export default App;
