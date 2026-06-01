import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  LogOut,
  Menu,
  BookOpen,
  FileSpreadsheet,
  Sliders,
  Users,
  Lock,
  ArrowRight,
  Mail,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { useStore } from '../../lib/StoreContext';

export default function AdminLayout() {
  const { 
    factory, 
    currentUser, 
    authLoading, 
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    resetPassword,
    logout 
  } = useStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  // Email login / register states
  const [authMode, setAuthMode] = React.useState<'signin' | 'register'>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [isResetting, setIsResetting] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Catalogues', path: '/admin/catalogues', icon: BookOpen },
    { name: 'CRM & Customers', path: '/admin/crm', icon: Users },
    { name: 'B2B Buyers', path: '/admin/buyers', icon: Users },
    { name: 'Master Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Quotations', path: '/admin/quotes', icon: FileText },
    { name: 'Template Center', path: '/admin/templates', icon: FileSpreadsheet },
    { name: 'Payment Preference', path: '/admin/settings', icon: Sliders },
  ];

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('Successfully authenticated with Google.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Google Auth failed or window was closed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please input both your email and password.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoggingIn(true);
    try {
      if (authMode === 'signin') {
        await loginWithEmail(email, password);
        setSuccessMsg('Logged in successfully!');
      } else {
        await registerWithEmail(email, password);
        setSuccessMsg('Admin Registered successfully! Welcome inside.');
      }
    } catch (err: any) {
      console.error(err);
      let errorString = err?.message || '';
      
      if (errorString.includes('auth/operation-not-allowed')) {
        setErrorMsg('Email & Password sign-in method is currently disabled in your Firebase backend configuration. To use this feature: Go to your Firebase Console -> Authentication -> Sign-in Method tab -> Add Provider -> Enable "Email/Password".');
      } else if (errorString.includes('auth/invalid-credential') || errorString.includes('auth/wrong-password') || errorString.includes('auth/user-not-found')) {
        setErrorMsg('Incorrect email or password details.');
      } else if (errorString.includes('auth/weak-password')) {
        setErrorMsg('Weak password. The password must contain at least 6 characters.');
      } else if (errorString.includes('auth/email-already-in-use')) {
        setErrorMsg('This specific Email Address is already registered to a separate account.');
      } else {
        setErrorMsg(errorString || 'Authentication failed. Please check credentials or network.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address first to reset your password.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsResetting(true);
    try {
      await resetPassword(email);
      setSuccessMsg('Password reset link has been sent to your email.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to send password reset email.');
    } finally {
      setIsResetting(false);
    }
  };

  // Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
        <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Verifying Admin Credentials...</p>
      </div>
    );
  }

  // Login Wall State
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden space-y-6">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center space-y-2 relative z-10">
            <div className="inline-flex p-3 rounded-xl bg-indigo-550/10 text-indigo-400 border border-indigo-500/20 mb-1">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white">Factory Owner Authentication</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Please authenticating below as factory administrator to manage pricing, inventory, catalog links, and view reports.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 text-xs font-bold leading-5 relative z-10">
            <button 
              type="button"
              onClick={() => { setAuthMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg text-center transition-all ${authMode === 'signin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg text-center transition-all ${authMode === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Register
            </button>
          </div>

          {/* Form Actions for Email/Password */}
          <form onSubmit={handleEmailAuthSubmit} className="space-y-4 relative z-10">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email"
                  required
                  placeholder="admin@factory.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResetting}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    {isResetting ? 'Sending...' : 'Forgot password?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Key className="w-4 h-4" />
                </span>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message Panel */}
            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-900/30 text-red-300 rounded-xl text-xs font-semibold leading-relaxed">
                {errorMsg}
              </div>
            )}

            {/* Success Message Panel */}
            {successMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 rounded-xl text-xs font-semibold leading-relaxed">
                {successMsg}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:bg-indigo-700/50 text-white rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer disabled:pointer-events-none"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  Please wait...
                </>
              ) : (
                <>
                  {authMode === 'signin' ? 'Sign In' : 'Create Admin Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-2 items-center text-xs text-slate-500 z-10">
            <div className="flex-grow border-t border-slate-850"></div>
            <span className="flex-shrink mx-4 font-semibold uppercase tracking-wider text-[10px]">Or continue with</span>
            <div className="flex-grow border-t border-slate-850"></div>
          </div>

          {/* Quick Google auth shortcut */}
          <button 
            type="button"
            disabled={isLoggingIn}
            onClick={handleGoogleSignIn}
            className="w-full relative z-10 py-2.5 px-4 flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-750 disabled:bg-slate-800/50 border border-slate-700/50 text-white rounded-xl font-semibold text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer disabled:pointer-events-none active:scale-[0.98]"
          >
            Sign In with Google
          </button>

          <footer className="text-center pt-2 relative z-10">
            <button 
              onClick={() => navigate('/')}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              &larr; Back to Buyer Portal
            </button>
          </footer>
        </div>
      </div>
    );
  }

  // Admin Verified Dashboard Layout
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-58 bg-[#0f172a] text-slate-300 border-r border-slate-800 shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {factory.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h1 className="font-semibold text-white tracking-tight truncate">{factory.name}</h1>
            <p className="text-[10px] text-slate-500 truncate">Factory Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-2">Management</div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-xs font-bold uppercase tracking-wide rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <item.icon className="w-4 h-4 mr-3 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Admin control panel footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-800/40 rounded border border-slate-700/30">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} className="w-5 h-5 rounded-full" alt="avatar" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[9px] font-bold">
                {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0)}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-white truncate">{currentUser.displayName || "Admin User"}</p>
              <p className="text-[8px] text-slate-500 truncate">{currentUser.email}</p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-3 shrink-0" />
            <span className="truncate">Sign Out</span>
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center w-full px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-850 transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 mr-3 shrink-0" />
            <span className="truncate">Exit to Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 h-14 px-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-slate-800 truncate w-40">{factory.name}</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 right-0 bg-[#0f172a] text-slate-300 border-b border-slate-800 z-20 shadow-lg">
            <nav className="p-3 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-2">Management</div>
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-md transition-colors ${
                      isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </NavLink>
              ))}
              
              <div className="border-t border-slate-800 mt-2 pt-2 space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-[10px] text-slate-400">
                  <div className="w-4 h-4 rounded-full bg-indigo-550 flex items-center justify-center text-white text-[8px] font-bold">
                    {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0)}
                  </div>
                  <span className="truncate">{currentUser.displayName || currentUser.email}</span>
                </div>
                
                <button 
                  onClick={logout}
                  className="flex items-center w-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
                
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center w-full px-3 py-2 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                >
                  <Building2 className="w-4 h-4 mr-3" />
                  Exit to Portal
                </button>
              </div>
            </nav>
          </div>
        )}

        <div className="flex-1 overflow-auto p-6 bg-[#f8fafc]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
