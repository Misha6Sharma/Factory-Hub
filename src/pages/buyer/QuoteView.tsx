import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/StoreContext';
import { FileText, CheckCircle, XCircle, RefreshCcw, ShoppingCart, MessageSquare, Send } from 'lucide-react';
import { QuotationThreadMessage } from '../../types';

export default function QuoteView() {
  const { quoteId } = useParams();
  const navigate = useNavigate();
  const { quotes, updateQuoteStatus, replyQuote, placeOrder } = useStore();
  
  const [revisionMessage, setRevisionMessage] = useState('');
  const [isRevisionMode, setIsRevisionMode] = useState(false);

  // We find quote even if not logged in. Normally we'd fetch directly from db based on quoteId if deep linked.
  // For now it relies on store sync which might require being in Public space.
  const quote = quotes.find(q => q.id === quoteId);

  if (!quote) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <FileText className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Quotation Not Found</h2>
        <p className="text-slate-500 mt-2">The quotation link might be invalid or expired.</p>
      </div>
    );
  }

  const handleAccept = async () => {
    await updateQuoteStatus?.(quote.id, 'Accepted');
    alert("Quotation Accepted!");
  };

  const handleReject = async () => {
    await updateQuoteStatus?.(quote.id, 'Rejected');
    alert("Quotation Rejected.");
  };

  const handleSendRevision = async () => {
    if (!revisionMessage.trim()) return;
    
    // Simulate Buyer reply. We reuse replyQuote but mock sender as buyer (hacky for now, ideal would be appendThreadMessage)
    // To do this cleanly, we can actually just update thread locally and call setDoc. Wait, let's just use existing `replyQuote` structure, but we need sender parameter.
    // Instead, let's add a direct update to store if needed
  };

  const convertToOrder = async () => {
      // Mock order placement
      const orderId = `ORD-${Date.now()}`;
      // In real scenario we'd call placeOrder()
      alert(`Order ${orderId} created successfully based on Quotation!`);
      navigate('/orders');
  };

  const factoryDetails = quote.factoryResponse;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border inline-block mb-3 ${
              quote.status === 'Accepted' ? 'bg-green-50 text-green-700 border-green-200' :
              quote.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              Status: {quote.status}
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quotation #{quote.id}</h1>
            <p className="text-slate-500 text-sm mt-1">Prepared for <span className="font-bold text-slate-800">{quote.customerName}</span></p>
          </div>
          <div className="text-right sm:text-right w-full sm:w-auto">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Date Issued</p>
            <p className="text-slate-800 font-mono text-sm mt-0.5">{quote.date}</p>
            {factoryDetails?.validUntil && (
              <p className="text-xs text-red-500 font-semibold mt-1">Valid Till: {factoryDetails.validUntil}</p>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="font-bold tracking-wide flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
              Requested Product
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex gap-4 items-start">
                <div className="w-24 h-24 bg-slate-100 rounded-lg border border-slate-200 shrink-0 overflow-hidden">
                    <img src={quote.product.images[0]} alt={quote.product.name} className="w-full h-full object-cover" />
                </div>
                <div>
                   <h4 className="font-bold text-slate-900">{quote.product.name}</h4>
                   <p className="text-xs text-slate-500 font-mono mt-1">SKU: {quote.product.sku}</p>
                   <p className="text-xs text-slate-600 mt-2 line-clamp-3">{quote.product.description}</p>
                </div>
             </div>
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Requested Qty:</span>
                  <span className="font-bold text-slate-900">{quote.quantity} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Target Price:</span>
                  <span className="font-bold text-slate-900">₹{quote.targetPrice} / Unit</span>
                </div>
                {quote.specialRequirements && (
                  <div className="pt-2 border-t border-slate-200 mt-2 text-xs italic text-slate-600">
                    <span className="font-bold not-italic text-slate-700">Remarks: </span>
                    "{quote.specialRequirements}"
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Pricing Estimate */}
        {factoryDetails && (
          <div className="bg-white rounded-xl border border-indigo-200 overflow-hidden shadow-md">
            <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
              <h3 className="font-bold text-indigo-900 tracking-wide">Factory Response & Pricing</h3>
            </div>
            <div className="p-6 space-y-6">
              
              <table className="w-full text-left text-sm">
                  <thead className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                     <tr>
                         <th className="pb-3 border-b border-slate-100">Item</th>
                         <th className="pb-3 border-b border-slate-100 text-right">Unit Price</th>
                         <th className="pb-3 border-b border-slate-100 text-right">Quantity</th>
                         <th className="pb-3 border-b border-slate-100 text-right text-slate-900 font-extrabold text-xs">Total</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     <tr>
                         <td className="py-4 font-semibold text-slate-800">{quote.product.name}</td>
                         <td className="py-4 text-right font-mono text-slate-600">₹{factoryDetails.unitPrice?.toLocaleString()}</td>
                         <td className="py-4 text-right font-mono text-slate-600">{factoryDetails.quantity || quote.quantity}</td>
                         <td className="py-4 text-right font-mono font-bold text-slate-900">₹{((factoryDetails.unitPrice || 0) * (factoryDetails.quantity || quote.quantity)).toLocaleString()}</td>
                     </tr>
                     {factoryDetails.freight && (
                       <tr>
                         <td colSpan={3} className="py-3 text-right text-xs font-semibold text-slate-500">Freight Charges</td>
                         <td className="py-3 text-right font-mono text-slate-700">+ ₹{factoryDetails.freight?.toLocaleString()}</td>
                       </tr>
                     )}
                     {factoryDetails.gst && (
                       <tr>
                         <td colSpan={3} className="py-3 text-right text-xs font-semibold text-slate-500">Taxes (GST)</td>
                         <td className="py-3 text-right font-mono text-slate-700">+ ₹{factoryDetails.gst?.toLocaleString()}</td>
                       </tr>
                     )}
                     {factoryDetails.discount && (
                       <tr>
                         <td colSpan={3} className="py-3 text-right text-xs font-semibold text-emerald-600">Total Discount</td>
                         <td className="py-3 text-right font-mono text-emerald-600 font-bold">- ₹{factoryDetails.discount?.toLocaleString()}</td>
                       </tr>
                     )}
                  </tbody>
              </table>

              <div className="flex flex-col sm:flex-row items-end justify-between border-t border-slate-200 pt-5 gap-4">
                 <div className="space-y-1.5 w-full sm:w-auto text-xs text-slate-600">
                    <p><span className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Delivery:</span> {factoryDetails.deliveryTimeline}</p>
                    <p><span className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Payment Terms:</span> {factoryDetails.paymentTerms}</p>
                 </div>
                 <div className="text-right w-full sm:w-auto bg-slate-50 px-6 py-4 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Final Total</p>
                    <p className="text-3xl font-black font-mono text-indigo-600 tracking-tighter">
                      ₹{(((factoryDetails.unitPrice || 0) * (factoryDetails.quantity || quote.quantity)) + (factoryDetails.freight || 0) + (factoryDetails.gst || 0) - (factoryDetails.discount || 0)).toLocaleString()}
                    </p>
                 </div>
              </div>

              {factoryDetails.remarks && (
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-sm">
                      <p className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-blue-500" /> Factory Remarks
                      </p>
                      <p className="text-blue-800/80 leading-relaxed text-xs">{factoryDetails.remarks}</p>
                  </div>
              )}

            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="bg-white border text-center border-slate-200 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
          {quote.status !== 'Accepted' && quote.status !== 'Rejected' && (
            <>
              <button onClick={handleAccept} className="px-6 py-3 bg-green-600 hover:bg-green-700 cursor-pointer text-white text-sm font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2 transition-transform active:scale-95">
                <CheckCircle className="w-5 h-5" /> Accept Quote
              </button>
              
              <button onClick={() => setIsRevisionMode(!isRevisionMode)} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer text-sm font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2 transition-transform active:scale-95">
                <RefreshCcw className="w-5 h-5" /> Request Revision
              </button>

              <button onClick={handleReject} className="px-6 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer text-sm font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2 transition-transform active:scale-95">
                <XCircle className="w-5 h-5" /> Reject
              </button>
            </>
          )}

          {quote.status === 'Accepted' && (
            <button onClick={convertToOrder} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer transition-transform active:scale-95">
               <ShoppingCart className="w-5 h-5" /> Convert to Official Order
            </button>
          )}
        </div>

        {/* Thread View & Revision Mode Details */}
        {(quote.thread && quote.thread.length > 0) && (
            <div className="bg-slate-100 rounded-xl p-6 border border-slate-200 space-y-6">
               <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest text-center">Negotiation Thread</h3>
               <div className="space-y-4">
                   {quote.thread.map(msg => (
                       <div key={msg.id} className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl text-xs space-y-2 shadow-sm ${
                               msg.sender === 'buyer' 
                               ? 'bg-indigo-600 text-white rounded-br-none' 
                               : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                           }`}>
                               <div className={`font-bold flex justify-between gap-4 text-[10px] uppercase font-mono ${msg.sender === 'buyer' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                  <span>{msg.sender === 'buyer' ? 'You' : 'Factory'}</span>
                                  <span>{new Date(msg.date).toLocaleDateString()}</span>
                               </div>
                               <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                           </div>
                       </div>
                   ))}
               </div>
            </div>
        )}

      </div>
    </div>
  );
}
