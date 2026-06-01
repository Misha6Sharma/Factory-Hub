import React, { useState } from 'react';
import { useStore } from '../../lib/StoreContext';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Truck, 
  X,
  CreditCard,
  Check,
  ChevronRight,
  User,
  ExternalLink,
  ClipboardCheck,
  AlertTriangle,
  Building
} from 'lucide-react';
import { Order } from '../../types';

export default function Orders() {
  const { orders, updateOrder } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tab/Queue Management
  const [activeQueue, setActiveQueue] = useState<'all' | 'new' | 'cod' | 'qr' | 'razorpay' | 'verification_pending'>('all');
  
  // Modal tracking
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  // Filter orders according to tab category
  const getFilteredOrders = () => {
    let list = orders;
    
    // Search filter
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      list = list.filter(o => 
        o.id.toLowerCase().includes(q) || 
        (o.companyName && o.companyName.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q))
      );
    }

    // Queue filter
    switch(activeQueue) {
      case 'new':
        return list.filter(o => o.status === 'Received');
      case 'cod':
        return list.filter(o => o.payment?.method === 'COD');
      case 'qr':
        return list.filter(o => o.payment?.method === 'QR');
      case 'razorpay':
        return list.filter(o => o.payment?.method === 'Razorpay');
      case 'verification_pending':
        return list.filter(o => o.payment?.status === 'Awaiting Verification');
      default:
        return list;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Metric counts across groups
  const countAll = orders.length;
  const countNew = orders.filter(o => o.status === 'Received').length;
  const countCod = orders.filter(o => o.payment?.method === 'COD').length;
  const countQr = orders.filter(o => o.payment?.method === 'QR').length;
  const countRazorpay = orders.filter(o => o.payment?.method === 'Razorpay').length;
  const countPendingVerif = orders.filter(o => o.payment?.status === 'Awaiting Verification').length;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Received': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Production': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Quality Check': return 'bg-orange-100 text-orange-850 border-orange-200';
      case 'Dispatched': return 'bg-indigo-150 text-indigo-800 border-indigo-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleUpdateStatus = async (status: Order['status']) => {
    if (!selectedOrder) return;
    const updated = { ...selectedOrder, status };
    await updateOrder(updated);
    setSelectedOrder(updated);
  };

  const handleVerifyPayment = async (status: 'Paid (Partial)' | 'Paid (Full)' | 'Rejected' | 'Awaiting Verification', resetScreenshot: boolean = false) => {
    if (!selectedOrder || !selectedOrder.payment) return;
    
    const updatedPayment = {
      ...selectedOrder.payment,
      status: status,
      screenshotUrl: resetScreenshot ? undefined : selectedOrder.payment.screenshotUrl,
      amountPaid: status.startsWith('Paid') 
        ? (selectedOrder.pricingSummary?.advanceRequired || selectedOrder.totalAmount) 
        : 0
    };

    const updatedOrder: Order = {
      ...selectedOrder,
      status: status.startsWith('Paid') ? 'Confirmed' : selectedOrder.status,
      payment: updatedPayment
    };

    await updateOrder(updatedOrder);
    setSelectedOrder(updatedOrder);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Enterprise B2B Order Ledger</h2>
        <p className="text-xs text-slate-500 mt-1">Track checkout logs of shared catalogues, verify manual QR deposits, and confirm full tracking status.</p>
      </div>

      {/* METRIC CARD TABS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { id: 'all', label: 'All Orders', count: countAll, bg: 'hover:bg-slate-50', border: 'border-slate-200', activeBg: 'bg-slate-100 border-slate-400 ring-1 ring-slate-400' },
          { id: 'new', label: 'New Orders', count: countNew, bg: 'hover:bg-yellow-50/40', border: 'border-yellow-200', activeBg: 'bg-yellow-50 border-yellow-400 ring-1 ring-yellow-400 text-yellow-905' },
          { id: 'cod', label: 'COD Orders', count: countCod, bg: 'hover:bg-slate-50', border: 'border-indigo-100', activeBg: 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400 text-indigo-900' },
          { id: 'qr', label: 'QR Payments', count: countQr, bg: 'hover:bg-amber-50/40', border: 'border-amber-200', activeBg: 'bg-amber-50 border-amber-400 ring-1 ring-amber-400 text-amber-900' },
          { id: 'razorpay', label: 'Razorpay Paid', count: countRazorpay, bg: 'hover:bg-green-50/30', border: 'border-green-200', activeBg: 'bg-green-50 border-green-400 ring-1 ring-green-400 text-green-900' },
          { id: 'verification_pending', label: 'Pending QR Approval', count: countPendingVerif, bg: 'hover:bg-rose-50/30 border-rose-200 text-rose-750', border: 'border-rose-200', activeBg: 'bg-rose-50 border-rose-400 ring-1 ring-rose-400 text-rose-950' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveQueue(tab.id as any)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeQueue === tab.id ? tab.activeBg : `bg-white ${tab.border} ${tab.bg}`
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{tab.label}</span>
            <span className="text-xl font-bold text-slate-800 block mt-1">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* FILTER SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-505"
            placeholder="Search by client name, reference ID, company profile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LEDGER GRID */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full text-left">
            <thead className="bg-[#0f172a] text-[9px] font-bold text-slate-300 uppercase tracking-widest border-b border-slate-200">
              <tr>
                <th scope="col" className="px-5 py-3.5">Reference ID</th>
                <th scope="col" className="px-5 py-3.5">Submission Timeline</th>
                <th scope="col" className="px-5 py-3.5">B2B Buyer Entity</th>
                <th scope="col" className="px-5 py-3.5">Payment Node</th>
                <th scope="col" className="px-5 py-3.5 text-right">Commitment Value</th>
                <th scope="col" className="px-5 py-3.5 text-center">Fulfillment State</th>
                <th scope="col" className="px-5 py-3.5 text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-indigo-650">
                    {order.id}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-medium">
                    {order.date}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900 leading-tight">{order.companyName || 'Guest Enterprise'}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{order.customerName}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-slate-700">
                      <span className="p-1 rounded bg-slate-100 block"><CreditCard className="w-3.5 h-3.5 text-slate-500" /></span>
                      <div>
                        <p className="font-bold text-[9px]">{order.payment?.method || 'N/A'}</p>
                        <p className={`text-[8px] tracking-normal ${
                          order.payment?.status.includes('Paid') ? 'text-green-600' : 'text-amber-600'
                        }`}>{order.payment?.status || 'Pending'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right font-bold text-slate-900">
                    ₹{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right font-bold text-indigo-650">
                    <button type="button" className="inline-flex items-center gap-1 p-1 hover:bg-indigo-50 rounded">
                      <Eye className="w-4 h-4" /> Verify
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-400 font-medium">
                    No orders registered in this queue category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED ORDER MODAL SIDE DRAWER / CENTRAL OVERLAY */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col divide-y divide-slate-100">
            
            {/* Modal Header */}
            <div className="p-5 bg-[#0f172a] text-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#a5b4fc] block">B2B Order Verification Console</span>
                <h3 className="text-sm font-bold mt-1 inline-flex items-center gap-2">
                  Order Ref: <span className="font-mono bg-slate-850 px-2 py-0.5 rounded text-[11px] font-black uppercase text-indigo-200">{selectedOrder.id}</span>
                  <span className={`px-2 py-0.5 border text-[9px] font-extrabold tracking-widest uppercase rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedOrder(null)} 
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable partition grid) */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 leading-relaxed">
              
              {/* Left Column (Corporate Details, Shipping info, Logistics) */}
              <div className="md:col-span-7 space-y-5">
                
                {/* 1. Buyer Corporate Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b pb-1">
                    <User className="w-4 h-4 text-slate-400" /> B2B Buyer Corporate Identity
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-150">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Authorized Rep</p>
                      <p className="font-extrabold text-slate-900">{selectedOrder.customerName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Trading Company</p>
                      <p className="font-extrabold text-slate-900">{selectedOrder.companyName || 'Guest Enterprise'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Primary Mobile</p>
                      <p className="text-slate-805">{selectedOrder.mobileNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Alternate Mobile</p>
                      <p className="text-slate-805">{selectedOrder.altMobileNumber || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Email Address</p>
                      <p className="text-slate-805 break-all">{selectedOrder.emailAddress || 'N/A'}</p>
                    </div>
                    {selectedOrder.gstNumber && (
                      <div className="col-span-2">
                        <p className="text-[9px] text-slate-400 uppercase font-bold text-indigo-650">Registered GSTIN Code</p>
                        <p className="font-mono uppercase font-bold text-indigo-700 text-[10px]">{selectedOrder.gstNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Destination Shipment Addresses */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b pb-1">
                    <MapPin className="w-4 h-4 text-slate-400" /> Destination Delivery Endpoint
                  </h4>
                  {selectedOrder.deliveryAddress ? (
                    <div className="text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-150">
                      <p className="font-extrabold text-slate-900">{selectedOrder.deliveryAddress.addressLine1}</p>
                      {selectedOrder.deliveryAddress.addressLine2 && <p className="text-slate-650 mt-0.5">{selectedOrder.deliveryAddress.addressLine2}</p>}
                      {selectedOrder.deliveryAddress.landmark && <p className="text-slate-500 italic text-[11px] mt-0.5">Landmark: {selectedOrder.deliveryAddress.landmark}</p>}
                      <p className="mt-1 text-slate-800">{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - <span className="font-mono">{selectedOrder.deliveryAddress.pincode}</span></p>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5">{selectedOrder.deliveryAddress.country}</p>
                    </div>
                  ) : (
                    <div className="bg-slate-100 p-4 rounded-xl text-center text-xs italic text-slate-500">Traditional mock coordinates - Delivery details not supplied</div>
                  )}
                </div>

                {/* 3. Shipping instructions / Logistics */}
                {selectedOrder.logistics && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b pb-1">
                      <Truck className="w-4 h-4 text-slate-400" /> Logistics Routing Instructions
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-750 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                      <div>
                        <p className="text-[9px] text-slate-450 uppercase font-bold">Preferred Route Mode</p>
                        <p className="font-extrabold text-indigo-700">{selectedOrder.logistics.pickupType}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-450 uppercase font-bold">Transporter Selection</p>
                        <p className="font-extrabold text-slate-900">{selectedOrder.logistics.transporterPreference || 'None specified'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-450 uppercase font-bold">Preferred Delivery Date</p>
                        <p className="font-extrabold text-slate-900">{selectedOrder.orderInstructions?.preferredDate || 'Standard timelines'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-450 uppercase font-bold">Preferred Hour Frame</p>
                        <p className="font-extrabold text-slate-900">{selectedOrder.orderInstructions?.timePreference || 'N/A'}</p>
                      </div>
                      {selectedOrder.orderInstructions?.loadingUnloading && (
                        <div className="col-span-2">
                          <p className="text-[9px] text-slate-450 uppercase font-bold">Custom Offloading parameters</p>
                          <p className="text-slate-800">{selectedOrder.orderInstructions.loadingUnloading}</p>
                        </div>
                      )}
                      {selectedOrder.orderInstructions?.specialInstructions && (
                        <div className="col-span-2">
                          <p className="text-[9px] text-slate-450 uppercase font-bold font-sans">Enterprise Special Notes</p>
                          <p className="italic text-slate-650">"{selectedOrder.orderInstructions.specialInstructions}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (Payment verifications & items ledger) */}
              <div className="md:col-span-5 space-y-5">
                
                {/* 1. Fulfillment actions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b pb-1">
                    <ClipboardCheck className="w-4 h-4 text-slate-400" /> Fulfillment Status Controller
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Set Order Fulfillment State</label>
                    <select 
                      className="w-full border border-slate-300 rounded-lg py-2 px-3 text-slate-900 bg-white font-semibold cursor-pointer"
                      value={selectedOrder.status}
                      onChange={e => handleUpdateStatus(e.target.value as any)}
                    >
                      <option value="Received">Received (Pending Review)</option>
                      <option value="Confirmed">Confirmed (Ready to Manufacture)</option>
                      <option value="Production">Production Queue (Floor manufacturing)</option>
                      <option value="Quality Check">Quality Check Audit (In Progress)</option>
                      <option value="Dispatched">Dispatched (Direct Transporter Loaded)</option>
                      <option value="Delivered">Delivered (Handed Over)</option>
                    </select>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 font-mono">
                      <button type="button" onClick={() => handleUpdateStatus('Confirmed')} className="py-1 px-2 border rounded bg-white hover:bg-slate-100 font-bold">COD Approved</button>
                      <button type="button" onClick={() => handleUpdateStatus('Dispatched')} className="py-1 px-2 border rounded bg-white hover:bg-slate-100 font-bold">Ready for Dispatch</button>
                    </div>
                  </div>
                </div>

                {/* 2. QR Screenshot verification Queue */}
                {selectedOrder.payment?.method === 'QR' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b pb-1 text-amber-700">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> Manual Payment Proof Verification
                    </h4>
                    <div className="p-4 bg-amber-50/45 rounded-xl border border-amber-200 text-xs space-y-4">
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">Uploaded Screenshot Proof:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          selectedOrder.payment.status === 'Awaiting Verification' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'
                        }`}>{selectedOrder.payment.status}</span>
                      </div>

                      {/* Display Base64 Screenshot inside small canvas preview */}
                      {selectedOrder.payment.screenshotUrl ? (
                        <div className="space-y-2">
                          <div 
                            onClick={() => setShowLightbox(true)}
                            className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-350 cursor-zoom-in bg-slate-900 flex items-center justify-center group"
                          >
                            <img src={selectedOrder.payment.screenshotUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Captured Deposit proof" />
                            <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[10px] uppercase">Click to Expand lightbox</div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 border border-dashed rounded-lg bg-white/70 text-center text-xs italic text-slate-400">Payment Screenshot image was reset by Admin or not provided by buyer.</div>
                      )}

                      {/* Action buttons list */}
                      <div className="space-y-2">
                        <button 
                          type="button" 
                          onClick={() => handleVerifyPayment('Paid (Full)')}
                          className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Approve QR Verification (Cleared)
                        </button>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <button 
                            type="button" 
                            onClick={() => handleVerifyPayment('Rejected')}
                            className="py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold rounded uppercase"
                          >
                            Reject Proof
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleVerifyPayment('Awaiting Verification', true)}
                            className="py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded uppercase whitespace-nowrap"
                          >
                            Reset Screenshot
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Items list Ledger breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b pb-1">
                    <Building className="w-4 h-4 text-slate-400" /> Stock order Items
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-155 text-xs font-semibold text-slate-705 leading-relaxed space-y-3">
                    <ul className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                      {selectedOrder.items?.map((item, i) => (
                        <li key={i} className="py-2 flex justify-between items-center text-xs font-sans">
                          <div>
                            <p className="font-bold text-slate-850 truncate w-40">{item.product?.name || 'N/A'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Qty: {item.quantity} Units @ ₹{item.product?.offerPrice || 0}</p>
                          </div>
                          <p className="font-bold text-slate-950">₹{((item.product?.offerPrice || 0) * item.quantity).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>

                    {selectedOrder.pricingSummary ? (
                      <div className="border-t border-slate-200/60 pt-3 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>Items Subtotal</span>
                          <span>₹{selectedOrder.pricingSummary.subtotal?.toLocaleString()}</span>
                        </div>
                        {selectedOrder.pricingSummary.freightCharges > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>Composite Freight</span>
                            <span>₹{selectedOrder.pricingSummary.freightCharges?.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-500">
                          <span>GST taxes (18%)</span>
                          <span>₹{selectedOrder.pricingSummary.taxes?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-black text-slate-900 border-t border-slate-350 pt-2.5">
                          <span>Commitment Value</span>
                          <span>₹{selectedOrder.pricingSummary.total?.toLocaleString()}</span>
                        </div>
                        
                        {selectedOrder.pricingSummary.advanceRequired && (
                          <div className="flex justify-between font-bold text-indigo-700 bg-white/50 px-2 py-1 border border-indigo-100 rounded mt-1.5">
                            <span>Advance Requested</span>
                            <span>₹{selectedOrder.pricingSummary.advanceRequired?.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-t border-slate-200/60 pt-3 flex justify-between font-bold text-slate-850">
                        <span>Total amount:</span>
                        <span>₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-50/50 flex justify-end gap-3 rounded-b-xl">
              <button 
                type="button" 
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 hover:bg-slate-100 border border-slate-250 text-slate-700 font-bold rounded-lg text-xs uppercase cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY QUEUE SCREENSHOT LIGHTBOX POPUP */}
      {showLightbox && selectedOrder && selectedOrder.payment?.screenshotUrl && (
        <div className="fixed inset-0 bg-black/95 z-55 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-2xl w-full flex flex-col gap-4">
            <button 
              type="button" 
              onClick={() => setShowLightbox(false)}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 border rounded-full font-bold z-50"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <img src={selectedOrder.payment.screenshotUrl} className="max-h-[80vh] w-auto mx-auto object-contain" alt="High Resolution Uploaded Invoice Proof" />
              <p className="text-[10px] text-slate-400 font-mono text-center mt-3 uppercase tracking-wider">Image Proof Close-up for Order {selectedOrder.id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
