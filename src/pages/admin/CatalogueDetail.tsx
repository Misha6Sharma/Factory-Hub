import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/StoreContext';
import { ArrowLeft, Search, Plus, MoreHorizontal, Link as LinkIcon, Download, Trash2, Edit, Upload, Globe, Settings, Lock, Shield, Clock, X } from 'lucide-react';
import { Product } from '../../types';

function ProductEditor({ product, onSave, onCancel }: { product: Partial<Product> | null; onSave: (p: Product) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    id: `PRD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    name: '', articleCode: '', sku: '', category: '', description: '',
    material: '', size: '', color: '', moq: 1, offerPrice: 0, mrp: 0,
    availableQuantity: 0, deliveryTimeDays: 7, images: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
          <h2 className="text-lg font-bold text-slate-800">{product?.id ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
               <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" required />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">Article Code *</label>
               <input name="articleCode" value={formData.articleCode || ''} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" required />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">Offer Price (₹) *</label>
               <input type="number" name="offerPrice" value={formData.offerPrice || 0} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" required />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">MRP (₹)</label>
               <input type="number" name="mrp" value={formData.mrp || 0} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">MOQ</label>
               <input type="number" name="moq" value={formData.moq || 1} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">Available Qty</label>
               <input type="number" name="availableQuantity" value={formData.availableQuantity || 0} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
               <input name="category" value={formData.category || ''} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1">Color</label>
               <input name="color" value={formData.color || ''} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" />
             </div>
             <div className="col-span-2">
               <label className="block text-xs font-bold text-slate-700 mb-1">Product Image</label>
               <input 
                 type="file"
                 accept="image/jpeg, image/png, image/webp"
                 onChange={e => {
                   const file = e.target.files?.[0];
                   if (file) {
                     if (file.size > 500 * 1024) {
                       alert("File size exceeds 500KB. Please upload a smaller image.");
                       return;
                     }
                     const reader = new FileReader();
                     reader.onloadend = () => {
                       setFormData(prev => ({ ...prev, images: [reader.result as string] }));
                     };
                     reader.readAsDataURL(file);
                   }
                 }} 
                 className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 bg-white" 
               />
               {formData.images?.[0] && (
                 <div className="mt-2 h-20 w-20 relative rounded overflow-hidden border border-slate-200">
                    <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover" />
                 </div>
               )}
             </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded">Cancel</button>
          <button onClick={() => onSave(formData as Product)} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Product</button>
        </div>
      </div>
    </div>
  );
}

export default function CatalogueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { catalogues, products, updateCatalogue, deleteCatalogue, addProduct, updateProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const catalogue = catalogues.find(c => c.id === id);

  if (!catalogue) {
    return <div className="p-8 text-center text-slate-500">Catalogue not found</div>;
  }

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [activeSettingsModal, setActiveSettingsModal] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);

  const handleSaveProduct = (productData: Product) => {
    if (editingProductId) {
      updateProduct(productData);
    } else {
      addProduct(productData);
      if (catalogue) {
        updateCatalogue({
          ...catalogue,
          productIds: [...catalogue.productIds, productData.id],
          updatedAt: new Date().toISOString()
        });
      }
    }
    setIsAddingProduct(false);
    setEditingProductId(null);
  };

  const editingProduct = editingProductId ? products.find(p => p.id === editingProductId) || null : null;

  const handleShare = () => {
    prompt('Copy this link to share:', `${window.location.origin}/store/c/${id}`);
  };
  const [editForm, setEditForm] = useState({ name: catalogue?.name || '', description: catalogue?.description || '', coverImage: catalogue?.coverImage || '' });

  const handleSaveCatalogue = () => {
    if (catalogue) {
      updateCatalogue({ ...catalogue, ...editForm, updatedAt: new Date().toISOString() });
      setIsEditing(false);
    }
  };

  const removeProductFromCatalogue = (productId: string) => {
    if (catalogue) {
      updateCatalogue({
        ...catalogue,
        productIds: catalogue.productIds.filter(id => id !== productId),
        updatedAt: new Date().toISOString()
      });
    }
  };
  
  const catalogueProducts = products.filter(p => catalogue.productIds.includes(p.id));
  
  const filteredProducts = catalogueProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.articleCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this catalogue?')) {
      deleteCatalogue(catalogue.id);
      navigate('/admin/catalogues');
    }
  };

  const setStatus = (status: 'Live' | 'Draft' | 'Archived') => {
    updateCatalogue({ ...catalogue, status, updatedAt: new Date().toISOString() });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Simulated import process
      setTimeout(() => {
        alert(`Successfully imported 15 products from ${file.name} and appended to ${catalogue.name}.`);
        // We could generate some dummy products and append them here
        const newProduct = {
          id: `PRD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          name: 'Bulk Uploaded Item',
          articleCode: 'NEW-123',
          sku: 'SKU-NEW-123',
          category: 'Imported',
          description: 'Uploaded via Bulk Import',
          material: '',
          size: 'M',
          color: 'Mixed',
          moq: 50,
          offerPrice: 499,
          mrp: 999,
          availableQuantity: 1000,
          deliveryTimeDays: 7,
          images: [],
        };
        addProduct(newProduct);
        updateCatalogue({
          ...catalogue,
          productIds: [...catalogue.productIds, newProduct.id],
          updatedAt: new Date().toISOString()
        });
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      <input type="file" id="bulk-upload" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
      {(isAddingProduct || editingProductId) && (
        <ProductEditor 
          product={editingProduct} 
          onSave={handleSaveProduct} 
          onCancel={() => { setIsAddingProduct(false); setEditingProductId(null); }} 
        />
      )}
      <button 
        onClick={() => navigate('/admin/catalogues')}
        className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        BACK TO CATALOGUES
      </button>

      {/* Header section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-64 h-48 md:h-auto bg-slate-100 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 relative">
          <img src={catalogue.coverImage} alt={catalogue.name} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[90%]">
             <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded border ${
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
                    ? 'bg-rose-50 text-rose-700 border-rose-250 animate-pulse' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-250'
                }`}>
                  <Clock className="w-3 h-3" /> {new Date(catalogue.expiryDate) < new Date() ? 'Expired' : 'Expires Soon'}
                </span>
              )}
          </div>
        </div>
        <div className="p-6 flex flex-col flex-1 justify-between">
          <div>
            <div className="flex justify-between items-start">
              {isEditing ? (
                <div className="w-full mr-4">
                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full text-lg font-black text-slate-900 border border-slate-300 rounded px-2 py-1 mb-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full text-sm text-slate-700 border border-slate-300 rounded px-2 py-1 mb-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500" rows={2} />
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-500">Cover Image:</span>
                     <input type="file" accept="image/jpeg, image/png, image/webp" onChange={e => {
                       const file = e.target.files?.[0];
                       if (file) {
                         if (file.size > 500 * 1024) {
                           alert("File size exceeds 500KB. Please upload a smaller image.");
                           return;
                         }
                         const reader = new FileReader();
                         reader.onloadend = () => {
                           setEditForm({...editForm, coverImage: reader.result as string});
                         };
                         reader.readAsDataURL(file);
                       }
                     }} className="w-full text-sm font-medium text-slate-700 border border-slate-300 rounded px-2 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                   </div>
                </div>
              ) : (
                <div className="flex-1 mr-4">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{catalogue.name}</h1>
                  <p className="text-sm text-slate-500 mt-1">{catalogue.description}</p>
                </div>
              )}
              <div className="flex gap-2 shrink-0">
                {isEditing ? (
                  <button onClick={handleSaveCatalogue} className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition">Save</button>
                ) : (
                  <>
                    <button onClick={() => setIsEditing(true)} className="p-2 border border-slate-200 text-slate-600 rounded hover:bg-slate-50 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={handleDelete} className="p-2 border border-slate-200 text-red-600 rounded hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
               <div>
                 <span className="block text-[10px] uppercase font-bold text-slate-400">Total Products</span>
                 <span className="text-xl font-black text-slate-900">{catalogue.productIds.length}</span>
               </div>
               <div>
                 <span className="block text-[10px] uppercase font-bold text-slate-400">Store Views</span>
                 <span className="text-xl font-black text-slate-900">{catalogue.views}</span>
               </div>
               <div>
                 <span className="block text-[10px] uppercase font-bold text-slate-400">Orders</span>
                 <span className="text-xl font-black text-slate-900">{catalogue.ordersCount}</span>
               </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-6">
            <button onClick={handleShare} className="flex-1 max-w-[200px] flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition shadow-sm">
              <LinkIcon className="w-3.5 h-3.5 mr-2" /> Share Link
            </button>
            <button 
              onClick={() => setActiveSettingsModal(true)} 
              className="px-4 py-2 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm"
            >
              <Settings className="w-3.5 h-3.5" /> Visibility & Access
            </button>
            <div className="relative">
              <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition">
                Status: {catalogue.status}
              </button>
              {showStatusMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded shadow-lg z-20 overflow-hidden">
                    <button onClick={() => { setStatus('Live'); setShowStatusMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-b border-slate-100">Set Live</button>
                    <button onClick={() => { setStatus('Draft'); setShowStatusMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-b border-slate-100">Set Draft</button>
                    <button onClick={() => { setStatus('Archived'); setShowStatusMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Archive</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Management Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-t border-slate-200 pt-6 mt-2">
        <h3 className="text-lg font-bold text-slate-800">Catalogue Products</h3>
        <div className="flex flex-wrap gap-2">
           <button onClick={() => navigate('/admin/templates')} className="flex items-center px-3 py-1.5 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-100 transition shadow-sm">
             <Download className="w-3.5 h-3.5 mr-1.5" /> Template
           </button>
           <button className="flex items-center px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition shadow-sm">
             <Download className="w-3.5 h-3.5 mr-1.5" /> Export DB
           </button>
           <div className="relative group">
                  <button onClick={() => setIsAddingProduct(true)} className="flex items-center px-3 py-1.5 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition shadow-sm w-full">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add New Product
                  </button>
             <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded shadow-lg hidden group-hover:block z-10 p-1">
                <button className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded">Browse Master</button>
                <button onClick={() => document.getElementById('bulk-upload')?.click()} className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded flex items-center justify-between border-t border-slate-100 mt-1 pt-1">
                  <span>Import via Excel</span>
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <div className="px-3 py-1.5 text-[9px] text-slate-500 leading-tight">
                  Supports adding new products or bulk updating pricing/status of existing.
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Product Search & Grid */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 w-full sm:w-80">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Search products in catalogue..." 
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded border border-slate-200 overflow-hidden flex flex-col group">
            <div className="aspect-[4/3] bg-slate-50 border-b border-slate-100 overflow-hidden">
               <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider w-fit mb-1 truncate">{product.articleCode}</span>
              <h4 className="text-xs font-bold text-slate-900 mb-1 truncate">{product.name}</h4>
              <p className="text-[10px] text-slate-500 truncate mb-2">{product.category}</p>
              
              <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">₹{product.offerPrice}</span>
                <div className="flex gap-2">
                  <button onClick={() => setEditingProductId(product.id)} className="text-[9px] font-bold uppercase text-slate-400 hover:text-indigo-600 transition-colors tracking-wider">
                    Edit
                  </button>
                  <button onClick={() => removeProductFromCatalogue(product.id)} className="text-[9px] font-bold uppercase text-slate-400 hover:text-red-500 transition-colors tracking-wider">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded text-slate-500">
             <p className="text-sm font-semibold mb-2">No products found</p>
             <button className="text-indigo-600 text-xs font-bold uppercase hover:underline">Browse Master Catalogue</button>
          </div>
        )}
      </div>

      {activeSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 text-left">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
               <div className="flex flex-col">
                 <h3 className="text-sm font-bold text-slate-900 flex items-center">
                   <Settings className="w-4 h-4 mr-2 text-indigo-600" /> 
                   Visibility & Access Control
                 </h3>
                 <span className="text-[10px] text-slate-500 font-medium ml-6 mt-0.5">{catalogue.name}</span>
               </div>
               <button onClick={() => setActiveSettingsModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded p-1 shadow-sm border border-slate-200">
                 <X className="w-4 h-4" />
               </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Visibility Strategy Selection */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Catalogue Visibility</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-lg">
                  {(['Public', 'Password Protected', 'Private'] as const).map((mode) => {
                    const isActive = (catalogue.visibility || 'Public') === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          updateCatalogue({
                            ...catalogue,
                            visibility: mode,
                            password: mode === 'Password Protected' && !catalogue.password ? 'B2B_Showroom_123' : catalogue.password,
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
              {catalogue.visibility === 'Password Protected' && (
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
                      value={catalogue.password || ''}
                      onChange={(e) => {
                        updateCatalogue({
                          ...catalogue,
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-indigo-650"
                    >
                      {showPasswordText ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}

              {catalogue.visibility === 'Private' && (
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

              {(!catalogue.visibility || catalogue.visibility === 'Public') && (
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
                  {catalogue.expiryDate && (
                    <button
                      type="button"
                      onClick={() => {
                        updateCatalogue({
                          ...catalogue,
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
                    value={catalogue.expiryDate || ''}
                    onChange={(e) => {
                      updateCatalogue({
                        ...catalogue,
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
                        ...catalogue,
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
                        ...catalogue,
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
                        ...catalogue,
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
                onClick={() => setActiveSettingsModal(false)}
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
