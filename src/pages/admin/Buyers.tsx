import React, { useState } from 'react';
import { useStore } from '../../lib/StoreContext';
import { Share2, Link as LinkIcon, QrCode, Mail, MessageCircle, Eye, ShoppingCart, Search, Filter, Copy, X, Shield, Lock, Globe, Clock, Settings } from 'lucide-react';
import { Catalogue } from '../../types';

import { QRCodeSVG } from 'qrcode.react';

export default function Buyers() {
  const { catalogues, factory, updateCatalogue } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeShareModal, setActiveShareModal] = useState<Catalogue | null>(null);
  const [activeSettingsModal, setActiveSettingsModal] = useState<Catalogue | null>(null);
  const [showPasswordText, setShowPasswordText] = useState(false);

  const selectedCatalogue = activeSettingsModal ? catalogues.find(c => c.id === activeSettingsModal.id) : null;

  const sharedCatalogues = catalogues.filter(c => c.status === 'Live');
  
  const filteredCatalogues = sharedCatalogues.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPublicLink = (catalogueId: string) => {
    return `${window.location.origin}/store/c/${catalogueId}`;
  };

  const handleCopyLink = (catalogueId: string) => {
    navigator.clipboard.writeText(getPublicLink(catalogueId));
    alert('Public link copied to clipboard!');
  };

  const handleWhatsAppShare = (catalogue: Catalogue) => {
    const text = `Hello,\n\nPlease find our latest product catalogue below:\n\n${catalogue.name}\n\n${getPublicLink(catalogue.id)}\n\nYou can browse products, request quotations, and place orders online.\n\nRegards,\n${factory.name}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmailShare = (catalogue: Catalogue) => {
    const subject = `Latest Product Catalogue from ${factory.name}`;
    const body = `Hello,\n\nPlease find our latest product catalogue below:\n\n${catalogue.name}\n\n${catalogue.description}\n\nClick here to view: ${getPublicLink(catalogue.id)}\n\nYou can browse products, request quotations, and place orders online.\n\nRegards,\n${factory.name}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 mb-1">My Shared Catalogues</h2>
          <p className="text-sm text-slate-500">Manage and share your digital showrooms with B2B buyers.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search catalogues..." 
             className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCatalogues.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg bg-white">
            <p>No active shared catalogues found.</p>
            <p className="text-xs mt-2">Publish a catalogue from the Catalogues tab to share it here.</p>
          </div>
        )}
        
        {filteredCatalogues.map(catalogue => (
          <div key={catalogue.id} className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden hover:border-indigo-300 transition-colors">
            <div className="aspect-video relative bg-slate-100 overflow-hidden group">
              {catalogue.coverImage ? (
                 <img src={catalogue.coverImage} alt={catalogue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                    <ShoppingCart className="w-8 h-8 opacity-50" />
                 </div>
              )}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[90%]">
                 <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 shadow-sm rounded">
                   Live
                 </span>
                 {catalogue.visibility === 'Password Protected' && (
                   <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 shadow-sm rounded flex items-center gap-1">
                     <Lock className="w-3 h-3 text-amber-600" /> Password
                   </span>
                 )}
                 {catalogue.visibility === 'Private' && (
                   <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm rounded flex items-center gap-1">
                     <Shield className="w-3 h-3 text-indigo-600" /> Private
                   </span>
                 )}
                 {(!catalogue.visibility || catalogue.visibility === 'Public') && (
                   <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 shadow-sm rounded flex items-center gap-1">
                     <Globe className="w-3 h-3 text-sky-600" /> Public
                   </span>
                 )}
                 {catalogue.expiryDate && (
                   <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border shadow-sm rounded flex items-center gap-1 ${
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
              <h3 className="text-base font-bold text-slate-900 mb-1 leading-tight">{catalogue.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{catalogue.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4 py-3 border-y border-slate-100">
                 <div>
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Products</span>
                   <span className="text-sm font-semibold text-slate-800">{catalogue.productIds.length}</span>
                 </div>
                 <div>
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Updated</span>
                   <span className="text-sm font-semibold text-slate-800">{new Date(catalogue.updatedAt).toLocaleDateString()}</span>
                 </div>
                 <div>
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5"><Eye className="w-3 h-3 inline mr-1" /> Views</span>
                   <span className="text-sm font-semibold text-slate-800">{catalogue.views || 0}</span>
                 </div>
                 <div>
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5"><ShoppingCart className="w-3 h-3 inline mr-1" /> Enquiries</span>
                   <span className="text-sm font-semibold text-slate-800">{catalogue.ordersCount || 0}</span>
                 </div>
              </div>
              
              <div className="mt-auto grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => setActiveShareModal(catalogue)}
                   className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition shadow-sm"
                 >
                   <Share2 className="w-3.5 h-3.5 mr-2" /> Share
                 </button>
                 <a 
                   href={getPublicLink(catalogue.id)}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center justify-center px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition shadow-sm"
                 >
                   <Eye className="w-3.5 h-3.5 mr-2" /> Preview
                 </a>
                 <button 
                   onClick={() => setActiveSettingsModal(catalogue)}
                   className="col-span-2 flex items-center justify-center px-4 py-2 border border-slate-200 bg-slate-50 text-slate-600 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition shadow-sm"
                 >
                   <Settings className="w-3.5 h-3.5 mr-2" /> Visibility Controls
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeShareModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
               <h3 className="text-sm font-bold text-slate-900 flex items-center"><Share2 className="w-4 h-4 mr-2 text-indigo-600" /> Share Catalogue</h3>
               <button onClick={() => setActiveShareModal(null)} className="text-slate-400 hover:text-slate-600 bg-white rounded p-1 shadow-sm border border-slate-200">
                 <X className="w-4 h-4" />
               </button>
            </div>
            <div className="p-6 space-y-6">
               <div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Public Link</p>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     readOnly 
                     value={getPublicLink(activeShareModal.id)} 
                     className="w-full text-xs p-2 border border-slate-300 rounded bg-slate-50 focus:outline-none focus:border-indigo-500 font-mono text-slate-600" 
                   />
                   <button 
                     onClick={() => handleCopyLink(activeShareModal.id)}
                     className="px-3 py-2 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition"
                   >
                     <Copy className="w-4 h-4" />
                   </button>
                 </div>
               </div>
               
               <div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Share Options</p>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleWhatsAppShare(activeShareModal)}
                      className="flex items-center justify-center gap-2 p-3 border border-[#25D366] bg-green-50 text-[#25D366] rounded hover:bg-[#25D366] hover:text-white transition group"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs font-bold">WhatsApp</span>
                    </button>
                    <button 
                      onClick={() => handleEmailShare(activeShareModal)}
                      className="flex items-center justify-center gap-2 p-3 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-600 hover:text-white transition group"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-xs font-bold">Email</span>
                    </button>
                 </div>
               </div>
               
               <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 w-full text-left">QR Code</p>
                 <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm mb-3">
                    <QRCodeSVG value={getPublicLink(activeShareModal.id)} size={128} />
                 </div>
                 <div className="flex gap-4">
                   <button className="text-[10px] font-bold text-indigo-600 uppercase hover:underline flex flex-col items-center">
                     <span>Download PNG</span>
                   </button>
                   <button className="text-[10px] font-bold text-slate-600 uppercase hover:underline flex flex-col items-center">
                     <span>Print QR</span>
                   </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
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
