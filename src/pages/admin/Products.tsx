import React, { useState } from 'react';
import { useStore } from '../../lib/StoreContext';
import { Plus, Search, Filter, MoreHorizontal, Image as ImageIcon, Edit, Trash2 } from 'lucide-react';
import { Product } from '../../types';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.articleCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-800">Product Catalogue</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5 -ml-0.5" />
          NEW PRODUCT
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search products by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="w-5 h-5 mr-2 -ml-1 text-gray-400" />
          Filter
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-3">Product</th>
                <th scope="col" className="px-4 py-3">Code</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Price (₹)</th>
                <th scope="col" className="px-4 py-3">Stock</th>
                <th scope="col" className="px-4 py-3 text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {product.images[0] ? (
                          <img className="h-8 w-8 rounded-md object-cover border border-slate-200" src={product.images[0]} alt="" />
                        ) : (
                          <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="font-semibold text-slate-900">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-slate-900">{product.articleCode}</div>
                    <div className="text-[10px] text-slate-500">SKU: {product.sku}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-900 font-medium">
                    ₹{product.offerPrice} <span className="line-through text-slate-400 text-[10px] ml-1 font-normal">₹{product.mrp}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {product.availableQuantity} units
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-medium relative">
                    <button onClick={() => setActiveMenuId(activeMenuId === product.id ? null : product.id)} className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {activeMenuId === product.id && (
                      <div className="absolute right-8 top-10 mt-1 w-32 bg-white border border-slate-200 rounded shadow-lg z-20 py-1">
                        <button onClick={() => { setEditingProduct(product); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between">
                          Edit <Edit className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <button onClick={() => { if(confirm('Delete product?')) deleteProduct(product.id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-red-50 text-red-700 flex items-center justify-between border-t border-slate-100">
                          Delete <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <ProductModal 
          onClose={() => setShowAddModal(false)}
          onSave={addProduct}
        />
      )}
      
      {editingProduct && (
        <ProductModal 
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={updateProduct}
        />
      )}
      
      {activeMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave }: { product?: Product | null, onClose: () => void, onSave: (p: Product) => void }) {
  const [formData, setFormData] = useState({
    name: product?.name || '', articleCode: product?.articleCode || '', sku: product?.sku || '', category: product?.category || 'Apparel',
    description: product?.description || '', material: product?.material || '', size: product?.size || '', color: product?.color || '',
    moq: product?.moq || 10, offerPrice: product?.offerPrice || 0, mrp: product?.mrp || 0, availableQuantity: product?.availableQuantity || 0, deliveryTimeDays: product?.deliveryTimeDays || 7,
    images: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const imagesToSave = formData.images ? [formData.images] : (product?.images || ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&fit=crop&q=80']);
    const productData = {
      ...formData,
    };
    delete (productData as any).images;
    
    onSave({
      id: product?.id || `PRD-${Date.now()}`,
      ...productData,
      images: imagesToSave
    } as Product);
    onClose();
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Article Code</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.articleCode} onChange={e => setFormData({...formData, articleCode: e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU Code</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}/>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative overflow-hidden group">
                  <div className="space-y-1 text-center">
                    {product?.images?.[0] || formData.images ? (
                      <div className="relative h-32 w-32 mx-auto">
                        <img 
                          src={formData.images || product?.images?.[0]} 
                          className="h-full w-full object-cover rounded-md" 
                          alt="preview" 
                        />
                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-md">
                           <span className="text-white text-xs font-bold">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 p-1">
                            <span>Upload a file</span>
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 500KB</p>
                      </>
                    )}
                  </div>
                  <input id="file-upload" name="file-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/jpeg, image/png, image/webp" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 500 * 1024) {
                        alert("File size exceeds 500KB. Please upload a smaller image.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, images: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Offer Price (₹)</label>
                <input required type="number" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.offerPrice} onChange={e => setFormData({...formData, offerPrice: Number(e.target.value)})}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">MRP (₹)</label>
                <input required type="number" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.mrp} onChange={e => setFormData({...formData, mrp: Number(e.target.value)})}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">MOQ (Minimum Order Qty)</label>
                <input required type="number" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.moq} onChange={e => setFormData({...formData, moq: Number(e.target.value)})}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Available Stock</label>
                <input required type="number" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.availableQuantity} onChange={e => setFormData({...formData, availableQuantity: Number(e.target.value)})}/>
              </div>
            </div>
            
            <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {product ? 'Save Product' : 'Upload Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
