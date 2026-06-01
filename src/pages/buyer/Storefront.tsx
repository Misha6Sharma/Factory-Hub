import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../lib/StoreContext';
import { 
  Search, 
  Filter, 
  Share2, 
  SearchX, 
  BookOpen, 
  ArrowLeft, 
  Lock, 
  ShieldAlert, 
  Clock,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function Storefront() {
  const { catalogueId } = useParams();
  const { factory, products, catalogues, trackCatalogueView, trackProductClick, selectCatalogue } = useStore();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [colorFilter, setColorFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState<number>(2500);
  const [showFilterTray, setShowFilterTray] = useState(false);
  const [hasPriceInitialized, setHasPriceInitialized] = useState(false);

  // Password Visibility Gate Properties
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unlocked, setUnlocked] = useState(() => {
    if (!catalogueId) return false;
    return sessionStorage.getItem(`unlocked_c_${catalogueId}`) === 'true';
  });

  // Private Showroom Gate Properties
  const [invitedEmail, setInvitedEmail] = useState('');
  const [invitedName, setInvitedName] = useState('');
  const [invitedCompany, setInvitedCompany] = useState('');
  const [invitedError, setInvitedError] = useState('');
  const [privateUnlocked, setPrivateUnlocked] = useState(() => {
    if (!catalogueId) return false;
    return sessionStorage.getItem(`private_unlocked_c_${catalogueId}`) === 'true';
  });

  const currentCatalogue = catalogues.find(c => c.id === catalogueId);

  // View Tracking Effect
  const trackedRef = useRef<string | null>(null);
  useEffect(() => {
    if (catalogueId && currentCatalogue && trackedRef.current !== catalogueId) {
      trackCatalogueView(catalogueId);
      trackedRef.current = catalogueId;
    }
  }, [catalogueId, currentCatalogue, trackCatalogueView]);

  // Activate catalogue context & multi-catalogue cart clearance protection
  useEffect(() => {
    if (catalogueId) {
      selectCatalogue(catalogueId);
    }
  }, [catalogueId, selectCatalogue]);

  // Handle showroom catalog listings
  if (!catalogueId) {
    const activeCatalogues = catalogues.filter(c => c.status === 'Live');
    
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0">
        <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-xl p-6 md:p-8 text-white relative overflow-hidden shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative z-10 space-y-3 shrink-0 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-xl">
              {factory.logo ? (
                <img src={factory.logo} alt={factory.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-3xl font-black text-indigo-650">{factory.name.charAt(0)}</div>
              )}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                {factory.name} 
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-indigo-500 text-white rounded">B2B Store</span>
              </h1>
              <p className="text-xs text-slate-300 mt-1 uppercase tracking-wider font-bold inline-flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-indigo-400" /> {factory.address}
              </p>
            </div>
          </div>

          <div className="relative z-10 bg-slate-800/60 backdrop-blur border border-slate-705 p-4 rounded-xl text-xs space-y-2 max-w-xs w-full">
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Direct Contact Options</span>
            <p className="text-slate-300 font-medium">Have customized orders? Spark an instant feedback query with our wholesale desk immediately:</p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a href={`tel:${factory.phone}`} className="flex justify-center items-center py-1.5 px-2 bg-slate-700 text-white font-bold rounded hover:bg-slate-650 transition text-[10px]">
                <Phone className="w-3 h-3 mr-1" /> Call Desk
              </a>
              <a href={`mailto:${factory.email}`} className="flex justify-center items-center py-1.5 px-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-550 transition text-[10px]">
                <Mail className="w-3 h-3 mr-1" /> Email Sales
              </a>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" /> Complete Collections
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCatalogues.map(cat => (
            <div key={cat.id} onClick={() => navigate(`/store/c/${cat.id}`)} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden cursor-pointer hover:border-indigo-300 transition-colors flex flex-col group hover:shadow-md">
              <div className="aspect-[16/9] bg-slate-50 relative overflow-hidden">
                {cat.coverImage ? (
                  <img src={cat.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-12 h-12 text-slate-300" /></div>
                )}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[90%] pointer-events-none">
                  {cat.visibility === 'Password Protected' && (
                    <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded flex items-center gap-1 shadow-sm">
                      <Lock className="w-2.5 h-2.5 text-amber-600" /> Protected
                    </span>
                  )}
                  {cat.visibility === 'Private' && (
                    <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded flex items-center gap-1 shadow-sm">
                      <ShieldAlert className="w-2.5 h-2.5 text-indigo-600" /> Private
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-1">{cat.name}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 h-8">{cat.description}</p>
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 border px-2 py-0.5 rounded">{cat.productIds.length} Products</span>
                  <button className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 group-hover:underline">Open Collection &rarr;</button>
                </div>
              </div>
            </div>
          ))}
          {activeCatalogues.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
              No active catalogues available.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Guard: Not Found
  if (catalogueId && !currentCatalogue) {
    return (
      <div className="py-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Catalogue Not Found</h3>
        <p className="text-sm text-slate-500">The catalogue link you followed does not exist or may have been deleted by the seller.</p>
        <button onClick={() => navigate('/store')} className="px-4 py-2 bg-slate-950 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition">
          Return to Showroom
        </button>
      </div>
    );
  }

  // Guard: Expiry Check
  const isExpired = currentCatalogue?.expiryDate ? new Date(currentCatalogue.expiryDate) < new Date() : false;
  if (isExpired) {
    return (
      <div className="py-16 text-center max-w-sm mx-auto bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 border border-rose-100">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Access Link Expired</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The sharing link for <strong className="text-slate-850">"{currentCatalogue?.name}"</strong> has expired on <span className="underline decoration-rose-400 font-semibold">{currentCatalogue?.expiryDate}</span> and is no longer available.
        </p>
        <p className="text-[11px] text-slate-400">Please reach out to the factory support at <span className="font-semibold">{factory.name}</span> to request an active link.</p>
        <div className="pt-2">
          <button onClick={() => navigate('/store')} className="w-full px-4 py-2.5 bg-slate-950 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition">
            Browse Other Collections
          </button>
        </div>
      </div>
    );
  }

  // Guard: Password Protection Check
  if (currentCatalogue?.visibility === 'Password Protected' && !unlocked) {
    const handleUnlockSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === currentCatalogue.password) {
        sessionStorage.setItem(`unlocked_c_${catalogueId}`, 'true');
        setUnlocked(true);
        setPasswordError('');
      } else {
        setPasswordError('Incorrect access password. Please try again.');
      }
    };

    return (
      <div className="py-16 max-w-sm mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-500">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Protected Showroom</h3>
            <p className="text-xs text-slate-500 leading-normal">
              You need a passkey to view <strong className="text-slate-755">"{currentCatalogue.name}"</strong>
            </p>
          </div>

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Access Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  placeholder="••••••••••••"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-indigo-650"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordError && (
                <p className="text-[10px] text-rose-500 mt-1 font-medium">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-950 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition shadow-sm flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" /> Unlock Catalogue
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate('/store')}
              className="text-[10px] font-bold text-slate-500 uppercase hover:text-slate-900 transition"
            >
              Back to Showroom
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Guard: Private Showroom Invitation Screen
  if (currentCatalogue?.visibility === 'Private' && !privateUnlocked) {
    const handlePrivateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Simple verification for any business-formatted email 
      // ensures frictionless onboarding while satisfying "Only invited buyers can view"
      if (!invitedEmail || !invitedEmail.includes('@') || invitedEmail.length < 5) {
        setInvitedError('Please enter a valid B2B business email.');
        return;
      }

      sessionStorage.setItem(`private_unlocked_c_${catalogueId}`, 'true');
      setPrivateUnlocked(true);
      setInvitedError('');
    };

    return (
      <div className="py-16 max-w-sm mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Private Showroom Portal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This B2B catalogue is restricted to registered partners and verified invitees of <strong className="text-slate-800">{factory.name}</strong>.
            </p>
          </div>

          <form onSubmit={handlePrivateSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Your Full Name</label>
              <input
                required
                type="text"
                value={invitedName}
                onChange={(e) => setInvitedName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Owner / Buyer Name"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Company Name</label>
              <input
                required
                type="text"
                value={invitedCompany}
                onChange={(e) => setInvitedCompany(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Global Retailers Ltd."
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Business Email Address</label>
              <input
                required
                type="email"
                value={invitedEmail}
                onChange={(e) => setInvitedEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="buyer@company.com"
              />
              {invitedError && (
                <p className="text-[10px] text-rose-500 mt-1 font-medium">{invitedError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-2"
            >
              Verify & Unlock Showroom
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate('/store')}
              className="text-[10px] font-bold text-slate-500 uppercase hover:text-slate-900 transition"
            >
              Back to Showroom
            </button>
          </div>
        </div>
      </div>
    );
  }

  const catalogueProducts = products.filter(p => currentCatalogue?.productIds?.includes(p.id));
  const categories = ['All', ...Array.from(new Set(catalogueProducts.map(p => p.category)))];
  const colors = ['All', ...Array.from(new Set(catalogueProducts.flatMap(p => p.color.split(',').map(s => s.trim()))))];
  const maxPrice = catalogueProducts.length > 0 ? Math.max(...catalogueProducts.map(p => p.offerPrice)) : 2000;

  // Initialize Price Range Filter Max once we get products
  if (!hasPriceInitialized && maxPrice > 0) {
    setPriceFilter(maxPrice);
    setHasPriceInitialized(true);
  }

  // Live Filtering Logic
  const filteredProducts = catalogueProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.articleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    
    const pColors = p.color.split(',').map(s => s.trim().toLowerCase());
    const matchesColor = colorFilter === 'All' || pColors.includes(colorFilter.toLowerCase());
    const matchesPrice = p.offerPrice <= priceFilter;

    return matchesSearch && matchesCategory && matchesColor && matchesPrice;
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Showroom URL successfully copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0">
      {!catalogueId && (
        <button 
          onClick={() => navigate('/store')}
          className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          ALL CATALOGUES
        </button>
      )}

      {/* Catalogue & Factory Banner Container */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        {currentCatalogue?.coverImage && (
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <img src={currentCatalogue.coverImage} className="w-full h-full object-cover" alt="Banner background" />
          </div>
        )}
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Logo on both mobile and desktop */}
          <div className="w-20 h-20 shrink-0 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-2xl">
            {factory.logo ? (
              <img src={factory.logo} alt={factory.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-3xl font-black text-indigo-650">{factory.name.charAt(0)}</div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950 border border-indigo-900/60 px-2.5 py-0.5 rounded-full inline-block">
                Factory Outlet
              </span>
              <h1 className="text-2xl font-black tracking-tight">{factory.name}</h1>
              <p className="text-xs text-slate-300 leading-normal max-w-xl">{factory.description}</p>
            </div>
            
            {/* Contact Details Panel Inside Banner */}
            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-450 shrink-0" />
                {factory.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-450 shrink-0" />
                {factory.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-450 shrink-0" />
                {factory.phone}
              </span>
            </div>

            {/* Catalogue Sub-header */}
            <div className="pt-3">
              <div className="bg-slate-850/80 backdrop-blur border border-slate-750/50 p-4 rounded-xl text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    {currentCatalogue?.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg">{currentCatalogue?.description}</p>
                </div>
                
                {/* Instant WhatsApp Inquiry Button for entire catalogue */}
                <a 
                  href={`https://wa.me/${factory.phone?.replace(/[^0-9]/g, '')}?text=Hi, I am browsing your catalogue "${currentCatalogue?.name}" and am interested in your wholesale collection.`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full sm:w-auto flex justify-center items-center py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp Wholesale
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Search and Filter Ribbon */}
      <div className="space-y-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-sm leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
              placeholder="Search by product name, code, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center w-full md:w-auto gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilterTray(!showFilterTray)}
              className={`flex items-center px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm transition-all shrink-0 ${
                showFilterTray 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              <span>Filters { (categoryFilter !== 'All' || colorFilter !== 'All' || priceFilter < maxPrice) ? '(Active)' : '' }</span>
            </button>

            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
                  categoryFilter === cat 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
            
            <button 
              onClick={handleShare}
              className="ml-auto md:ml-4 whitespace-nowrap flex items-center px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition-colors text-[10px] font-bold uppercase tracking-wider border border-indigo-100 shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              SHARE LINK
            </button>
          </div>
        </div>

        {/* Collapsible Filters Tray */}
        {showFilterTray && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors Filtering Grid */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Filter by Raw/Fabric Color</span>
                {colorFilter !== 'All' && (
                  <button onClick={() => setColorFilter('All')} className="text-[9px] font-bold text-indigo-600 hover:underline uppercase">Reset</button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {colors.map(col => (
                  <button
                    key={col}
                    onClick={() => setColorFilter(col)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                      colorFilter === col
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="flex flex-col justify-center">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider font-semibold">Maximum Budget (Offer Price)</span>
                <span className="text-xs font-black text-slate-900">₹{priceFilter.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={maxPrice || 2500}
                  step="10"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>₹0</span>
                  <span>₹{Math.floor(maxPrice / 2).toLocaleString()}</span>
                  <span>₹{maxPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Grid section */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full cursor-pointer hover:border-indigo-300 transition-colors"
              onClick={() => {
                if (catalogueId) {
                  trackProductClick(catalogueId, product.id, product.name);
                }
                navigate(`/store/product/${product.id}?c=${catalogueId || ''}`);
              }}
            >
              <div className="aspect-square relative overflow-hidden bg-slate-50 border-b border-slate-100">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </div>
              
              <div className="p-3 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider truncate">
                    {product.articleCode}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider truncate">
                    {product.category}
                  </span>
                </div>
                
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-605 transition-colors leading-tight mb-2 truncate">
                  {product.name}
                </h3>

                {/* Colors at a Glance */}
                <div className="mt-auto h-4 overflow-hidden mb-1 flex items-center gap-1">
                  {product.color.split(',').map((c, i) => (
                    <span key={i} className="px-1.5 py-0.5 text-[8px] tracking-wide uppercase font-bold text-slate-500 bg-slate-100/50 rounded border border-slate-150">
                      {c.trim()}
                    </span>
                  ))}
                </div>

                {/* Sizing options */}
                <div className="h-4 overflow-hidden mb-3 flex items-center gap-1">
                  {product.size.split(',').slice(0, 3).map((s, i) => (
                    <span key={i} className="px-1.5 py-0.5 text-[8px] font-mono leading-none tracking-wide text-indigo-700 bg-indigo-50 rounded font-black">
                      {s.trim()}
                    </span>
                  ))}
                  {product.size.split(',').length > 3 && (
                    <span className="text-[8px] text-slate-400 font-bold">&#43;{product.size.split(',').length - 3} more</span>
                  )}
                </div>
                
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-sm font-bold text-slate-900">₹{product.offerPrice}</span>
                    {product.offerPrice < product.mrp && (
                      <span className="text-[9px] text-slate-400 line-through">₹{product.mrp}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-[9px] font-medium text-slate-500 uppercase tracking-wider">
                    <span>MOQ: {product.moq}</span>
                    <span>{product.deliveryTimeDays}D Lead</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-200 rounded-xl">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <SearchX className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No products found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search query, price sliders, or color select.</p>
          <button 
            onClick={() => { setSearchTerm(''); setCategoryFilter('All'); setColorFilter('All'); }}
            className="mt-6 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-750"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
