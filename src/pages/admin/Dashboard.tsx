import React, { useState } from 'react';
import { useStore } from '../../lib/StoreContext';
import { 
  Users, 
  ShoppingCart, 
  FileText, 
  IndianRupee, 
  TrendingUp,
  Clock,
  Eye,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  MousePointerClick,
  MapPin,
  ChevronRight,
  BarChart4,
  Briefcase
} from 'lucide-react';

export default function Dashboard() {
  const { analytics, orders, quotes, catalogues } = useStore();
  const liveCatalogues = catalogues.filter(c => c.status === 'Live');
  
  // State for selecting which catalogue's analytics to display
  const [selectedCatId, setSelectedCatId] = useState(catalogues[0]?.id || '');
  const activeCatalogue = catalogues.find(c => c.id === selectedCatId);
  const catAnalytics = activeCatalogue?.analytics;

  const cards = [
    { name: 'Total Revenue', value: `₹${analytics.revenue.toLocaleString()}`, icon: IndianRupee, color: 'bg-green-50 text-green-600' },
    { name: 'Total Orders', value: analytics.totalOrders, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { name: 'Pending Quotes', value: analytics.pendingQuotations, icon: FileText, color: 'bg-yellow-50 text-yellow-600' },
    { name: 'Recent Enquiries', value: analytics.recentEnquiries, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
  ];

  // Helper to calculate device percentages safely
  const getDevicePercentages = () => {
    if (!catAnalytics || !catAnalytics.devices) return { mobile: 0, desktop: 0, tablet: 0 };
    const { mobile, desktop, tablet } = catAnalytics.devices;
    const total = mobile + desktop + tablet;
    if (total === 0) return { mobile: 0, desktop: 0, tablet: 0 };
    return {
      mobile: Math.round((mobile / total) * 100),
      desktop: Math.round((desktop / total) * 100),
      tablet: Math.round((tablet / total) * 100)
    };
  };

  const devPct = getDevicePercentages();

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Dashboard Overview</h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
          Last updated: Just now
        </div>
      </div>

      {/* Global summary count list */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.name} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">{card.name}</p>
             <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
                <div className={`p-1.5 rounded-md ${card.color}`}>
                  <card.icon className="w-4 h-4" aria-hidden="true" />
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* DETAILED CATALOGUE VISITOR ANALYTICS SECTION */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart4 className="w-4 h-4 text-indigo-650" />
              Catalogue Link Visitor Analytics
            </h3>
            <p className="text-[10px] text-slate-500">Select any collection link below to audit performance counters, clicked items, geo origins, and device statistics.</p>
          </div>
          
          {/* Collection Picker Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Select link:</span>
            <select 
              value={selectedCatId} 
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-white border border-slate-250 rounded py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {catalogues.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name} ({cat.status})</option>
              ))}
            </select>
          </div>
        </div>

        {activeCatalogue && catAnalytics ? (
          <div className="p-5 space-y-6">
            
            {/* 4 Analytics Target Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total Link Hits</span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-800">{catAnalytics.views.toLocaleString()}</span>
                  <Eye className="w-4 h-4 text-indigo-500" />
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Unique Visitors</span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-800">{catAnalytics.uniqueVisitors.toLocaleString()}</span>
                  <Users className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Cart Additions</span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-800">{catAnalytics.cartAdditions.toLocaleString()}</span>
                  <ShoppingCart className="w-4 h-4 text-amber-500" />
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Quote RFQs Sent</span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-800">{catAnalytics.quoteRequests.toLocaleString()}</span>
                  <FileText className="w-4 h-4 text-violet-500" />
                </div>
              </div>
            </div>

            {/* Geographical details and Device split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Geos (Countries and Cities lists) */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2">
                  <Globe className="w-3.5 h-3.5 text-slate-500" /> Buyer Origins (Geographics)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Countries */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Countries</span>
                    {catAnalytics.countries && catAnalytics.countries.length > 0 ? (
                      <div className="space-y-2">
                        {catAnalytics.countries.map((c, i) => (
                          <div key={i} className="text-xs space-y-1">
                            <div className="flex justify-between font-semibold text-slate-750">
                              <span>{c.name}</span>
                              <span>{c.count}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-slate-700 h-full rounded-full" style={{ width: `${Math.min(100, (c.count / catAnalytics.views) * 100)}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400">No geographic data mapped.</p>
                    )}
                  </div>

                  {/* Cities */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Top Cities</span>
                    {catAnalytics.cities && catAnalytics.cities.length > 0 ? (
                      <div className="space-y-2">
                        {catAnalytics.cities.slice(0, 4).map((c, i) => (
                          <div key={i} className="text-xs space-y-1">
                            <div className="flex justify-between font-semibold text-slate-755">
                              <span>{c.name}</span>
                              <span>{c.count}</span>
                            </div>
                            <div className="w-full bg-indigo-50 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, (c.count / catAnalytics.views) * 100)}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400">No city data mapped.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Devices Splits & Conversion funnels */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" /> Devices Division Split
                  </h4>
                  
                  {/* Dev splits displays */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-150">
                      <Smartphone className="w-4 h-4 mx-auto text-slate-500 mb-1" />
                      <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Mobile</span>
                      <span className="text-sm font-extrabold text-slate-900">{devPct.mobile}%</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-150">
                      <Laptop className="w-4 h-4 mx-auto text-slate-500 mb-1" />
                      <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Desktop</span>
                      <span className="text-sm font-extrabold text-slate-900">{devPct.desktop}%</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-150">
                      <Tablet className="w-4 h-4 mx-auto text-slate-500 mb-1" />
                      <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Tablet</span>
                      <span className="text-sm font-extrabold text-slate-900">{devPct.tablet}%</span>
                    </div>
                  </div>
                </div>

                {/* Micro Funnel Audit */}
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Buyer Conversion Funnel</span>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 font-black px-2 py-0.5 rounded">Conversion Rate</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Link Hits &rarr; Cart Additions:</span>
                      <span className="font-bold text-slate-800">
                        {catAnalytics.views > 0 ? Math.round((catAnalytics.cartAdditions / catAnalytics.views) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Link Hits &rarr; RFQs Submitted:</span>
                      <span className="font-bold text-indigo-600">
                        {catAnalytics.views > 0 ? Math.round((catAnalytics.quoteRequests / catAnalytics.views) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Click Count details by Product */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2">
                <MousePointerClick className="w-3.5 h-3.5 text-slate-500" /> Click Distribution by Product
              </h4>

              {catAnalytics.productClicks && catAnalytics.productClicks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[9px] uppercase tracking-wider font-bold text-slate-400">
                        <th className="px-3 py-2">Article Code/ID</th>
                        <th className="px-3 py-2">Product Name</th>
                        <th className="px-3 py-2 text-right">Unique Clicks Count</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-100">
                      {catAnalytics.productClicks.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 text-slate-700 font-semibold">
                          <td className="px-3 py-2.5 font-mono text-indigo-650">{p.productId}</td>
                          <td className="px-3 py-2.5 text-slate-900">{p.name}</td>
                          <td className="px-3 py-2.5 text-right text-slate-800 font-black">{p.clicks} clicks</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No catalog items clicked yet by visiting buyers.</p>
              )}
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            No active analytics datasets mapped for this sharing link yet.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Recent Orders</h3>
            <a href="/admin/orders" className="text-indigo-600 text-xs font-medium hover:underline">View all</a>
          </div>
          <div className="flex-1 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                   <th className="px-4 py-3">Order ID</th>
                   <th className="px-4 py-3">Customer</th>
                   <th className="px-4 py-3 text-right">Amount</th>
                   <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-indigo-600">{order.id}</td>
                    <td className="px-4 py-3 text-slate-900">{order.companyName}</td>
                    <td className="px-4 py-3 text-right font-medium">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-bold text-[9px] uppercase tracking-wider">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-xs text-slate-500 text-center">No recent orders.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Quotes */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Recent Quotation Requests</h3>
            <a href="/admin/quotes" className="text-indigo-600 text-xs font-medium hover:underline">View all</a>
          </div>
          <div className="flex-1 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                   <th className="px-4 py-3">Quote ID</th>
                   <th className="px-4 py-3">Product</th>
                   <th className="px-4 py-3 text-right">Target</th>
                   <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {quotes.slice(0, 5).map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-indigo-600">{quote.id}</td>
                    <td className="px-4 py-3 text-slate-900">{quote.product.name} <span className="text-slate-500">(x{quote.quantity})</span></td>
                    <td className="px-4 py-3 text-right font-medium">₹{quote.targetPrice}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold text-[9px] uppercase tracking-wider">
                        {quote.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {quotes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-xs text-slate-500 text-center">No pending quote requests.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
