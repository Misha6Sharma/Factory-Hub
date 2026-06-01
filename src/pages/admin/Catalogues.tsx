import React, { useState } from 'react';
import { useStore } from '../../lib/StoreContext';
import { Plus, Search, MoreVertical, BookOpen, Filter, Copy, QrCode, Archive, Trash2, Edit, Globe, Settings, Lock, Shield, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Catalogue } from '../../types';

export default function Catalogues() {
  const { catalogues, createCatalogue, deleteCatalogue, updateCatalogue } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Latest Updated');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeSettingsModal, setActiveSettingsModal] = useState<Catalogue | null>(null);
  const [showPasswordText, setShowPasswordText] = useState(false);

  const selectedCatalogue = activeSettingsModal ? catalogues.find(c => c.id === activeSettingsModal.id) : null;

  let filteredCatalogues = catalogues.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  filteredCatalogues.sort((a, b) => {
    if (sortBy === 'Latest Updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortBy === 'Newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'Oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'Product Count') return b.productIds.length - a.productIds.length;
    return 0;
  });

  const handleDuplicate = (catalogue: Catalogue) => {
    const newCat = {
      ...catalogue,
      id: `CAT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      name: `${catalogue.name} (Copy)`,
      status: 'Draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      ordersCount: 0
    };
    createCatalogue(newCat);
    setActiveMenuId(null);
  };

  const handleArchive = (catalogue: Catalogue) => {
    updateCatalogue({ ...catalogue, status: 'Archived', updatedAt: new Date().toISOString() });
    setActiveMenuId(null);
  };

  const handleDelete = (catalogueId: string) => {
    if (confirm('Are you sure you want to delete this catalogue? This cannot be undone.')) {
      deleteCatalogue(catalogueId);
    }
    setActiveMenuId(null);
  };

  const handleShare = (catalogueId: string) => {
    prompt('Copy this link to share:', `${window.location.origin}/store/c/${catalogueId}`);
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Manage Catalogues</h2>
        <button 
          onClick={() => navigate('/admin/catalogues/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5 -ml-0.5" />
          NEW CATALOGUE
        </button>
      </div>

      <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-sm leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            placeholder="Search catalogues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="flex-1 md:flex-none flex items-center border border-slate-300 rounded bg-slate-50 px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none w-full"
            >
              <option value="All">All Statuses</option>
              <option value="Live">Live</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 md:flex-none border border-slate-300 rounded bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Latest Updated">Latest Updated</option>
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
            <option value="Product Count">Most Products</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCatalogues.map((catalogue) => (
          <div key={catalogue.id} className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col hover:border-indigo-300 transition-colors group">
            <div className="aspect-[16/9] relative bg-slate-100 overflow-hidden cursor-pointer rounded-t-lg" onClick={() => navigate(`/admin/catalogues/${catalogue.id}`)}>
              {catalogue.coverImage ? (
                <img src={catalogue.coverImage} alt={catalogue.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-slate-300" />
                </div>
              )}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[90%]">
                <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded border shadow-sm ${
                  catalogue.status === 'Live' ? 'bg-green-50 text-green-700 border-green-200' :
                  catalogue.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {catalogue.status}
                </span>
                {catalogue.visibility === 'Password Protected' && (
                  <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700 shadow-sm rounded flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" /> Password
                  </span>
                )}
                {catalogue.visibility === 'Private' && (
                  <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm rounded flex items-center gap-1">
                    <Shield className="w-3 h-3 text-indigo-600" /> Private
                  </span>
                )}
                {catalogue.expiryDate && (
                  <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider border shadow-sm rounded flex items-center gap-1 ${
                    new Date(catalogue.expiryDate) < new Date() 
                      ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    <Clock className="w-3 h-3" /> {new Date(catalogue.expiryDate) < new Date() ? 'Expired' : 'Expires Soon'}
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-1">
                <h3 
                  className="text-base font-bold text-slate-900 cursor-pointer hover:text-indigo-600 truncate mr-2"
                  onClick={() => navigate(`/admin/catalogues/${catalogue.id}`)}
                >
                  {catalogue.name}
                </h3>
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === catalogue.id ? null : catalogue.id)}
                    className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {activeMenuId === catalogue.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded shadow-lg z-20 overflow-hidden py-1">
                      <button onClick={() => { navigate(`/store/c/${catalogue.id}`); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between">
                        Preview <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <button onClick={() => navigate(`/admin/catalogues/${catalogue.id}`)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between">
                        Edit Catalogue <Edit className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <button onClick={() => { setActiveSettingsModal(catalogue); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between border-t border-slate-100">
                        Visibility Controls <Settings className="w-3.5 h-3.5 text-indigo-600" />
                      </button>
                      {catalogue.status === 'Live' ? (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateCatalogue({ ...catalogue, status: 'Draft', updatedAt: new Date().toISOString() }); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center justify-between border-t border-slate-100 mt-1">
                          Set as Draft <Archive className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateCatalogue({ ...catalogue, status: 'Live', updatedAt: new Date().toISOString() }); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-green-50 hover:text-green-700 flex items-center justify-between border-t border-slate-100 mt-1">
                          Publish (Set Live) <Globe className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleShare(catalogue.id)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between border-t border-slate-100">
                        Share Link <Copy className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <button onClick={() => handleDuplicate(catalogue)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between border-t border-slate-100 mt-1">
                        Duplicate <Copy className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <button onClick={() => handleArchive(catalogue)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 text-amber-700 flex items-center justify-between border-t border-slate-100 mt-1">
                        Archive <Archive className="w-3.5 h-3.5 text-amber-500" />
                      </button>
                      <button onClick={() => handleDelete(catalogue.id)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-red-50 text-red-700 flex items-center justify-between border-t border-slate-100 mt-1">
                        Delete <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 flex-1 line-clamp-2">{catalogue.description}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Products</span>
                  <span className="text-sm font-semibold text-slate-900">{catalogue.productIds.length}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Views</span>
                  <span className="text-sm font-semibold text-slate-900">{catalogue.views}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Updated</span>
                  <span className="text-[11px] font-semibold text-slate-900">{new Date(catalogue.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => navigate(`/admin/catalogues/${catalogue.id}`)}
                  className="flex-1 py-2 border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-50 rounded hover:bg-slate-100 transition-colors shadow-sm text-center"
                >
                  Manage Products
                </button>
                <button 
                  onClick={() => setActiveSettingsModal(catalogue)}
                  className="px-3 py-2 border border-indigo-200 text-[10px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors shadow-sm flex items-center gap-1"
                  title="Settings & Visibility"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Access</span>
                </button>
                <button onClick={() => handleShare(catalogue.id)} className="px-3 py-2 border border-slate-200 text-[10px] uppercase font-bold tracking-wider text-slate-600 bg-white rounded hover:bg-slate-50 transition-colors shadow-sm flex items-center group/btn" title="Share link">
                   <Copy className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredCatalogues.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
            No catalogues match your filters.
          </div>
        )}
      </div>
      
      {/* Click away listener for menus */}
      {activeMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
      )}

      {activeSettingsModal && selectedCatalogue && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
               <div className="flex flex-col">
                 <h3 className="text-sm font-bold text-slate-900 flex items-center">
                   <Settings className="w-4 h-4 mr-2 text-indigo-600" /> 
                   Visibility & Access Control
                 </h3>
                 <span className="text-[10px] text-slate-500 font-medium ml-6 mt-0.5">{selectedCatalogue.name}</span>
               </div>
               <button onClick={() => setActiveSettingsModal(null)} className="text-slate-400 hover:text-slate-600 bg-white rounded p-1 shadow-sm border border-slate-200">
                 <X className="w-4 h-4" />
               </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Visibility Strategy Selection */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Catalogue Visibility</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-lg">
                  {(['Public', 'Password Protected', 'Private'] as const).map((mode) => {
                    const isActive = (selectedCatalogue.visibility || 'Public') === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          updateCatalogue({
                            ...selectedCatalogue,
                            visibility: mode,
                            password: mode === 'Password Protected' && !selectedCatalogue.password ? 'B2B_Showroom_123' : selectedCatalogue.password,
                            updatedAt: new Date().toISOString()
                          });
                        }}
                        className={`py-2 px-1 text-center rounded text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {mode === 'Password Protected' ? 'Password' : mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Settings Fields based on Selection */}
              {selectedCatalogue.visibility === 'Password Protected' && (
                <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-amber-800">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Configure Password Gate</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Buyers will be prompted to enter this password to view the catalogue cover & products.
                  </p>
                  <div className="relative">
                    <input
                      type={showPasswordText ? "text" : "password"}
                      value={selectedCatalogue.password || ''}
                      onChange={(e) => {
                        updateCatalogue({
                          ...selectedCatalogue,
                          password: e.target.value,
                          updatedAt: new Date().toISOString()
                        });
                      }}
                      className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      placeholder="Enter access password..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-indigo-600"
                    >
                      {showPasswordText ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}

              {selectedCatalogue.visibility === 'Private' && (
                <div className="p-4 bg-indigo-50/50 border border-indigo-200/60 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-800">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Private Showroom Mode</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Access will be restricted solely to buyers inside your invited customer list.
                  </p>
                </div>
              )}

              {(!selectedCatalogue.visibility || selectedCatalogue.visibility === 'Public') && (
                <div className="p-4 bg-sky-50/50 border border-sky-200/60 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-800">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Open Catalogue Access</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Anyone clicking the public Link or scanning the QR code can browse instantly without gates.
                  </p>
                </div>
              )}

              {/* Expiry Date Control */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Link Expiry Period</span>
                  </div>
                  {selectedCatalogue.expiryDate && (
                    <button
                      type="button"
                      onClick={() => {
                        updateCatalogue({
                          ...selectedCatalogue,
                          expiryDate: undefined,
                          updatedAt: new Date().toISOString()
                        });
                      }}
                      className="text-[10px] font-bold text-rose-500 uppercase hover:underline"
                    >
                      Remove Expiry
                    </button>
                  )}
                </div>
                
                <p className="text-[10px] text-slate-500 leading-normal">
                  Define a deadline after which the catalogue public link and QR code will automatically stop working.
                </p>

                <div className="relative">
                  <input
                    type="date"
                    value={selectedCatalogue.expiryDate || ''}
                    onChange={(e) => {
                      updateCatalogue({
                        ...selectedCatalogue,
                        expiryDate: e.target.value || undefined,
                        updatedAt: new Date().toISOString()
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      const str = d.toISOString().split('T')[0];
                      updateCatalogue({
                        ...selectedCatalogue,
                        expiryDate: str,
                        updatedAt: new Date().toISOString()
                      });
                    }}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider transition-colors animate-none"
                  >
                    +7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 30);
                      const str = d.toISOString().split('T')[0];
                      updateCatalogue({
                        ...selectedCatalogue,
                        expiryDate: str,
                        updatedAt: new Date().toISOString()
                      });
                    }}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider transition-colors animate-none"
                  >
                    +30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + 6);
                      const str = d.toISOString().split('T')[0];
                      updateCatalogue({
                        ...selectedCatalogue,
                        expiryDate: str,
                        updatedAt: new Date().toISOString()
                      });
                    }}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider transition-colors animate-none"
                  >
                    +6 Months
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSettingsModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
