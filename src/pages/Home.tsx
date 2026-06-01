import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Store } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col justify-center items-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl tracking-tight font-black text-slate-900 sm:text-5xl md:text-6xl">
            <span className="block">Digital Factory</span>
            <span className="block text-indigo-600">Storefront</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-sm text-slate-500 sm:text-base font-medium">
            A complete platform for manufacturers to create digital catalogues, receive orders, and manage quotations.
          </p>
        </div>

        <div className="mt-10 max-w-xl mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Factory Portal */}
          <div 
            onClick={() => navigate('/admin')}
            className="group relative bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all p-8 cursor-pointer flex flex-col items-center hover:border-indigo-300"
          >
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded flex items-center justify-center transition-colors shadow-sm">
              <Building2 className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-sm font-bold uppercase tracking-wider text-slate-900">Factory Owner</h3>
            <p className="mt-2 text-xs font-medium text-slate-500 text-center">
              Manage products, orders, and quotations.
            </p>
          </div>

          {/* Buyer Portal */}
          <div 
            onClick={() => navigate('/store')}
            className="group relative bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all p-8 cursor-pointer flex flex-col items-center hover:border-slate-400"
          >
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded flex items-center justify-center transition-colors shadow-sm">
              <Store className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="mt-4 text-sm font-bold uppercase tracking-wider text-slate-900">B2B Buyer</h3>
            <p className="mt-2 text-xs font-medium text-slate-500 text-center">
              Browse catalogues, place bulk orders, and request quotes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
