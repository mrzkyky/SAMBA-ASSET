import React, { useState, useMemo } from 'react';
import { MapPin, Plus, Edit2, Trash2, X, ExternalLink, Search } from 'lucide-react';
import { createSite, updateSite, deleteSite } from '../api';
import { resolveRegionCode } from '../utils/regionCodes';

const SiteManager = ({ sites = [], branches = [], user, onRefresh }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({ branch_id: '', partner_name: '', site_name: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const isBranchScoped = user?.role === 'Branch Admin' || (user?.role !== 'Super Admin' && user?.role !== 'Super User' && user?.username !== 'admin' && Boolean(user?.branch_id));
  const userBranchId = user?.branch_id ? String(user.branch_id) : '';
  const currentBranch = branches?.find((b) => String(b.id) === userBranchId);

  const displayedSites = isBranchScoped && userBranchId
    ? sites.filter((s) => String(s.branch_id) === userBranchId)
    : sites;

  const defaultBranchId = isBranchScoped && userBranchId
    ? userBranchId
    : (branches[0]?.id ? String(branches[0].id) : '');

  // Filter sites based on search query
  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return displayedSites;
    const q = searchQuery.toLowerCase().trim();

    return displayedSites.filter((s) => {
      const matchPartner = s.partner_name?.toLowerCase().includes(q);
      const matchSiteName = s.site_name?.toLowerCase().includes(q);
      const matchAddress = s.address?.toLowerCase().includes(q);
      const matchBranch = s.branch?.name?.toLowerCase().includes(q);

      // Also match region code
      const reg = resolveRegionCode(s, s.branch);
      const matchCode = reg?.code?.toLowerCase().includes(q);
      const matchRegName = reg?.name?.toLowerCase().includes(q);

      return matchPartner || matchSiteName || matchAddress || matchBranch || matchCode || matchRegName;
    });
  }, [displayedSites, searchQuery]);

  const handleOpenForm = (site = null) => {
    setError('');
    if (site) {
      setEditingSite(site);
      setFormData({
        branch_id: String(site.branch_id),
        partner_name: site.partner_name,
        site_name: site.site_name,
        address: site.address || '',
      });
    } else {
      setEditingSite(null);
      setFormData({
        branch_id: defaultBranchId,
        partner_name: '',
        site_name: '',
        address: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSite(null);
    setFormData({ branch_id: defaultBranchId, partner_name: '', site_name: '', address: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const branchIdToSave = isBranchScoped && userBranchId
        ? parseInt(userBranchId, 10)
        : parseInt(formData.branch_id, 10);

      const payload = { ...formData, branch_id: branchIdToSave };
      if (editingSite) {
        await updateSite(editingSite.id, payload);
      } else {
        await createSite(payload);
      }
      onRefresh();
      handleCloseForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan saat menyimpan site.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus site ini? Semua aset di site ini akan ikut terhapus.')) return;
    try {
      await deleteSite(id);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus site.');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-teal-400" />
            <span>
              Kelola Mitra & Site Spesifik (Level 2)
              {isBranchScoped && currentBranch ? ` - Cabang ${currentBranch.name}` : ''}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBranchScoped && currentBranch
              ? `Tambah, edit, atau kelola site mitra yang berada di wilayah Cabang ${currentBranch.name}.`
              : 'Tambah, edit, atau hapus site tempat perangkat berada.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenForm(null)}
          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-teal-500/20 active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Site</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama mitra, site, alamat, branch, atau kode wilayah..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
              title="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-between sm:justify-end space-x-2">
          {searchQuery ? (
            <span className="text-teal-400 font-semibold bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
              Menampilkan {filteredSites.length} dari {displayedSites.length} site
            </span>
          ) : (
            <span className="text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Total {displayedSites.length} Site terdaftar
            </span>
          )}
        </div>
      </div>

      {/* Modal Dialog for Tambah / Edit Site (Direct viewport overlay – no scrolling needed) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingSite ? `Edit Site: ${editingSite.site_name}` : 'Tambah Site / Mitra Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingSite ? 'Perbarui informasi detail lokasi site dan mitra' : 'Daftarkan site spesifik baru tempat perangkat berada'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseForm}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 mx-4 mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Induk Cabang / Branch *</label>
                  <select
                    required
                    disabled={isBranchScoped}
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="">Pilih Cabang</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                  {isBranchScoped && currentBranch && (
                    <p className="text-[10px] text-teal-400 mt-1">Otomatis terikat ke cabang Anda: {currentBranch.name}.</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Nama Mitra / Partner * (misal: SMAN 1)</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: SMAN 1 Brebes / Dinas Perhubungan"
                    value={formData.partner_name}
                    onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Nama Site Spesifik * (misal: Site Brebes)</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Site Brebes Kota / POP Wanasari"
                    value={formData.site_name}
                    onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Alamat Site</label>
                  <input
                    type="text"
                    placeholder="misal: Jl. Dr. Setiabudi No. 11, Brebes"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {/* Live Region Detection from Alamat / Site */}
                {(() => {
                  const selectedBranch = branches.find((b) => String(b.id) === String(formData.branch_id));
                  const detected = resolveRegionCode(
                    { site_name: formData.site_name, partner_name: formData.partner_name, address: formData.address },
                    selectedBranch
                  );
                  return (
                    <div className="md:col-span-2 bg-slate-950 border border-teal-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                        <span className="text-teal-300 font-bold">Kode Wilayah Aset:</span>
                        <span className="font-mono font-black text-white px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                          {detected.code}
                        </span>
                        <span className="text-slate-200 font-medium">({detected.name})</span>
                        <span className="text-slate-500 text-[11px]">via {detected.source}</span>
                      </div>
                      <a
                        href="https://kodewilayah.web.id/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 hover:text-teal-300 text-[11px] font-semibold flex items-center space-x-1"
                      >
                        <span>kodewilayah.web.id</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
                >
                  {loading ? 'Menyimpan...' : editingSite ? 'Simpan Perubahan' : 'Tambah Site Baru'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Induk Branch</th>
              <th className="py-3 px-4">Nama Mitra / Partner</th>
              <th className="py-3 px-4">Nama Site Spesifik</th>
              <th className="py-3 px-4">Alamat / Lokasi</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredSites.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-cyan-400 font-semibold">{s.branch?.name || '-'}</td>
                <td className="py-3 px-4 font-bold text-white">{s.partner_name}</td>
                <td className="py-3 px-4 text-slate-200">{s.site_name}</td>
                <td className="py-3 px-4">
                  <div className="text-slate-300">{s.address || '-'}</div>
                  {(() => {
                    const reg = resolveRegionCode(s, s.branch);
                    return (
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="font-mono text-[10px] font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                          Kode: {reg.code}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px]">({reg.name})</span>
                      </div>
                    );
                  })()}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenForm(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 active:scale-95 transition-colors"
                      title="Edit Site"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 active:scale-95 transition-colors"
                      title="Hapus Site"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSites.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  {searchQuery ? (
                    <span>Tidak ada site yang cocok dengan kata kunci "<strong>{searchQuery}</strong>".</span>
                  ) : (
                    <span>Belum ada data site untuk cabang ini. Silakan klik "Tambah Site".</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SiteManager;

