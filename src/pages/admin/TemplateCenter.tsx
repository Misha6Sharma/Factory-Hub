import React, { useState } from 'react';
import { Download, FileSpreadsheet, Share2, Link as LinkIcon, MessageCircle, Eye, History, X, FileText } from 'lucide-react';
import { STANDARD_TEMPLATES, SAMPLE_CATALOGUES, downloadTemplateAsExcel, downloadTemplateAsCSV } from '../../lib/templates';

export default function TemplateCenter() {
  const [activeTab, setActiveTab] = useState<'standard' | 'samples'>('standard');
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [versionHistoryTemplate, setVersionHistoryTemplate] = useState<any | null>(null);

  const getTemplateUrl = (templateId: string) => {
    return `${window.location.origin}/templates/${templateId}`;
  };

  const handleCopyLink = (templateId: string) => {
    navigator.clipboard.writeText(getTemplateUrl(templateId));
    alert('Template link copied to clipboard!');
  };

  const handleWhatsAppShare = (templateId: string) => {
    const url = getTemplateUrl(templateId);
    window.open(`https://wa.me/?text=${encodeURIComponent(`Here is the template format we use for product uploads: ${url}`)}`, '_blank');
  };

  const handleDownloadExcel = (templateId: string) => {
    downloadTemplateAsExcel(templateId);
  };

  const handleDownloadCSV = (templateId: string) => {
    downloadTemplateAsCSV(templateId);
  };

  const displayTemplates = activeTab === 'standard' ? STANDARD_TEMPLATES : SAMPLE_CATALOGUES;


  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-900 mb-2">Template Centre</h2>
        <p className="text-sm text-slate-500 max-w-3xl">Download, share, and use professionally formatted Excel templates to standardize your factory operations. Use the samples to see exactly how your data should be structured for a flawless upload every time.</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('standard')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'standard' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Standard Templates
        </button>
        <button 
          onClick={() => setActiveTab('samples')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeTab === 'samples' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Industry Sample Catalogues
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col hover:border-indigo-300 transition-colors">
            <div className="p-5 flex-1 relative">
              <div className="absolute top-4 right-4 text-right">
                <button 
                  onClick={() => setVersionHistoryTemplate(template)}
                  className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded hover:bg-indigo-100 transition-colors"
                >
                  <History className="w-3 h-3 mr-1" /> {template.version}
                </button>
                <div className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                  Updated: {new Date(template.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="pr-20 mb-2">
                 <h3 className="text-sm font-bold text-slate-800 leading-tight">{template.name}</h3>
                 <span className="text-[10px] text-slate-400 inline-block mt-1 font-mono">{template.fileName}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-4">{template.description}</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setPreviewTemplate(template)}
                  className="flex items-center px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded text-[9px] font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors"
                >
                  <Eye className="w-3 h-3 mr-1.5" /> Preview Format
                </button>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 lg:grid-cols-4 gap-2">
              <button onClick={() => handleDownloadExcel(template.id)} className="flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-700 transition shadow-sm">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Excel (.xlsx)
              </button>
              <button onClick={() => handleDownloadCSV(template.id)} className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition shadow-sm">
                <Download className="w-3.5 h-3.5 mr-1.5" /> CSV (.csv)
              </button>
              <button 
                onClick={() => handleCopyLink(template.id)}
                title="Copy Cloud Link"
                className="flex items-center justify-center px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition shadow-sm"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleWhatsAppShare(template.id)}
                title="Share via WhatsApp"
                className="flex items-center justify-center px-4 py-2 border border-[#25D366] bg-green-50 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded text-[10px] font-bold uppercase tracking-wider transition shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {activeTab === 'standard' && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-blue-900 mb-2">AI-Assisted Column Mapping Available</h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              Have an existing format from your ERP? You don't need to manually reformat your Excel files. Upload your existing file to the Catalogue Manager and our AI-Assisted Mapper will automatically map your custom columns (like "Item_Code") to our standard fields (like "Article Code").
            </p>
          </div>
          <button className="whitespace-nowrap px-4 py-2 bg-white border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider rounded hover:bg-blue-100 transition-colors shadow-sm">
            View Mapper Guide
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{previewTemplate.name} Preview</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{previewTemplate.fileName}</p>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="p-1 text-slate-400 hover:bg-slate-200 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-x-auto overflow-y-auto flex-1 bg-slate-100">
              <div className="bg-white border border-slate-200 shadow-sm rounded">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr>
                      {previewTemplate.columns.map((col: string, idx: number) => (
                        <th key={idx} className="p-3 border-b border-r last:border-r-0 border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map(rowNum => (
                      <tr key={rowNum} className="border-b last:border-b-0 border-slate-100">
                        {previewTemplate.columns.map((col: string, idx: number) => (
                          <td key={idx} className="p-3 border-r last:border-r-0 border-slate-100 text-xs text-slate-500 font-mono whitespace-nowrap">
                            {idx === 0 ? `Sample Data ${rowNum}` : `...`}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
              <button 
                onClick={() => {
                  handleDownloadCSV(previewTemplate.id);
                  setPreviewTemplate(null);
                }} 
                className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition"
              >
                Download CSV
              </button>
              <button 
                onClick={() => {
                  handleDownloadExcel(previewTemplate.id);
                  setPreviewTemplate(null);
                }} 
                className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition"
              >
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {versionHistoryTemplate && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
              <h3 className="text-sm font-bold text-slate-800">Version History</h3>
              <button onClick={() => setVersionHistoryTemplate(null)} className="p-1 text-slate-400 hover:bg-slate-200 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="relative pl-6 pb-4 border-l-2 border-indigo-200 last:border-l-0 last:pb-0">
                <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-white" />
                <h4 className="text-xs font-bold text-slate-900">{versionHistoryTemplate.version} (Current)</h4>
                <p className="text-[10px] text-slate-500 mt-1">Published: {new Date(versionHistoryTemplate.updatedAt).toLocaleDateString()}</p>
                <p className="text-xs text-slate-600 mt-2">Latest production release.</p>
              </div>
              <div className="relative pl-6 pb-4 border-l-2 border-slate-200 last:border-l-0 last:pb-0">
                <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white" />
                <h4 className="text-xs font-bold text-slate-600">v1.0 (Legacy)</h4>
                <p className="text-[10px] text-slate-400 mt-1">Published: 2025-05-10</p>
                <button className="mt-2 text-[10px] font-bold text-indigo-600 hover:underline">Download Legacy Version</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
