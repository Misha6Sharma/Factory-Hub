import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/StoreContext';
import { 
  Trash2, 
  FileText, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  ArrowLeft,
  Truck,
  Building,
  Calendar,
  AlertTriangle,
  Image as ImageIcon,
  CheckCircle,
  UploadCloud,
  Smartphone,
  Check,
  ShieldCheck,
  Activity,
  User,
  Heart
} from 'lucide-react';
import { Order } from '../../types';

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, placeOrder, requestQuote, factory } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'checkout' | 'quote'>('checkout');
  
  // Specific Order-Ref for successful submission tracking
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [submittedOrderDetails, setSubmittedOrderDetails] = useState<Order | null>(null);
  const [quoteSent, setQuoteSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulated Razorpay Overlay State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayStep, setRazorpayStep] = useState<'options' | 'processing' | 'success'>('options');
  const [selectedRazorpayMethod, setSelectedRazorpayMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // Load factory configurations / payment preferences safely
  const paymentPrefs = factory.paymentPreferences || {
    codEnabled: true,
    qrEnabled: true,
    upiQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=apexsales@axisbank',
    bankQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=bank://pay?acc=1234567890',
    razorpayEnabled: true,
    advancePaymentPercentage: 25,
    minimumOrderValue: 2000
  };

  // State for expanded Checkout + Logistics + Delivery Options
  const [formData, setFormData] = useState({
    // Buyer Details
    name: 'Jane Doe',
    companyName: 'Retail Corp',
    mobileNumber: '9876543210',
    altMobileNumber: '9988776655',
    emailAddress: 'jane@retailcorp.com',
    gstNumber: '22AAAAA0000A1Z5',

    // Delivery Address
    addressLine1: '123 Business Park, Block C',
    addressLine2: 'Industrial Area Phase 2',
    landmark: 'Opposite Metro Station',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    pincode: '110020',

    // Order Instructions
    preferredDate: '',
    timePreference: '9 AM - 6 PM',
    specialInstructions: 'Please pack in heavy cardboard outer cartons.',
    loadingUnloading: 'Forklift required for offloading',

    // Logistics Information
    transporterPreference: 'VRL Logistics',
    pickupType: 'Door Delivery' as 'Self Pickup' | 'Factory Pickup' | 'Door Delivery',

    // Payment Option
    paymentMethod: 'COD' as 'COD' | 'QR' | 'Razorpay',
    screenshotUrl: '', // Base64 uploaded verification proof
  });

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.offerPrice * item.quantity), 0);
  
  // Dynamic pricing metrics
  const freightCharges = formData.pickupType === 'Door Delivery' ? Math.round(cartSubtotal * 0.05) : 0;
  const compositeTaxes = Math.round(cartSubtotal * 0.18);
  const finalTotal = cartSubtotal + freightCharges + compositeTaxes;

  // Partial Payment calculations
  const isAdvanceRequired = paymentPrefs.advancePaymentPercentage > 0 && paymentPrefs.advancePaymentPercentage < 100;
  const advanceAmount = isAdvanceRequired 
    ? Math.round(finalTotal * (paymentPrefs.advancePaymentPercentage / 100)) 
    : finalTotal;
  const balanceDueLater = finalTotal - advanceAmount;

  // Active method verification checks
  const isCodAvailable = paymentPrefs.codEnabled;
  const isQrAvailable = paymentPrefs.qrEnabled;
  const isRazorpayAvailable = paymentPrefs.razorpayEnabled;

  const handleContinueShopping = () => {
    const storedCatString = localStorage.getItem('active_catalogue');
    if (storedCatString) {
      try {
        const storedCat = JSON.parse(storedCatString);
        if (storedCat.catalogueUrl) {
          navigate(storedCat.catalogueUrl);
          return;
        }
      } catch (e) {
        console.warn("Parsing active_catalogue failed:", e);
      }
    }
    const storedId = localStorage.getItem('active_catalogue_id');
    if (storedId) {
      navigate(`/store/c/${storedId}`);
    } else {
      navigate('/store');
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert("Maximum image upload volume exceeded (500KB cap). Please compressor your screenshot format.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, screenshotUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit flow logic
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartSubtotal < paymentPrefs.minimumOrderValue) {
      alert(`Minimum value to place a stock order with this manufacturer is ₹${paymentPrefs.minimumOrderValue.toLocaleString()}. Please increase item counts.`);
      return;
    }

    if (activeTab === 'quote') {
      // Submit quote request
      setIsSubmitting(true);
      try {
        for (const item of cart) {
          await requestQuote({
            customerName: formData.name,
            companyName: formData.companyName,
            targetPrice: item.product.offerPrice,
            product: item.product,
            quantity: item.quantity,
            specialRequirements: formData.specialInstructions,
            buyerDetails: {
              companyName: formData.companyName,
              mobile: formData.mobileNumber,
              email: formData.emailAddress,
              deliveryLocation: `${formData.city}, ${formData.state}, ${formData.pincode}`
            }
          });
        }
        setQuoteSent(true);
      } catch (err: any) {
        console.error("[DEBUG MODE] Quote RFQ submission failed: ", err);
        alert(`[DEBUG] RFQ Submission Failed: ${err?.message || 'Unknown API Exception'}`);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Direct Stock Order submission
    if (formData.paymentMethod === 'Razorpay') {
      setShowRazorpayModal(true);
      setRazorpayStep('options');
      return;
    }

    // Capture standard COD / QR Order
    try {
      await finalizeOrderSubmission({
        method: formData.paymentMethod,
        status: formData.paymentMethod === 'QR' ? 'Awaiting Verification' : 'Pending',
        screenshotUrl: formData.screenshotUrl || undefined
      });
    } catch(err: any) {
      console.error("[DEBUG MODE] Direct Checkout Failed:", err);
      alert(`[DEBUG] Checkout Failed: ${err?.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  const finalizeOrderSubmission = async (payInfo: { 
    method: 'COD' | 'QR' | 'Razorpay', 
    status: 'Pending' | 'Awaiting Verification' | 'Paid (Partial)' | 'Paid (Full)' | 'Rejected',
    screenshotUrl?: string,
    transactionId?: string,
    paymentLinkId?: string,
    receiptNumber?: string
  }) => {
    setIsSubmitting(true);
    const orderObj: Partial<Order> = {
      customerName: formData.name,
      companyName: formData.companyName,
      totalAmount: finalTotal,
      
      mobileNumber: formData.mobileNumber,
      altMobileNumber: formData.altMobileNumber || undefined,
      emailAddress: formData.emailAddress,
      gstNumber: formData.gstNumber || undefined,

      deliveryAddress: {
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || undefined,
        landmark: formData.landmark || undefined,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode
      },

      orderInstructions: {
        preferredDate: formData.preferredDate || undefined,
        timePreference: formData.timePreference,
        specialInstructions: formData.specialInstructions || undefined,
        loadingUnloading: formData.loadingUnloading || undefined
      },

      logistics: {
        transporterPreference: formData.transporterPreference || undefined,
        pickupType: formData.pickupType
      },

      pricingSummary: {
        subtotal: cartSubtotal,
        freightCharges: freightCharges,
        taxes: compositeTaxes,
        total: finalTotal,
        advanceRequired: isAdvanceRequired ? advanceAmount : undefined
      },

      payment: {
        method: payInfo.method,
        status: payInfo.status,
        screenshotUrl: payInfo.screenshotUrl,
        transactionId: payInfo.transactionId,
        paymentLinkId: payInfo.paymentLinkId,
        receiptNumber: payInfo.receiptNumber,
        amountPaid: payInfo.status.startsWith('Paid') ? advanceAmount : 0
      }
    };

    try {
      const generatedId = await placeOrder(orderObj);
      setSubmittedOrderId(generatedId);
      // Re-create high integrity confirmed order details for the receipt view
      setSubmittedOrderDetails({
        id: generatedId,
        date: new Date().toISOString().split('T')[0],
        status: 'Received',
        items: [...cart],
        ...orderObj
      } as Order);
    } catch (err: any) {
      console.error("[DEBUG MODE] Error placing Order: ", err);
      alert(`[DEBUG] Finalize Order Failed: ${err?.message || "Encountered trouble processing order details."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeMockRazorpayPayment = () => {
    setRazorpayStep('processing');
    setTimeout(() => {
      setRazorpayStep('success');
      setTimeout(async () => {
        setShowRazorpayModal(false);
        const receiptNo = `rcpt_${Math.floor(100000 + Math.random() * 900000)}`;
        const txId = `pay_rzp_${Math.floor(10000000 + Math.random() * 90000000)}`;
        const payLink = `https://rzp.io/i/apex_${Math.floor(1000 + Math.random() * 9000)}`;
        
        await finalizeOrderSubmission({
          method: 'Razorpay',
          status: isAdvanceRequired ? 'Paid (Partial)' : 'Paid (Full)',
          transactionId: txId,
          receiptNumber: receiptNo,
          paymentLinkId: payLink
        });
      }, 1500);
    }, 2000);
  };

  // ----------------- RENDER CONFIRMED ORDER RECEIPT -----------------
  if (submittedOrderId && submittedOrderDetails) {
    const o = submittedOrderDetails;
    return (
      <div className="max-w-3xl mx-auto space-y-6 px-4 py-8">
        {/* Success Splash Card */}
        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Order Confirmed Successfully!</h2>
            <p className="text-xs text-emerald-800 font-semibold mt-1">Order Ref ID: <span className="font-mono text-sm bg-emerald-100/50 px-2 py-0.5 rounded text-emerald-950 uppercase">{o.id}</span></p>
            <p className="text-[11px] text-slate-500 mt-2 max-w-lg mx-auto">
              Your transaction has been securely logged with the factory central dashboard. A compliance invoice will be generated based on the settings selected.
            </p>
          </div>
        </div>

        {/* Order Breakdown Certificate */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {/* Header Metadata */}
          <div className="p-5 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Submission Timeline</span>
              <p className="text-xs font-bold text-slate-800">{o.date} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider sm:text-right block">Selected Gateway</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 border border-indigo-100 text-indigo-700 uppercase">
                {o.payment?.method === 'COD' ? 'Cash on Delivery (COD)' : o.payment?.method === 'QR' ? 'UPI / Bank QR Image' : 'Razorpay Secure Platform'}
              </span>
            </div>
          </div>

          {/* Delivery & Logistics Certificate */}
          <div className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              B2B Shipment & Delivery Directives
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-405 uppercase tracking-wider block text-slate-400">Buyer Corporate Identity</span>
                <p className="font-bold text-slate-900">{o.companyName}</p>
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p>Rep: {o.customerName}</p>
                  <p>Mobile: {o.mobileNumber}</p>
                  {o.altMobileNumber && <p>Alt Mobile: {o.altMobileNumber}</p>}
                  <p>Email: {o.emailAddress}</p>
                  {o.gstNumber && <p className="font-mono text-[10px] text-indigo-700 font-semibold uppercase">GSTIN: {o.gstNumber}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-405 uppercase tracking-wider block text-slate-400">Destination Hub Address</span>
                <div className="font-semibold text-slate-800 leading-relaxed">
                  <p>{o.deliveryAddress?.addressLine1}</p>
                  {o.deliveryAddress?.addressLine2 && <p>{o.deliveryAddress.addressLine2}</p>}
                  {o.deliveryAddress?.landmark && <p className="text-slate-550 italic text-[11px]">Landmark: {o.deliveryAddress.landmark}</p>}
                  <p className="mt-1">{o.deliveryAddress?.city}, {o.deliveryAddress?.state} - {o.deliveryAddress?.pincode}</p>
                  <p className="text-slate-500 uppercase tracking-normal text-[10px]">{o.deliveryAddress?.country}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg">
              <div>
                <p className="font-bold text-slate-700">Preferred Routine:</p>
                <p>Date: {o.orderInstructions?.preferredDate || 'Earliest dispatch Slot'}</p>
                <p>Hours: {o.orderInstructions?.timePreference}</p>
              </div>
              <div>
                <p className="font-bold text-slate-700">Logistics Alignment:</p>
                <p>Preference: {o.logistics?.transporterPreference || 'Factory Logistics Team'}</p>
                <p className="capitalize">Type: {o.logistics?.pickupType}</p>
              </div>
              {o.orderInstructions?.specialInstructions && (
                <div className="sm:col-span-2">
                  <p className="font-bold text-slate-700">Owner Directives:</p>
                  <p className="italic">"{o.orderInstructions.specialInstructions}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Ledger */}
          <div className="p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 block">Supplied Products Ledger</h3>
            <ul className="divide-y divide-slate-100">
              {o.items.map((item, i) => (
                <li key={i} className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex gap-2.5 items-center">
                    <img src={item.product?.images?.[0]} className="w-8 h-8 rounded object-cover border" alt="" />
                    <div>
                      <p className="font-bold text-slate-800">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Article Code: {item.product.articleCode} / SKU: {item.product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-950">₹{(item.product.offerPrice * item.quantity).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-450">{item.quantity} units @ ₹{item.product.offerPrice}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Financial Totals */}
          <div className="p-5 bg-slate-50/50 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Financial Audit</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span>₹{o.pricingSummary?.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Freight & Handling {o.logistics?.pickupType === 'Self Pickup' && '(Self Pickup)'}</span>
                <span>₹{o.pricingSummary?.freightCharges?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Standard Business GST (18%)</span>
                <span>₹{o.pricingSummary?.taxes?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-200/80 pt-2.5">
                <span>Grand Total Value</span>
                <span>₹{o.pricingSummary?.total?.toLocaleString()}</span>
              </div>
            </div>

            {/* Dynamic Partial/Advance Alert */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 mt-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Transaction Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                  o.payment?.status.includes('Paid') ? 'bg-green-150 text-green-800 bg-green-50' : 'bg-amber-100 text-amber-800 bg-amber-50'
                }`}>
                  {o.payment?.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-mono leading-none border-t pt-2 p-1">
                <div>
                  <p className="text-slate-400">Total Commitment</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">₹{o.pricingSummary?.total?.toLocaleString()}</p>
                </div>
                {o.payment?.amountPaid ? (
                  <div>
                    <p className="text-slate-400">Paid Advance Now ({paymentPrefs.advancePaymentPercentage}%)</p>
                    <p className="text-xs font-bold text-green-700 mt-1">₹{o.payment.amountPaid.toLocaleString()}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-400">COD Collected Area</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">₹{finalTotal.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {o.payment?.transactionId && (
                <div className="text-[10px] font-mono text-slate-500 border-t pt-2 flex justify-between">
                  <span>Merchant Razorpay Tx_ID: {o.payment.transactionId}</span>
                  <span>Receipt: {o.payment.receiptNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            type="button" 
            onClick={handleContinueShopping} 
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-sans text-center transition-all shadow-sm"
          >
            &larr; Return & Continue Buying
          </button>
          <a
            href={`https://wa.me/${factory?.phone?.replace(/[^0-9]/g, '') || '1234567890'}?text=Hi, my order ${o.id} is placed on your digital storefront for ₹${o.totalAmount.toLocaleString()} (${o.companyName}). Let's finalize invoice.`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" /> Wait for Live Dispatch Signal
          </a>
        </div>
      </div>
    );
  }

  // ----------------- RENDER SUBMITTED QUOTE CONFIRMATION -----------------
  if (quoteSent) {
    return (
      <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center mt-10 space-y-6">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto border border-indigo-150 animate-pulse">
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">RFQ Quotation Successfully Submitted</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Our enterprise sales coordinators will build custom bulk rates based on your instructions. Check your email or phone for pricing proposals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <button 
            onClick={handleContinueShopping} 
            className="w-full py-2.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
          >
            Browse Other Products
          </button>
          <a 
            href={`https://wa.me/${factory?.phone?.replace(/[^0-9]/g, '') || '1234567890'}?text=Hi, I just submitted an RFQ for ${cart.length} items on your catalog (${formData.companyName}). Let's discuss pricing.`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-1"
          >
            Contact Sales Representative
          </a>
        </div>
      </div>
    );
  }

  // ----------------- MAIN SHOPPING CART INTERFACE -----------------
  if (cart.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-slate-150 rounded-2xl max-w-xl mx-auto p-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-105-0 flex items-center justify-center mx-auto border border-slate-250 bg-slate-50 text-slate-400">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Shopping cart is hollow</h2>
          <p className="text-xs text-slate-500 mt-1">Please select industrial catalogs or master products to load your purchase ledger.</p>
        </div>
        <button 
          onClick={handleContinueShopping} 
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
        >
          Explore Catalogue Listing &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back to Catalogue */}
      <button 
        onClick={handleContinueShopping}
        className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Products
      </button>

      {/* Cart Content */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:items-start">
        {/* Left column: Cart Items */}
        <div className="lg:col-span-6 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">Purchase Ledger</span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Items Confirmed in Cart ({cart.length})</h2>
          
          <ul className="divide-y divide-slate-100">
            {cart.map((item) => (
              <li key={item.product.id} className="py-4 flex">
                <div className="flex-shrink-0 w-16 h-16 border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="ml-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{item.product.name}</h3>
                      <p className="text-[9px] uppercase font-mono tracking-wider text-slate-450 mt-0.5">Article: {item.product.articleCode}</p>
                      <p className="text-[9px] font-semibold text-indigo-600 mt-0.5">MOQ Req: {item.product.moq} Units</p>
                    </div>
                    <p className="text-xs font-bold text-slate-900">₹{(item.product.offerPrice * item.quantity).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <div className="flex items-center border border-slate-350 bg-slate-50 rounded">
                      <button 
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, Math.max(item.product.moq, item.quantity - 10))}
                        className="px-2 py-0.5 text-slate-650 hover:bg-slate-100"
                      >-</button>
                      <span className="w-10 text-center font-bold text-slate-900 text-xs">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 10)}
                        className="px-2 py-0.5 text-slate-651 hover:bg-slate-100"
                      >+</button>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFromCart(item.product.id)} 
                      className="font-bold text-[9px] uppercase tracking-wider text-red-600 hover:text-red-700 flex items-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right column: Form & checkout options */}
        <div className="lg:col-span-6 mt-8 lg:mt-0 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {/* Minimum order restriction */}
          {cartSubtotal < paymentPrefs.minimumOrderValue && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-2.5 items-start text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Minimum Order Cap Conflict</p>
                <p className="text-[10px] mt-0.5 text-slate-600">The factory restricts purchases below ₹{paymentPrefs.minimumOrderValue.toLocaleString()}. Your subtotal is ₹{cartSubtotal.toLocaleString()}. Please load additional volumes to proceed.</p>
              </div>
            </div>
          )}

          {/* Workflow Picker Tabs */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl">
            <button 
              type="button"
              onClick={() => setActiveTab('checkout')}
              className={`flex-1 flex justify-center items-center py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors ${activeTab === 'checkout' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5" /> CONFIRM & PAY
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('quote')}
              className={`flex-1 flex justify-center items-center py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors ${activeTab === 'quote' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" /> REQUEST RFQ QUOTE
            </button>
          </div>

          <form onSubmit={handleCheckoutSubmit} className="space-y-6">
            
            {/* SEC 1: BUYER DETAILS */}
            <div className="space-y-3">
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block border-b pb-1">Sec 1. Buyer Corporate Profile</span>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Buyer Authorized Name</label>
                  <input required type="text" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Company Trade Name</label>
                  <input required type="text" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Mobile (Registered)</label>
                  <input required type="text" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Alternate Contact Number</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" value={formData.altMobileNumber} onChange={e => setFormData({...formData, altMobileNumber: e.target.value})} />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Official Email Address</label>
                  <input required type="email" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" value={formData.emailAddress} onChange={e => setFormData({...formData, emailAddress: e.target.value})} />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">GSTIN Number (Optional)</label>
                  <input type="text" placeholder="e.g. 29ABCDE1234F1Z5" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white font-mono uppercase" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
                </div>
              </div>
            </div>

            {/* SEC 2: EXPANDED DELIVERY ADDRESS */}
            {activeTab === 'checkout' && (
              <>
                <div className="space-y-3">
                  <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block border-b pb-1">Sec 2. Delivery & Destination Address</span>
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Address Line 1 (Building, Suite, Plot)</label>
                      <input required={activeTab === 'checkout'} type="text" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" value={formData.addressLine1} onChange={e => setFormData({...formData, addressLine1: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Address Line 2 (Sub-district, Phase, Street)</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" value={formData.addressLine2} onChange={e => setFormData({...formData, addressLine2: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Landmark (Adjacent Landmark)</label>
                        <input type="text" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">City</label>
                        <input required={activeTab === 'checkout'} type="text" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">State</label>
                        <input required={activeTab === 'checkout'} type="text" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Country</label>
                        <input required={activeTab === 'checkout'} type="text" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Pincode / Postal Index</label>
                        <input required={activeTab === 'checkout'} type="text" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white font-mono" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEC 3: LOGISTICS & PREFERENCES */}
                <div className="space-y-3">
                  <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block border-b pb-1">Sec 3. Logistics & Special Directives</span>
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Preferred Shipment Mode</label>
                        <select 
                          className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1"
                          value={formData.pickupType}
                          onChange={e => setFormData({ ...formData, pickupType: e.target.value as any })}
                        >
                          <option value="Door Delivery">Door Delivery Required (+5% Freight)</option>
                          <option value="Self Pickup">Self Pickup (Local Transporter Arranged)</option>
                          <option value="Factory Pickup">Factory Point Pickup</option>
                        </select>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Specific Transporter Preference (Optional)</label>
                        <input type="text" placeholder="e.g. VRL Logistics, TCI Freight" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" value={formData.transporterPreference} onChange={e => setFormData({...formData, transporterPreference: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Preferred Delivery Date</label>
                        <input type="date" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 text-slate-950 bg-white" value={formData.preferredDate} onChange={e => setFormData({...formData, preferredDate: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Delivery Hour Preferences</label>
                        <input type="text" placeholder="e.g. 9 AM - 6 PM" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 text-slate-950 bg-white" value={formData.timePreference} onChange={e => setFormData({...formData, timePreference: e.target.value})} />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Loading/Unloading Requirements</label>
                        <input type="text" placeholder="e.g. Need hydra crane at site" className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 text-slate-950 bg-white" value={formData.loadingUnloading} onChange={e => setFormData({...formData, loadingUnloading: e.target.value})} />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Order Instructions</label>
                        <textarea rows={2} className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950 bg-white" placeholder="Custom branding, tags, box specifications..." value={formData.specialInstructions} onChange={e => setFormData({...formData, specialInstructions: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEC 4: CHOOSE PAYMENT OPTIONS */}
                <div className="space-y-3">
                  <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block border-b pb-1">Sec 4. Complete Payment Collection</span>
                  <div className="space-y-3 text-xs">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Select Your Preferred Method</label>
                    <div className="grid grid-cols-1 gap-2.5">
                      
                      {/* COD */}
                      {isCodAvailable ? (
                        <label className={`block border p-3 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'bg-indigo-50/50 border-indigo-550/60 ring-2 ring-indigo-500/10' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                          <div className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-2 font-bold text-slate-850">
                              <input type="radio" value="COD" checked={formData.paymentMethod === 'COD'} onChange={() => setFormData({ ...formData, paymentMethod: 'COD' })} className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" />
                              Cash on Delivery (COD)
                            </span>
                            <span className="text-[9px] uppercase font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">PAY UPON DELIVERY</span>
                          </div>
                        </label>
                      ) : (
                        <div className="p-3 border rounded-lg bg-slate-100 text-slate-400 text-xs italic">Cash on Delivery (COD) disabled by manufacturer</div>
                      )}

                      {/* QR PAYMENT */}
                      {isQrAvailable ? (
                        <label className={`block border p-3 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'QR' ? 'bg-indigo-50/50 border-indigo-550/60 ring-2 ring-indigo-500/10' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                          <div className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-2 font-bold text-slate-850">
                              <input type="radio" value="QR" checked={formData.paymentMethod === 'QR'} onChange={() => setFormData({ ...formData, paymentMethod: 'QR' })} className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" />
                              Factory QR Code Pay
                            </span>
                            <span className="text-[9px] uppercase font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">QR Verification</span>
                          </div>
                        </label>
                      ) : (
                        <div className="p-3 border rounded-lg bg-slate-100 text-slate-400 text-xs italic">QR Code direct verification payment disabled</div>
                      )}

                      {/* RAZORPAY API */}
                      {isRazorpayAvailable ? (
                        <label className={`block border p-3 rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'Razorpay' ? 'bg-indigo-50/50 border-indigo-550/60 ring-2 ring-indigo-500/10' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                          <div className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-2 font-bold text-slate-850">
                              <input type="radio" value="Razorpay" checked={formData.paymentMethod === 'Razorpay'} onChange={() => setFormData({ ...formData, paymentMethod: 'Razorpay' })} className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" />
                              Razorpay Instant B2B Payment
                            </span>
                            <span className="text-[9px] uppercase font-bold bg-green-50 text-green-600 px-1.5 py-0.5 rounded">UPI, NetBanking, Cards</span>
                          </div>
                        </label>
                      ) : (
                        <div className="p-3 border rounded-lg bg-slate-100 text-slate-400 text-xs italic">Razorpay automated merchant payment method disabled</div>
                      )}
                    </div>

                    {/* DYNAMIC QR CODE DISPLAY SECTION */}
                    {formData.paymentMethod === 'QR' && (
                      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-4">
                        <div className="text-center font-bold text-slate-800 space-y-1">
                          <p>SCAN TO INSTANT PAY & UPLOAD RECEIPT</p>
                          <p className="text-xs text-indigo-700 font-extrabold uppercase">
                            Payable Amount: ₹{advanceAmount.toLocaleString()} 
                            {isAdvanceRequired && ` (${paymentPrefs.advancePaymentPercentage}% Advance Required)`}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-center bg-white p-3 rounded-lg">
                          {/* UPI Code */}
                          <div className="space-y-1 text-center font-bold">
                            <span className="text-[8px] uppercase text-indigo-600 block">UPI Pay (PhonePe / GPay)</span>
                            <img src={paymentPrefs.upiQrCode} className="w-24 h-24 mx-auto object-contain border" alt="UPI Merchant QR Code" />
                          </div>
                          {/* Bank Accounts QR */}
                          <div className="space-y-1 text-center font-bold">
                            <span className="text-[8px] uppercase text-indigo-650 block">Direct Bank Transfer</span>
                            <img src={paymentPrefs.bankQrCode || paymentPrefs.upiQrCode} className="w-24 h-24 mx-auto object-contain border" alt="Account Bank details QR" />
                          </div>
                        </div>

                        {/* Screenshot uploader */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-indigo-600 tracking-wider block">Upload Screenshot Proof of Payment (Under 500KB)</label>
                          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-300">
                            {formData.screenshotUrl ? (
                              <div className="relative shrink-0 w-12 h-12 bg-slate-100 text-slate-450 rounded overflow-hidden border">
                                <img src={formData.screenshotUrl} className="w-full h-full object-cover" alt="Screenshot preview" />
                                <button type="button" onClick={() => setFormData({ ...formData, screenshotUrl: '' })} className="absolute inset-0 bg-black/60 text-white flex items-center justify-center font-bold text-[8px] uppercase">Reset</button>
                              </div>
                            ) : (
                              <div className="w-12 h-12 shrink-0 bg-slate-50 border border-dashed rounded flex items-center justify-center text-slate-400">
                                <UploadCloud className="w-5 h-5" />
                              </div>
                            )}
                            <div className="flex-1 font-semibold">
                              <input 
                                type="file" 
                                accept="image/*" 
                                required={activeTab === 'checkout' && formData.paymentMethod === 'QR'} 
                                onChange={handleScreenshotUpload} 
                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" 
                              />
                              <p className="text-[9px] text-slate-400 mt-1 font-medium">Verify your bank deposit timeline carefully.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'quote' && (
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Technical / Custom Branding Specifications (Optional)</label>
                <textarea rows={3} className="block w-full border border-slate-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 bg-white text-xs leading-relaxed" placeholder="Mention custom tags, neck-printing options, target pricing ranges..." value={formData.specialInstructions} onChange={e => setFormData({...formData, specialInstructions: e.target.value})} />
              </div>
            )}

            {/* SEC 5: FINANCIAL SUMMARY PANEL */}
            <div className="pt-6 border-t border-slate-200 mt-6 space-y-4">
              <div className="bg-slate-200/50 p-4 rounded-xl space-y-2 text-xs">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block mb-2">Order Price Summary</span>
                <div className="flex justify-between text-slate-500">
                  <span>Cart Item Subtotal ({cart.length} Types)</span>
                  <span>₹{cartSubtotal.toLocaleString()}</span>
                </div>
                {activeTab === 'checkout' && (
                  <>
                    <div className="flex justify-between text-slate-500">
                      <span>Logistics Freight ({formData.pickupType})</span>
                      <span>₹{freightCharges.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Standard B2B GST (18%)</span>
                      <span>₹{compositeTaxes.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-350 pt-2.5">
                  <span>Commitment Total Value</span>
                  <span>₹{(activeTab === 'checkout' ? finalTotal : cartSubtotal).toLocaleString()}</span>
                </div>

                {/* Advance percentage split notice */}
                {activeTab === 'checkout' && isAdvanceRequired && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 mt-3 text-[11px] leading-tight text-slate-650 space-y-1.5 font-sans">
                    <div className="flex justify-between text-indigo-700 font-bold">
                      <span>Required Advance ({paymentPrefs.advancePaymentPercentage}%)</span>
                      <span>₹{advanceAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-450 font-medium">
                      <span>Post-dispatch Balance due later ({100 - paymentPrefs.advancePaymentPercentage}%)</span>
                      <span>₹{balanceDueLater.toLocaleString()}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1 font-medium leading-none">
                      Note: Production coordinates as soon as advanced deposit verifies.
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || (activeTab === 'checkout' && cartSubtotal < paymentPrefs.minimumOrderValue)}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:bg-indigo-400 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2"></div>
                    Transmitting Ledger Details...
                  </>
                ) : (
                  <>
                    {activeTab === 'checkout' 
                      ? `Proceed & Pay ${isAdvanceRequired ? `₹${advanceAmount.toLocaleString()} Advance` : `₹${finalTotal.toLocaleString()}`}` 
                      : 'Submit Custom Quote RFQ'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RAZORPAY OVERLAY SIMULATOR MODAL */}
      {showRazorpayModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
            {/* Modal Header */}
            <div className="p-4 bg-slate-905 flex justify-between items-center text-slate-100 bg-[#0c1322]">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-600 font-extrabold text-[10px] text-white tracking-widest">RZP</span>
                <span className="font-sans font-extrabold uppercase text-[10px] tracking-wider text-slate-300">Razorpay Merchant Gateway Sandbox</span>
              </div>
              <button type="button" onClick={() => setShowRazorpayModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            {/* Mode: Selection Options */}
            {razorpayStep === 'options' && (
              <div className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-[9px] uppercase font-bold text-indigo-600 block">Apex Textiles Checkout Wallet</span>
                  <p className="text-sm font-bold text-slate-800">Choose a Simulated Standard B2B Channel</p>
                  <p className="text-xl font-black text-slate-900 my-2">₹{advanceAmount.toLocaleString()}</p>
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${selectedRazorpayMethod === 'upi' ? 'bg-indigo-50 border-indigo-400' : 'bg-white'}`}>
                    <input type="radio" value="upi" checked={selectedRazorpayMethod === 'upi'} onChange={() => setSelectedRazorpayMethod('upi')} />
                    <div>
                      <p className="font-extrabold">Unified Payments Interface (UPI)</p>
                      <p className="text-[10px] text-slate-400 font-medium">Instant Verification with PhonePe, PayTM, or GPay</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${selectedRazorpayMethod === 'card' ? 'bg-indigo-50 border-indigo-400' : 'bg-white'}`}>
                    <input type="radio" value="card" checked={selectedRazorpayMethod === 'card'} onChange={() => setSelectedRazorpayMethod('card')} />
                    <div>
                      <p className="font-extrabold">B2B Commercial Card Option</p>
                      <p className="text-[10px] text-slate-400 font-medium">Submit Corporate Visa, Master, or AMEX stock cards</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${selectedRazorpayMethod === 'netbanking' ? 'bg-indigo-50 border-indigo-400' : 'bg-white'}`}>
                    <input type="radio" value="netbanking" checked={selectedRazorpayMethod === 'netbanking'} onChange={() => setSelectedRazorpayMethod('netbanking')} />
                    <div>
                      <p className="font-extrabold">Corporate NetBanking Gateways</p>
                      <p className="text-[10px] text-slate-400 font-medium">Verify credentials via major Indian banking lines</p>
                    </div>
                  </label>
                </div>

                <button 
                  type="button" 
                  onClick={executeMockRazorpayPayment}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg uppercase tracking-wider text-xs"
                >
                  Confirm Secure Payment Flow
                </button>
              </div>
            )}

            {/* Mode: Processing Progress */}
            {razorpayStep === 'processing' && (
              <div className="p-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mx-auto"></div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">TRANSMITTING BANK CREDENTIALS</p>
                  <p className="text-[10px] text-slate-500">Contacting 3D-Secure Bank Server. Please do mock reload.</p>
                </div>
              </div>
            )}

            {/* Mode: Successful callback */}
            {razorpayStep === 'success' && (
              <div className="p-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto text-green-600">
                  <Check className="w-6 h-6 shrink-0 font-black" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-widest">TRANSACTION APPROVED</p>
                  <p className="text-[10px] text-slate-500">Authorized Merchant Token created. Fetching confirmation document...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
