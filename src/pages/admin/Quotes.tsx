import React, { useState } from 'react';
import { useStore } from '../../lib/StoreContext';
import { Search, MessageSquare, Send, X, Clock, FileText, CheckCircle, Upload, Mail, Phone, Link as LinkIcon } from 'lucide-react';
import { QuoteRequest } from '../../types';

export default function Quotes() {
  const { quotes, customers, replyQuote, updateQuoteStatus, sendCRMEmail, sendCRMWhatsApp } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal / Drawer state
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  
  // Form State
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [freight, setFreight] = useState<number | ''>('');
  const [gst, setGst] = useState<number | ''>('');
  const [deliveryTimeline, setDeliveryTimeline] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // Delivery Checks
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(true);
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [createPublicLink, setCreatePublicLink] = useState(true);

  const filteredQuotes = quotes.filter(q => 
    q.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openReplyDrawer = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setUnitPrice(quote.product.offerPrice || quote.product.mrp || '');
    setQuantity(quote.quantity);
    setDiscount(0);
    setFreight(0);
    setGst(0);
    setDeliveryTimeline('7-10 Days');
    setPaymentTerms('50% Advance, 50% Before Dispatch');
    const today = new Date();
    today.setDate(today.getDate() + 7);
    setValidUntil(today.toISOString().split('T')[0]);
    setRemarks('');
    setIsReplyOpen(true);
  };

  const closeDrawer = () => {
    setIsReplyOpen(false);
    setSelectedQuote(null);
  };

  const handleSendQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote || !replyQuote) return;

    await replyQuote(selectedQuote.id, {
      unitPrice: Number(unitPrice),
      quantity: Number(quantity),
      discount: Number(discount),
      freight: Number(freight),
      gst: Number(gst),
      deliveryTimeline,
      paymentTerms,
      validUntil,
      remarks,
    });

    const quotationLink = `${window.location.origin}/quote/${selectedQuote.id}`;
    const targetCustomer = customers.find(c => c.name === selectedQuote.customerName);
    const customerId = targetCustomer?.id || 'CUST-000';
    
    const finalPrice = ((Number(unitPrice) * Number(quantity)) - Number(discount) + Number(freight) + Number(gst));
    let notificationsSent = [];
    
    if (sendViaWhatsApp && selectedQuote.buyerDetails?.mobile && sendCRMWhatsApp) {
      await sendCRMWhatsApp(
        customerId, 
        selectedQuote.buyerDetails.mobile, 
        `Dear ${selectedQuote.customerName},\n\nThank you for your enquiry. We have prepared your quotation.\nQuotation No: ${selectedQuote.id}\nQuotation Value: ₹${finalPrice.toLocaleString()}\nDelivery Timeline: ${deliveryTimeline}\n\nView Quotation:\n${quotationLink}`
      );
      notificationsSent.push('WhatsApp');
    }
    
    if (sendViaEmail && selectedQuote.buyerDetails?.email && sendCRMEmail) {
      await sendCRMEmail(
        customerId,
        selectedQuote.buyerDetails.email,
        `Quotation ${selectedQuote.id} for your Enquiry`,
        `Dear ${selectedQuote.customerName},\n\nWe have prepared your quotation for ${selectedQuote.product.name} (Qty: ${quantity}).\n\nTotal Amount: ₹${finalPrice.toLocaleString()}\nDelivery Timeline: ${deliveryTimeline}\nValid Until: ${validUntil}\n\nPlease click the link below to view or download your quotation.\n\n${quotationLink}`
      );
      notificationsSent.push('Email');
    }

    alert(`Quotation ${selectedQuote.id} sent successfully!${notificationsSent.length > 0 ? ` Delivered via: ${notificationsSent.join(', ')}` : ' Saved to records.'}`);
    
    closeDrawer();
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-80px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quotation Requests (RFQs)</h2>
          <p className="text-xs text-slate-500 font-medium">Manage and reply to bulk wholesale enquiries.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search by RFQ ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-y-auto">
        <ul className="divide-y divide-slate-100">
          {filteredQuotes.map((quote) => (
            <li key={quote.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-6 w-full">
                  <div className="flex flex-col w-32 shrink-0">
                    <span className="text-sm font-black text-indigo-600 tracking-tight">{quote.id}</span>
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {quote.date}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-slate-900">{quote.customerName}</span>
                       <span className={`px-2 py-0.5 inline-flex text-[9px] font-bold uppercase tracking-wider rounded border ${
                        quote.status === 'Pending' || quote.status === 'Under Review' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        quote.status === 'Quotation Sent' || quote.status === 'Responded' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                        quote.status === 'Accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                        quote.status === 'Revision Requested' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {quote.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex gap-3 font-mono">
                       {quote.buyerDetails?.mobile && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{quote.buyerDetails.mobile}</span>}
                       {quote.buyerDetails?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{quote.buyerDetails.email}</span>}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Requested <span className="font-extrabold text-slate-800 bg-slate-100 px-1 rounded mx-0.5">{quote.quantity} units</span> 
                      of <span className="font-semibold text-slate-800">{quote.product.name}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-2 flex-1">
                  <p className="text-[11px] text-slate-500 flex items-center">
                    <span className="font-bold text-slate-700 w-24">Target Price:</span> 
                    <span className="font-mono text-xs font-bold text-emerald-600">₹{quote.targetPrice} / unit</span>
                  </p>
                  <div className="flex items-start text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700 w-24 shrink-0 flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 text-slate-400" /> Notes:
                    </span>
                    <span className="italic leading-relaxed">{quote.specialRequirements || "No special requirements provided."}</span>
                  </div>
                  {(quote.status === 'Quotation Sent' || quote.status === 'Responded') && (
                     <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                        <span className="flex items-center gap-1 bg-green-50 text-green-700 p-1 px-1.5 rounded border border-green-100"><CheckCircle className="w-3 h-3" /> Delivered By WhatsApp</span>
                        <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 p-1 px-1.5 rounded border border-indigo-100"><CheckCircle className="w-3 h-3" /> Delivered By Email</span>
                        <span className="flex items-center gap-1 text-slate-500"><LinkIcon className="w-3 h-3" /> Link Active</span>
                     </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => openReplyDrawer(quote)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Reply Quote
                  </button>
                </div>
              </div>
            </li>
          ))}
          {filteredQuotes.length === 0 && (
            <li className="p-12 text-center text-slate-500 text-sm font-medium flex flex-col items-center justify-center space-y-3">
               <FileText className="w-8 h-8 text-slate-300" />
               <p>No quotation requests found in system.</p>
            </li>
          )}
        </ul>
      </div>

      {/* QUICK REPLY DRAWER OVERLAY */}
      {isReplyOpen && selectedQuote && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-slide-left border-l border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Reply to RFQ {selectedQuote.id}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Send a formal wholesale quote to {selectedQuote.customerName}</p>
              </div>
              <button onClick={closeDrawer} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Form Content */}
              <form id="quote-form" onSubmit={handleSendQuotation} className="p-6 space-y-8">
                
                {/* Read Only RFQ Info block */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                     <Clock className="w-3.5 h-3.5 text-indigo-500" /> Buyer & RFQ Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Primary Contact</p>
                        <p className="text-slate-900 font-bold">{selectedQuote.customerName}</p>
                        {selectedQuote.buyerDetails?.companyName && <p className="text-slate-600 mt-0.5">{selectedQuote.buyerDetails.companyName}</p>}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Contact Details</p>
                        {selectedQuote.buyerDetails?.mobile && <p className="text-slate-900 font-mono tracking-tight flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {selectedQuote.buyerDetails.mobile}</p>}
                        {selectedQuote.buyerDetails?.email && <p className="text-slate-900 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3 text-slate-400" /> {selectedQuote.buyerDetails.email}</p>}
                        {!selectedQuote.buyerDetails?.mobile && !selectedQuote.buyerDetails?.email && <p className="text-slate-400 italic">No direct contact info provided</p>}
                    </div>
                    
                    <div className="col-span-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-x-6 gap-y-2 text-[11px]">
                        <p className="text-slate-500">Product: <span className="text-slate-900 font-bold ml-1">{selectedQuote.product.name}</span></p>
                        <p className="text-slate-500">Req. Qty: <span className="text-slate-900 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 ml-1">{selectedQuote.quantity} units</span></p>
                        <p className="text-slate-500">Target: <span className="text-red-600 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 ml-1">₹{selectedQuote.targetPrice}</span></p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 text-xs italic text-slate-600 leading-relaxed">
                    <span className="font-bold underline not-italic text-slate-700 mr-1 text-[10px] uppercase">Notes:</span> 
                    "{selectedQuote.specialRequirements || 'No special requirements.'}"
                  </div>
                </div>

                {/* Editable Response Block */}
                <div className="space-y-5">
                  <h4 className="text-sm font-black text-slate-800 tracking-tight border-b border-indigo-100 pb-2">Factory Quotation Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Unit Price (₹)</label>
                      <input 
                        type="number" required min="1"
                        value={unitPrice} onChange={e => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-sm font-mono font-semibold p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Quantity</label>
                      <input 
                        type="number" required min="1"
                        value={quantity} onChange={e => setQuantity(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-sm font-mono font-semibold p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Discount (₹)</label>
                      <input 
                        type="number" min="0" placeholder="0"
                        value={discount} onChange={e => setDiscount(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Freight (₹)</label>
                      <input 
                        type="number" min="0" placeholder="0"
                        value={freight} onChange={e => setFreight(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">GST Tax (₹)</label>
                      <input 
                        type="number" min="0" placeholder="0"
                        value={gst} onChange={e => setGst(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Timeline</label>
                      <input 
                        type="text" required placeholder="e.g. 7-10 Days"
                        value={deliveryTimeline} onChange={e => setDeliveryTimeline(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Valid Until</label>
                      <input 
                        type="date" required
                        value={validUntil} onChange={e => setValidUntil(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Payment Terms</label>
                    <input 
                      type="text" required placeholder="e.g. 50% Advance"
                      value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Remarks & Negotiation Notes</label>
                    <textarea 
                      rows={3} placeholder="Add private notes or terms specific to this buyer..."
                      value={remarks} onChange={e => setRemarks(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Final Cost Summary */}
                <div className="bg-slate-900 rounded-xl p-5 text-white flex items-center justify-between shadow-md">
                    <div>
                        <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-black mb-1">Final Deal Estimate</p>
                        <p className="text-xs text-slate-400">Includes freight, tax & discounts</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black tracking-tight font-mono text-emerald-400">
                          ₹{((Number(unitPrice) * Number(quantity)) - Number(discount) + Number(freight) + Number(gst)).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Automation & Delivery Options */}
                <div className="bg-white border text-center border-slate-200 p-4 rounded-xl shadow-sm space-y-4">
                  <h4 className="text-sm font-black text-slate-800 tracking-tight text-left pb-2 border-b border-slate-100">Quotation Delivery Settings</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${sendViaWhatsApp ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                      <input 
                        type="checkbox" 
                        checked={sendViaWhatsApp} 
                        onChange={e => setSendViaWhatsApp(e.target.checked)} 
                        className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500"
                      />
                      <div className="flex items-center gap-1.5 flex-1 select-none">
                        <Phone className={`w-4 h-4 ${sendViaWhatsApp ? 'text-green-600' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold ${sendViaWhatsApp ? 'text-green-800' : 'text-slate-500'}`}>WhatsApp</span>
                      </div>
                    </label>
                    
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${sendViaEmail ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                      <input 
                        type="checkbox" 
                        checked={sendViaEmail} 
                        onChange={e => setSendViaEmail(e.target.checked)} 
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <div className="flex items-center gap-1.5 flex-1 select-none">
                        <Mail className={`w-4 h-4 ${sendViaEmail ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold ${sendViaEmail ? 'text-indigo-800' : 'text-slate-500'}`}>Email Update</span>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${createPublicLink ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                      <input 
                        type="checkbox" 
                        checked={createPublicLink} 
                        onChange={e => setCreatePublicLink(e.target.checked)} 
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-1.5 flex-1 select-none">
                        <LinkIcon className={`w-4 h-4 ${createPublicLink ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold ${createPublicLink ? 'text-blue-800' : 'text-slate-500'}`}>Public Link</span>
                      </div>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 text-left mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    Checking these options will automatically log interactions in your CRM flow.
                  </p>
                </div>
              </form>

              {/* Thread History - Render if exists */}
              {selectedQuote.thread && selectedQuote.thread.length > 0 && (
                <div className="px-6 pb-8 space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Conversation & Revisions</h4>
                  <div className="space-y-4 relative before:content-[''] before:absolute before:inset-0 before:left-[17px] before:w-[2px] before:bg-slate-100">
                    {selectedQuote.thread.map((msg, i) => (
                      <div key={msg.id || i} className="relative pl-10">
                        <div className={`absolute left-0 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold text-[10px] uppercase shadow-sm ${msg.sender === 'factory' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                           {msg.sender === 'factory' ? 'You' : 'Byr'}
                        </div>
                        <div className={`p-4 rounded-xl text-xs space-y-2 border shadow-sm ${msg.sender === 'factory' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-200'}`}>
                          <div className="flex justify-between font-bold">
                            <span className={msg.sender === 'factory' ? 'text-indigo-800' : 'text-slate-800'}>{msg.sender === 'factory' ? 'Factory Owner' : selectedQuote.customerName}</span>
                            <span className="text-[9px] text-slate-400 font-mono tracking-tighter">{new Date(msg.date).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          {msg.pricing && (
                            <div className="mt-3 bg-white/60 p-2 rounded border border-slate-100 shadow-xs">
                              <span className="font-mono text-emerald-600 font-black">₹{msg.pricing.totalAmount?.toLocaleString()}</span>
                              <span className="text-slate-400 text-[10px] ml-2 block sm:inline"> (Qty: {msg.pricing.quantity} @ ₹{msg.pricing.unitPrice}/u)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-4">
              <button onClick={closeDrawer} type="button" className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button form="quote-form" type="submit" className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-sm transition-all focus:ring-4 focus:ring-indigo-500/20 active:scale-[0.98]">
                <Send className="w-4 h-4" />
                Send & Track Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
