import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import HierarchyView from './components/HierarchyView';
import AssetTable from './components/AssetTable';
import BranchManager from './components/BranchManager';
import SiteManager from './components/SiteManager';
import CategoryManager from './components/CategoryManager';
import AssetModal from './components/AssetModal';
import {
  getStats,
  getHierarchy,
  getBranches,
  getSites,
  getCategories,
  getAssets,
  deleteAsset,
} from './api';

function App() {
  const [activeTab, setActiveTab] = useState('hierarchy'); // 'hierarchy' | 'table' | 'master'
  const [stats, setStats] = useState(null);
  const [hierarchy, setHierarchy] = useState([]);
  const [branches, setBranches] = useState([]);
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);

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

  // Asset Modal State
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  // Master Data Refresh
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

  // Fetch Hierarchy
  const fetchHierarchyTree = useCallback(async () => {
    try {
      const data = await getHierarchy(selectedBranch);
      setHierarchy(data);
    } catch (err) {
      console.error('Error fetching hierarchy:', err);
    }
  }, [selectedBranch]);

  // Fetch Paginated Assets
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

  // Initial Load
  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  // Refresh hierarchy when selected branch changes
  useEffect(() => {
    fetchHierarchyTree();
  }, [fetchHierarchyTree]);

  // Refresh assets table when filters or page change
  useEffect(() => {
    fetchAssetsData();
  }, [fetchAssetsData]);

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
      alert('Gagal menghapus aset');
    }
  };

  const handleSaveSuccess = () => {
    fetchMasterData();
    fetchHierarchyTree();
    fetchAssetsData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAssetModal={handleOpenAssetModal}
        selectedBranch={selectedBranch}
        branches={branches}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top KPI Metrics Overview */}
        <StatsOverview stats={stats} />

        {/* Tab 1: 4-Level Hierarchy View */}
        {activeTab === 'hierarchy' && (
          <HierarchyView
            hierarchy={hierarchy}
            branches={branches}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            onEditAsset={handleOpenAssetModal}
            onDeleteAsset={handleDeleteAsset}
            searchQuery={searchQuery}
          />
        )}

        {/* Tab 2: Full Master Asset Table */}
        {activeTab === 'table' && (
          <AssetTable
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
          />
        )}

        {/* Tab 3: Master Data Management (Branches, Sites, Categories) */}
        {activeTab === 'master' && (
          <div className="space-y-8">
            <BranchManager branches={branches} onRefresh={fetchMasterData} />
            <SiteManager sites={sites} branches={branches} onRefresh={fetchMasterData} />
            <CategoryManager categories={categories} onRefresh={fetchMasterData} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>National Asset Management System • Built with Go (Gin), PostgreSQL & React (Tailwind CSS)</p>
      </footer>

      {/* Asset Modal */}
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        asset={editingAsset}
        sites={sites}
        categories={categories}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}

export default App;
