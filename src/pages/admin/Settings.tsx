import React, { useState } from 'react';
import { useStore } from '../../lib/StoreContext';
import { 
  Save, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  Key, 
  HelpCircle, 
  AlertTriangle, 
  UploadCloud, 
  Sliders,
  DollarSign,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import { FactoryProfile } from '../../types';

export default function Settings() {
  const { factory, updateFactoryProfile } = useStore();
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form state
  const [profile, setProfile] = useState<FactoryProfile>({
    ...factory,
    paymentPreferences: factory.paymentPreferences || {
      codEnabled: true,
      qrEnabled: true,
      upiQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=apexsales@axisbank',
      bankQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=bank://pay?acc=1234567890',
      razorpayEnabled: true,
      razorpayKeyId: 'rzp_test_apex123',
      razorpaySecret: 'apex_secret_xyz789',
      razorpayAccountDetails: 'Apex Textiles Ltd - HDFC Current A/C 99008877665544',
      advancePaymentPercentage: 25,
      minimumOrderValue: 2000
    }
  });

  const handleInputChange = (field: keyof FactoryProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentPrefChange = (prefField: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      paymentPreferences: {
        ...(prev.paymentPreferences || {
          codEnabled: true,
          qrEnabled: true,
          upiQrCode: '',
          bankQrCode: '',
          razorpayEnabled: true,
          advancePaymentPercentage: 0,
          minimumOrderValue: 0
        }),
        [prefField]: value
      }
    }));
  };

  const handleQrUpload = (prefField: 'upiQrCode' | 'bankQrCode', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert("Maximum image upload volume exceeded (500KB cap). Please compressor your QR image size.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handlePaymentPrefChange(prefField, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    try {
      await updateFactoryProfile(profile);
      setSuccessMsg('Factory profile and Payment Preferences updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert("Trouble updating factory configurations.");
    } finally {
      setIsSaving(false);
    }
  };

  const prefs = profile.paymentPreferences || {
    codEnabled: true,
    qrEnabled: true,
    upiQrCode: '',
    bankQrCode: '',
    razorpayEnabled: true,
    advancePaymentPercentage: 0,
    minimumOrderValue: 0
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Factory Settings & Payment Preferences</h2>
          <p className="text-xs text-slate-500 mt-1">Configure digital billing portals, settlement accounts, minimum orders, and partial advance receipts.</p>
        </div>
        <button 
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 bg-indigo-650 hover:bg-indigo-750 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Commit Changes
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 flex items-center gap-2.5 text-xs font-bold leading-relaxed shadow-sm animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Profile info & Order limits */}
        <div className="md:col-span-6 space-y-6">
          {/* PROFILE CARD */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
              <Building className="w-4 h-4 text-slate-500" />
              Corporate Identity Profile
            </h3>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Factory Enterprise Name</label>
                <input required type="text" className="w-full border border-slate-200 rounded-lg py-2 px-3 text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-500 font-bold" value={profile.name} onChange={e => handleInputChange('name', e.target.value)} />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Corporate Registration GSTIN / Tax ID</label>
                <input required type="text" className="w-full border border-slate-200 rounded-lg py-2 px-3 text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-500 font-mono uppercase" value={profile.gstNumber} onChange={e => handleInputChange('gstNumber', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Official Support Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Mail className="w-3.5 h-3.5" /></span>
                    <input type="email" className="w-full border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-500" value={profile.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">B2B Helpline Contact</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Phone className="w-3.5 h-3.5" /></span>
                    <input type="text" className="w-full border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-500" value={profile.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Logo URL Endpoint</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg py-2 px-3 text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-500 font-mono text-[10px]" value={profile.logo} onChange={e => handleInputChange('logo', e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Office Physical Address</label>
                <textarea rows={2} className="w-full border border-slate-200 rounded-lg py-2 px-3 text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-500" value={profile.address} onChange={e => handleInputChange('address', e.target.value)} />
              </div>
            </div>
          </div>

          {/* ADVANCED PARAMETERS & MINIMUM ORDER CAPS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
              <Sliders className="w-4 h-4 text-indigo-650" />
              Advanced Ordering Thresholds
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Minimum Order Capital (INR)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">₹</span>
                  <input 
                    type="number" 
                    className="w-full border border-slate-200 rounded-lg py-2 pl-7 pr-3 text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-500 font-bold" 
                    value={prefs.minimumOrderValue} 
                    onChange={e => handlePaymentPrefChange('minimumOrderValue', Number(e.target.value) || 0)} 
                  />
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">Checkout restricted below this value.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Advance Requirement (%)</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg py-2 px-3 text-slate-900 bg-slate-50 focus:outline-none font-bold cursor-pointer"
                  value={prefs.advancePaymentPercentage}
                  onChange={e => handlePaymentPrefChange('advancePaymentPercentage', Number(e.target.value))}
                >
                  <option value={0}>0% (Free - COD / Post billing verification)</option>
                  <option value={10}>10% Standard Advance Ledger</option>
                  <option value={25}>25% Premium Advance Deposit</option>
                  <option value={50}>50% Balanced Down-Payment</option>
                  <option value={100}>100% Full Payment Collection upfront</option>
                </select>
                <span className="text-[9px] text-slate-400 mt-1 block">Percentage of bill collected immediately on checkout.</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Checkboxes & specialized parameters */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
              <CreditCard className="w-4 h-4 text-slate-600" />
              Adjust Flexible Payment Options
            </h3>

            {/* OPTIONS MAPPING */}
            <div className="space-y-5">
              
              {/* Option COD */}
              <div className="space-y-2 pb-4 border-b border-dashed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input 
                      type="checkbox" 
                      id="codToggle" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 cursor-pointer" 
                      checked={prefs.codEnabled} 
                      onChange={e => handlePaymentPrefChange('codEnabled', e.target.checked)} 
                    />
                    <label htmlFor="codToggle" className="text-xs font-bold text-slate-800 cursor-pointer">Allow Cash on Delivery (COD)</label>
                  </div>
                  <span className="text-[9px] uppercase font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">COD Channel</span>
                </div>
                <p className="text-[10.5px] text-slate-550 leading-relaxed pl-7 text-slate-500">Allow buyers to submit orders with commitment to clear invoice post-delivery on field site.</p>
              </div>

              {/* Option QR Payments */}
              <div className="space-y-3 pb-4 border-b border-dashed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input 
                      type="checkbox" 
                      id="qrToggle" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 cursor-pointer" 
                      checked={prefs.qrEnabled} 
                      onChange={e => handlePaymentPrefChange('qrEnabled', e.target.checked)} 
                    />
                    <label htmlFor="qrToggle" className="text-xs font-bold text-slate-800 cursor-pointer">Allow Factory direct QR Code Bank transfers</label>
                  </div>
                  <span className="text-[9px] uppercase font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">Local Transfers</span>
                </div>
                <p className="text-[10.5px] text-slate-550 leading-relaxed pl-7 text-slate-500">Buyers scan UPI QR codes or Bank account codes at checkout and submit transaction screenshot proofs for Admin audit.</p>
                
                {prefs.qrEnabled && (
                  <div className="grid grid-cols-2 gap-4 pl-7 text-[10px] font-semibold text-slate-650 bg-slate-50 p-3 rounded-lg border">
                    <div className="space-y-1 text-center">
                      <span className="uppercase text-indigo-600 tracking-wider font-extrabold block mb-1">UPI Pay QR Proof</span>
                      {prefs.upiQrCode ? (
                        <img src={prefs.upiQrCode} className="w-16 h-16 mx-auto object-contain border bg-white rounded" alt="UPI" />
                      ) : (
                        <div className="w-16 h-16 bg-slate-205 border border-dashed rounded flex justify-center items-center text-slate-400 mx-auto">No QR</div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleQrUpload('upiQrCode', e)} 
                        className="block w-full mt-1 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[8px] file:bg-slate-200 file:text-slate-700 cursor-pointer text-[8px]" 
                      />
                    </div>

                    <div className="space-y-1 text-center">
                      <span className="uppercase text-indigo-650 tracking-wider font-extrabold block mb-1">Bank settlement QR</span>
                      {prefs.bankQrCode ? (
                        <img src={prefs.bankQrCode} className="w-16 h-16 mx-auto object-contain border bg-white rounded" alt="Bank QR" />
                      ) : (
                        <div className="w-16 h-16 bg-slate-205 border border-dashed rounded flex justify-center items-center text-slate-400 mx-auto">No QR</div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleQrUpload('bankQrCode', e)} 
                        className="block w-full mt-1 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[8px] file:bg-slate-200 file:text-slate-700 cursor-pointer text-[8px]" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Option Razorpay Merchant */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input 
                      type="checkbox" 
                      id="rzpToggle" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 cursor-pointer" 
                      checked={prefs.razorpayEnabled} 
                      onChange={e => handlePaymentPrefChange('razorpayEnabled', e.target.checked)} 
                    />
                    <label htmlFor="rzpToggle" className="text-xs font-bold text-slate-800 cursor-pointer">Enable Razorpay Merchant Checkout API</label>
                  </div>
                  <span className="text-[9px] uppercase font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Razorpay Link Gateway</span>
                </div>
                <p className="text-[10.5px] text-slate-550 leading-relaxed pl-7 text-slate-500">Automated instant checkout routing using Razorpay payment links. Clears status automatically on verification.</p>
                
                {prefs.razorpayEnabled && (
                  <div className="pl-7 space-y-3 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-550 uppercase tracking-wider block">Razorpay Merchant KEY ID</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Key className="w-3.5 h-3.5" /></span>
                        <input type="text" className="w-full border border-slate-250 rounded-lg py-1.5 pl-9 pr-3 text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-500 text-xs font-mono" value={prefs.razorpayKeyId || ''} onChange={e => handlePaymentPrefChange('razorpayKeyId', e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-550 uppercase tracking-wider block">Razorpay Gateway API SECRET</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Sliders className="w-3.5 h-3.5" /></span>
                        <input type="password" placeholder="••••••••••••••••••••••••" className="w-full border border-slate-250 rounded-lg py-1.5 pl-9 pr-3 text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-500 text-xs font-mono" value={prefs.razorpaySecret || ''} onChange={e => handlePaymentPrefChange('razorpaySecret', e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-550 uppercase tracking-wider block">Settlement Bank Account details info</label>
                      <input type="text" placeholder="e.g. Current Account Details" className="w-full border border-slate-250 rounded-lg py-1.5 px-3 text-slate-900 bg-slate-50 focus:outline-none focus:border-indigo-500" value={prefs.razorpayAccountDetails || ''} onChange={e => handlePaymentPrefChange('razorpayAccountDetails', e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
