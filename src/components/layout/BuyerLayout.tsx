import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, Store, Menu } from 'lucide-react';
import { useStore } from '../../lib/StoreContext';

export default function BuyerLayout() {
  const { factory, cart, activeCatalogueId, catalogues } = useStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isSharedCatalogue = !!activeCatalogueId;
  const activeCatalogue = catalogues.find(c => c.id === activeCatalogueId);

  const handleLogoClick = () => {
    if (isSharedCatalogue && activeCatalogueId) {
      navigate(localStorage.getItem('active_catalogue_url') || `/store/c/${activeCatalogueId}`);
    } else {
      navigate('/store');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
              {factory.logo ? (
                <img src={factory.logo} alt={factory.name} className="h-8 w-8 rounded object-cover mr-3" />
              ) : (
                <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-sm mr-3">
                  {factory.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="font-bold text-slate-900 text-sm hidden sm:block tracking-tight">{factory.name}</h1>
                <p className="text-[10px] text-slate-500 hidden sm:block uppercase tracking-wider font-bold">Digital Storefront</p>
              </div>
            </div>

            <nav className="hidden md:flex flex-1 justify-center space-x-8">
              {!isSharedCatalogue ? (
                <NavLink 
                  to="/store"
                  className={({ isActive }) => 
                    `px-3 text-xs font-bold uppercase tracking-wider h-14 flex items-center border-b-2 ${
                      isActive ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-900'
                    }`
                  }
                >
                  Catalogue
                </NavLink>
              ) : (
                <span className="px-3 text-xs font-extrabold uppercase tracking-wider h-14 flex items-center text-indigo-600 border-b-2 border-indigo-650">
                  {activeCatalogue?.name || 'Exclusive Collection'}
                </span>
              )}
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => navigate('/store/cart')}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-indigo-600 rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
              {!isSharedCatalogue && (
                <button 
                  onClick={() => navigate('/')}
                  className="hidden sm:flex items-center px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors uppercase tracking-wider"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Exit Store
                </button>
              )}
              <button 
                className="md:hidden p-2 text-slate-400 hover:text-slate-500"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!isSharedCatalogue ? (
              <>
                <NavLink
                  to="/store"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded text-xs font-bold uppercase tracking-wider ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  Catalogue
                </NavLink>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="block w-full text-left px-3 py-2 flex items-center rounded text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Exit Store
                </button>
              </>
            ) : (
              <span className="block px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 rounded">
                Viewing: {activeCatalogue?.name || 'Exclusive Collection'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          Powered by Digital Factory App &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
