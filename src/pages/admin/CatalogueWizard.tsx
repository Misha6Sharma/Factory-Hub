import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/StoreContext';
import { ArrowLeft, ArrowRight, Check, Upload, Image as ImageIcon, Link as LinkIcon, QrCode, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Catalogue } from '../../types';

const STEPS = [
  'Details',
  'Upload Products',
  'Publish & Share'
];

export default function CatalogueWizard() {
  const navigate = useNavigate();
  const { createCatalogue, factory } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=400&fit=crop',
  });

  const generateId = () => `CAT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const handleNext = () => {
    if (currentStep === 0 && !formData.name) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      // Finish wizard
      const newCatalogue: Catalogue = {
        id: generateId(),
        name: formData.name,
        description: formData.description,
        coverImage: formData.coverImage,
        status: 'Live',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        ordersCount: 0,
        productIds: []
      };
      createCatalogue(newCatalogue);
      navigate(`/admin/catalogues/${newCatalogue.id}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    } else {
      navigate('/admin/catalogues');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Create New Catalogue</h2>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200">
          <div 
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"
          ></div>
        </div>
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {STEPS.map((step, idx) => (
            <span key={step} className={idx <= currentStep ? 'text-indigo-600' : ''}>{step}</span>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 sm:p-8">
        {currentStep === 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Catalogue Details</h3>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Catalogue Name</label>
              <input
                type="text"
                autoFocus
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-slate-900"
                placeholder="e.g. Summer Collection 2026"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
              <textarea
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                placeholder="Describe your catalogue"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Cover Image</label>
              <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden group">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/jpeg, image/png, image/webp" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 500 * 1024) {
                      alert("File size exceeds 500KB. Please upload a smaller image.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, coverImage: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }} />
                {formData.coverImage ? (
                  <>
                    <img src={formData.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                       <span className="text-white text-xs font-bold">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    <span className="text-xs font-semibold">Upload Cover</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Upload Products to "{formData.name}"</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">Use our standard template to upload multiple products at once.</p>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 mb-1">Standard Upload Template</h4>
                  <p className="text-[10px] text-indigo-700 max-w-sm">Download the correct format for importing products. Make sure to adhere to mandatory fields like Product Name, Article Code, and Offer Price.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <button className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-white border border-indigo-200 rounded text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm">
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Sample
                  </button>
                  <button className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-indigo-600 border border-transparent rounded text-[10px] font-bold uppercase tracking-wider text-white hover:bg-indigo-700 transition-colors shadow-sm">
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Template
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-6 hover:border-indigo-300 transition-colors cursor-pointer bg-slate-50 flex flex-col items-center justify-center min-h-[160px] group relative">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".csv, .xlsx" />
                <Upload className="w-8 h-8 text-indigo-500 mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-transform" />
                <h4 className="text-sm font-bold text-slate-800 mb-1">Upload Product File</h4>
                <p className="text-[10px] text-slate-500">Supported: .csv, .xlsx (Max 50MB)</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-6 hover:border-indigo-300 transition-colors cursor-pointer bg-slate-50 flex flex-col items-center justify-center min-h-[160px] group relative">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".zip" />
                <FileSpreadsheet className="w-8 h-8 text-slate-400 mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-transform" />
                <h4 className="text-sm font-bold text-slate-800 mb-1">Upload Images (Zip)</h4>
                <p className="text-[10px] text-slate-500 text-center">Images matched by Article Code<br/>(e.g., MCS101.jpg)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded p-4">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-amber-800 mb-1">Validation Note</h5>
                <p className="text-[10px] text-amber-700 leading-relaxed">Before finalizing, the system will check for duplicate Article Codes, negative pricing, missing names, and invalid image links. You will have a chance to review any errors.</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Catalogue is Ready!</h3>
            <p className="text-xs text-slate-500 mb-8">"{formData.name}" has been prepared.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded cursor-pointer hover:bg-slate-100 transition-colors w-full sm:w-auto">
                <LinkIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">Copy Public Link</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded cursor-pointer hover:bg-slate-100 transition-colors w-full sm:w-auto">
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">Generate QR Code</span>
              </div>
            </div>
          </div>
        )}

      </div>
      
      <div className="flex justify-between">
        <button 
          onClick={handleBack}
          className="px-4 py-2 border border-slate-200 bg-white rounded font-bold text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-50"
        >
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </button>
        <button 
          onClick={handleNext}
          disabled={currentStep === 0 && !formData.name}
          className="px-4 py-2 border border-transparent bg-indigo-600 rounded font-bold text-xs uppercase tracking-wider text-white hover:bg-indigo-700 flex items-center disabled:opacity-50"
        >
          {currentStep === STEPS.length - 1 ? 'Go to Catalogue' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </button>
      </div>
    </div>
  );
}
