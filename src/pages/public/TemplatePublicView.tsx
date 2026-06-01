import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Table, ArrowLeft } from 'lucide-react';
import { getTemplateById, downloadTemplateAsExcel, downloadTemplateAsCSV } from '../../lib/templates';

export default function TemplatePublicView() {
  const { id } = useParams();
  const template = getTemplateById(id || '');

  if (!template) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-black text-slate-800 mb-2">Template Not Found</h1>
        <p className="text-slate-500 mb-6">The template you are looking for does not exist or has been removed.</p>
        <Link to="/" className="text-indigo-600 font-bold hover:underline">Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-gradient-to-b from-white to-slate-50 pb-12">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 font-black tracking-tighter text-xl">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                <span className="text-white text-lg">F</span>
              </div>
              Factory Store
            </Link>
            <div className="flex gap-2">
              <button 
                onClick={() => downloadTemplateAsCSV(template.id)} 
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase tracking-wider hover:bg-blue-200 transition"
              >
                CSV (.csv)
              </button>
              <button 
                onClick={() => downloadTemplateAsExcel(template.id)} 
                className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Excel
              </button>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-start gap-4">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
               <Table className="w-8 h-8" />
            </div>
            <div>
               <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">{template.name}</h1>
               <p className="text-slate-600 text-sm max-w-3xl leading-relaxed mb-4">{template.description}</p>
               <div className="flex items-center gap-4">
                 <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded">Version {template.version}</span>
                 <span className="text-xs text-slate-500">Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
               </div>
            </div>
          </div>
          
          <div className="p-8 bg-slate-50">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Format Preview</h2>
            <div className="bg-white border border-slate-200 shadow-sm rounded overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr>
                    {template.columns.map((col: string, idx: number) => (
                      <th key={idx} className="p-3 border-b border-r last:border-r-0 border-slate-200 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(template.sampleData || [[], [], []]).slice(0, 3).map((row: any[], rowIdx: number) => (
                    <tr key={rowIdx} className="border-b last:border-b-0 border-slate-100">
                      {template.columns.map((col: string, colIdx: number) => (
                        <td key={colIdx} className="p-3 border-r last:border-r-0 border-slate-100 text-xs text-slate-500 font-mono whitespace-nowrap">
                          {row[colIdx] !== undefined ? row[colIdx] : (colIdx === 0 ? `Sample ${rowIdx + 1}` : '...')}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {(!template.sampleData || template.sampleData.length < 3) && [...Array(3 - (template.sampleData?.length || 0))].map((_, i) => (
                    <tr key={`empty-${i}`} className="border-b last:border-b-0 border-slate-100">
                      {template.columns.map((col: string, colIdx: number) => (
                        <td key={colIdx} className="p-3 border-r last:border-r-0 border-slate-100 text-xs text-slate-500 font-mono whitespace-nowrap">
                          {colIdx === 0 ? `Sample Data` : '...'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 flex justify-center pb-4">
              <button 
                onClick={() => downloadTemplateAsExcel(template.id)} 
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg text-sm font-black uppercase tracking-wider hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" /> Download Full Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
