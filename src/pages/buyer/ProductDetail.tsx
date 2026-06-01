import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../lib/StoreContext';
import { 
  ArrowLeft, 
  ShoppingCart, 
  MessageSquare, 
  Truck, 
  ShieldCheck, 
  Check, 
  Share2, 
  Phone, 
  Mail,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, addToCart, factory, trackCartAddition, trackQuoteRequest } = useStore();
  const product = products.find(p => p.id === id);

  const searchParams = new URLSearchParams(location.search);
  const catalogueId = searchParams.get('c');

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(product ? product.moq : 0);
  const [added, setAdded] = useState(false);
  
  // Custom Toast States
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [activeTab, setActiveTab] = useState<'specs' | 'inquiry'>('specs');
  const [quoteTargetPrice, setQuoteTargetPrice] = useState('');
  const [quoteRequirement, setQuoteRequirement] = useState('');
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState('');

  useEffect(() => {
    if (product) {
      setQuantity(product.moq);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm max-w-sm mx-auto mt-12">
        <h3 className="text-base font-bold text-slate-900 mb-2">Product Not Found</h3>
        <p className="text-xs text-slate-500 mb-6">The requested product could not be located in our active warehouse inventory.</p>
        <button onClick={() => navigate('/store')} className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition">
          Return to Catalogues
        </button>
      </div>
    );
  }

  // Generate auxiliary images for a comprehensive gallery if only one is uploaded 
  const displayImages = product.images.length > 0 
    ? [
        product.images[0],
        // Mock variations for gorgeous B2B thumbnail browsing
        product.images[0] + "&auto=format&fit=crop&w=600&h=600&sat=-30",
        product.images[0] + "&auto=format&fit=crop&w=600&h=600&hue=120"
      ]
    : [
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop&q=80'
      ];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    
    if (catalogueId) {
      trackCartAddition(catalogueId);
    }

    setToastMessage(`Added ${quantity} units of ${product.name} to your inquiry cart.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleShareProduct = () => {
    const productUrl = `${window.location.origin}/store/product/${product.id}${catalogueId ? `?c=${catalogueId}` : ''}`;
    navigator.clipboard.writeText(productUrl);
    
    setToastMessage("Product sharing link copied to clipboard!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleQuoteInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTargetPrice = parseFloat(quoteTargetPrice) || product.offerPrice * 0.95;
    
    // Simulate quote addition
    if (catalogueId) {
      trackQuoteRequest(catalogueId);
    }

    setQuoteSuccessMsg(`Custom quotation request submitted successfully for ${quantity} items! Our sales team will get back to you.`);
    setQuoteTargetPrice('');
    setQuoteRequirement('');
    
    setToastMessage("Quotation request submitted!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0">
      
      {/* Back button */}
      <button 
        onClick={() => {
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
          if (catalogueId) {
            navigate(`/store/c/${catalogueId}`);
          } else if (localStorage.getItem('active_catalogue_id')) {
            navigate(`/store/c/${localStorage.getItem('active_catalogue_id')}`);
          } else {
            navigate('/store');
          }
        }}
        className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Collection Showroom
      </button>

      {/* Main product view block */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Image Gallery Module */}
          <div className="lg:col-span-6 p-4 md:p-8 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Active Image Display */}
              <div className="aspect-square w-full max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 flex items-center justify-center relative">
                <img 
                  referrerPolicy="no-referrer"
                  src={displayImages[activeImageIdx]} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
                <span className="absolute bottom-3 right-3 text-[9px] font-mono font-bold bg-slate-950/80 backdrop-blur text-white px-2.5 py-1 rounded">
                  Image {activeImageIdx + 1} / {displayImages.length}
                </span>
              </div>

              {/* Slider Thumbnails List */}
              <div className="flex gap-2.5 justify-center overflow-x-auto py-2">
                {displayImages.map((img, idx) => {
                  const isActive = idx === activeImageIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${
                        isActive ? 'border-indigo-600 scale-102 ring-2 ring-indigo-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img referrerPolicy="no-referrer" src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-around border-t border-slate-200/60 pt-6 mt-6">
              <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <Truck className="w-4 h-4 mr-1.5 text-indigo-500" />
                {product.deliveryTimeDays} Days Lead Time
              </div>
              <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-500" />
                Premium Quality Control
              </div>
              <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <Award className="w-4 h-4 mr-1.5 text-indigo-500" />
                ISO Certified Factory
              </div>
            </div>
          </div>

          {/* Right Column: Key Details & Wholesale Panel */}
          <div className="lg:col-span-6 p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* Product Header details */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 rounded border border-indigo-100">
                      {product.category}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      CODE: {product.articleCode}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{product.name}</h1>
                </div>

                <button 
                  onClick={handleShareProduct}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-indigo-650 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors inline-flex items-center shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
                </button>
              </div>

              {/* Offer price display */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">₹{product.offerPrice}</span>
                    {product.offerPrice < product.mrp && (
                      <span className="text-base text-slate-400 line-through font-medium">₹{product.mrp}</span>
                    )}
                  </div>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-1">Wholesale Price (Excl. GST)</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">MOQ: {product.moq} Units</span>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-1">Minimum volume limit</p>
                </div>
              </div>

              {/* Product description */}
              <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>

              {/* Specs & Requirements Tabs Module */}
              <div className="space-y-3 pt-2">
                <div className="flex border-b border-slate-250">
                  <button 
                    onClick={() => setActiveTab('specs')}
                    className={`pb-2.5 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                      activeTab === 'specs' ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Technical Specifications
                  </button>
                  <button 
                    onClick={() => setActiveTab('inquiry')}
                    className={`ml-5 pb-2.5 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                      activeTab === 'inquiry' ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Custom Product Inquiry
                  </button>
                </div>

                {activeTab === 'specs' ? (
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 py-2.5 text-xs">
                    <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-105">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Raw Material</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{product.material}</span>
                    </div>
                    <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-105">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Available Colors</span>
                      <span className="font-semibold text-indigo-700 text-[11px] font-medium block truncate" title={product.color}>
                        {product.color}
                      </span>
                    </div>
                    <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-105">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Offered Sizing</span>
                      <span className="font-semibold text-slate-800 text-[11px] block truncate">{product.size}</span>
                    </div>
                    <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-105">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Product SKU Unit</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">{product.sku || 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleQuoteInquiry} className="space-y-3 py-2">
                    {quoteSuccessMsg && (
                      <p className="p-2.5 bg-green-50 border border-green-200 text-green-700 text-[10px] rounded font-medium">{quoteSuccessMsg}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Target Price / Unit (₹)</label>
                        <input
                          type="number"
                          value={quoteTargetPrice}
                          onChange={(e) => setQuoteTargetPrice(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 font-bold"
                          placeholder={`E.g. ${product.offerPrice - 15}`}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Inquiry Volume</label>
                        <input
                          type="number"
                          min={product.moq}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(product.moq, parseInt(e.target.value) || product.moq))}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Custom Styling Details (Optional)</label>
                      <textarea
                        value={quoteRequirement}
                        onChange={(e) => setQuoteRequirement(e.target.value)}
                        rows={2}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                        placeholder="Explain requirements (logos, special fabric variations, tags...)"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-indigo-600 text-white rounded font-bold text-[10px] uppercase tracking-wider hover:bg-indigo-700 transition"
                    >
                      Submit Custom RFQ
                    </button>
                  </form>
                )}
              </div>

            </div>

            {/* Wholesale cart controls */}
            <div className="pt-6 border-t border-slate-200 mt-6 space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Order Volume</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number" 
                      min={product.moq} 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(product.moq, parseInt(e.target.value) || product.moq))}
                      className="block w-24 border-slate-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs py-1.5 px-2 bg-white border font-bold text-slate-900 text-center rounded-md"
                    />
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 bg-white border border-slate-200 px-2 py-1.5 rounded shadow-sm">
                      MOQ: {product.moq}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 shadow-md transform active:scale-95 shrink-0 whitespace-nowrap ${
                    added ? 'bg-green-600 hover:bg-green-700 font-extrabold ring-2 ring-green-100' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {added ? (
                    <><Check className="w-4 h-4 mr-1.5" /> Added to Enquiry</>
                  ) : (
                    <><ShoppingCart className="w-4 h-4 mr-1.5" /> Add to Inquiry Cart</>
                  )}
                </button>
              </div>

              {/* Contact factory directly */}
              <div className="space-y-2.5">
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">Direct Factory Wholesale Desks</span>
                <div className="grid grid-cols-3 gap-2">
                  <a 
                    href={`https://wa.me/${factory.phone?.replace(/[^0-9]/g, '')}?text=Hi, I am interested in ${product.name} (${product.articleCode}) from catalogue: ${catalogueId || ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center py-2 px-1 border border-green-500 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1" /> WhatsApp
                  </a>
                  <a 
                    href={`mailto:${factory.email}?subject=Wholesale Inquiry: ${product.name}&body=Hello, I am interested in your ${product.name} (${product.articleCode}).`}
                    className="flex items-center justify-center py-2 px-1 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                  >
                    <Mail className="w-3.5 h-3.5 mr-1" /> Send Email
                  </a>
                  <a 
                    href={`tel:${factory.phone}`}
                    className="flex items-center justify-center py-2 px-1 border border-slate-200 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                  >
                    <Phone className="w-3.5 h-3.5 mr-1" /> Dial Phone
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Floating success banner toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-850/80 text-white rounded-lg p-3.5 shadow-2xl z-50 text-xs font-bold leading-normal flex items-center gap-2 max-w-sm transition-all duration-300 animate-slide-up">
          <Check className="w-4 h-4 text-green-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
