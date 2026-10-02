import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Check,
  ShieldCheck,
  Wallet,
  Package,
  ArrowRight,
  UserCheck,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  MapPin,
  Sparkles,
  AlertCircle,
  LogIn,
  UserPlus
} from 'lucide-react';
import {
  CustomerUser,
  loginWithGoogleAccount,
  registerDirectAccount,
  loginWithDirectAccount,
  getRegisteredAccounts,
  logoutCustomerAccount,
    fileToAvatarDataUrl,
} from '../utils/customerAuth';
import { Z_INDEX } from '../constants/zIndex';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: CustomerUser) => void;
  currentUser?: CustomerUser;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) => {
  // Auth Mode: 'register' | 'login' | 'google'
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'google'>('register');

  // Registration form fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regDeliveryTown, setRegDeliveryTown] = useState('Eldoret');
  const [regDeliveryStage, setRegDeliveryStage] = useState('Main Bus Stage (Guardian Angel)');
  const [regAvatar, setRegAvatar] = useState('');

  // Login form fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Google flow fields
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [isCustomGoogle, setIsCustomGoogle] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const registeredAccounts = getRegisteredAccounts();

  if (!isOpen) return null;

  const handleRegisterDirect = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name or business owner name.');
      return;
    }

    if (!regPhone.trim() || regPhone.replace(/\s+/g, '').length < 9) {
      setErrorMessage('Please enter a valid Safaricom phone number (e.g., 0712345678).');
      return;
    }

    const res = registerDirectAccount({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword || 'password123',
      businessName: regBusinessName,
      deliveryTown: regDeliveryTown,
      deliveryStage: regDeliveryStage,
      avatarUrl: regAvatar,
    });

    if (res.success && res.user) {
      setSuccessMessage('🎉 Account created successfully!');
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 1000);
    } else {
      setErrorMessage(res.error || 'Failed to create account. Please try again.');
    }
  };

  const handleLoginDirect = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your email address or phone number.');
      return;
    }

    const res = loginWithDirectAccount(loginIdentifier, loginPassword);
    if (res.success && res.user) {
      setSuccessMessage(`Welcome back, ${res.user.name.split(' ')[0]}!`);
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 800);
    } else {
      setErrorMessage(res.error || 'Invalid credentials.');
    }
  };

  const handleGoogleSignIn = (email: string, name: string) => {
    setErrorMessage(null);
    const user = loginWithGoogleAccount(email, name);
    setSuccessMessage(`Signed in as ${name}!`);
    setTimeout(() => {
      onSuccess(user);
      onClose();
    }, 600);
  };

  const handleSelectPreloadedAccount = (account: CustomerUser) => {
    setErrorMessage(null);
    setLoginIdentifier(account.phone || account.email);
    setLoginPassword(account.password || 'password123');
    const res = loginWithDirectAccount(account.phone || account.email, account.password);
    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className={`fixed inset-0 ${Z_INDEX.MODAL} overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-3xl max-w-lg w-full border border-neutral-300 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-6 text-center border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/50 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-blue-600 dark:bg-blue-600 rounded-2xl shadow-md flex items-center justify-center mx-auto mb-3 text-white">
            <Store className="w-6 h-6" />
          </div>

          <h3 className="font-display font-extrabold text-xl text-neutral-900 dark:text-white">
            Blues Reseller Account
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            Create an account directly or sign in to access <strong>My Orders</strong>, live bus tracking, and <strong>Blues Account Wallet</strong>.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-200 dark:bg-neutral-950 rounded-2xl mt-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white dark:bg-neutral-800 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white dark:bg-neutral-800 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('google');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'google'
                  ? 'bg-white dark:bg-neutral-800 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.28-2.09 3.66-5.17 3.66-9.14z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.41l4.03-3.13z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"/>
              </svg>
              <span>Google</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs max-h-[65vh] overflow-y-auto">
          {/* ========================================================================= */}
          {/* TAB 1: DIRECT ACCOUNT CREATION (NO GOOGLE REQUIRED)                       */}
          {/* ========================================================================= */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterDirect} className="space-y-3.5">
              <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3 rounded-2xl border border-blue-200 dark:border-blue-800/60 flex items-center justify-between text-blue-900 dark:text-blue-300 text-[11px]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>
                    <strong>Direct Sign Up:</strong> Instant, free account creation without Google.
                  </span>
                </div>
              </div>

              {/* Full Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mary Wanjiku"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Phone / M-Pesa Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0712345678"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="e.g. mary@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter a secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Shop Name & Preferred Town */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Boutique / Shop Trading Name
                  </label>
                  <div className="relative">
                    <Store className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Wanjiku Classic Shoes"
                      value={regBusinessName}
                      onChange={(e) => setRegBusinessName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Preferred Delivery County/Town
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <select
                      value={regDeliveryTown}
                      onChange={(e) => setRegDeliveryTown(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Eldoret">Eldoret (Uasin Gishu)</option>
                      <option value="Nakuru">Nakuru (Nakuru)</option>
                      <option value="Kisii">Kisii (Kisii)</option>
                      <option value="Kakamega">Kakamega (Kakamega)</option>
                      <option value="Kericho">Kericho (Kericho)</option>
                      <option value="Nairobi">Nairobi (CBD Depot)</option>
                      <option value="Mombasa">Mombasa (Coast)</option>
                      <option value="Kisumu">Kisumu (Depot Pickup)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Profile Photo (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) setRegAvatar(await fileToAvatarDataUrl(f));
                  }}
                  className="w-full text-xs text-neutral-600 dark:text-neutral-300"
                />
                {regAvatar && (
                  <img src={regAvatar} alt="Preview" className="w-14 h-14 rounded-full object-cover mt-2 border border-neutral-300" />
                )}
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer mt-2"
              >
                <span>Create Reseller Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: DIRECT SIGN IN WITH PASSWORD / PHONE                               */}
          {/* ========================================================================= */}
          {authMode === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLoginDirect} className="space-y-3.5">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Email Address or Phone Number *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Enter registered email or phone"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Password (Optional if demo account)
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Account</span>
                </button>
              </form>


              <div className="text-center pt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Create one in 10 seconds
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: FAST GOOGLE 1-CLICK AUTH                                           */}
          {/* ========================================================================= */}
          {authMode === 'google' && (
            <div className="space-y-4">
              {/* Switch Account Option */}
              {!isCustomGoogle ? (
                <button
                  type="button"
                  onClick={() => setIsCustomGoogle(true)}
                  className="w-full text-center text-xs text-neutral-500 hover:text-blue-700 dark:hover:text-blue-400 font-semibold cursor-pointer pt-1"
                >
                  Sign in with another Google email
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2 bg-neutral-50 dark:bg-neutral-800/50">
                  <span className="font-bold text-neutral-900 dark:text-white block">Use Custom Google Account</span>
                  <input
                    type="text"
                    placeholder="Full Name (e.g. Mary Atieno)"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-xl text-xs text-neutral-900 dark:text-white"
                  />
                  <input
                    type="email"
                    placeholder="Google Email (e.g. mary@gmail.com)"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-xl text-xs text-neutral-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn(googleEmail || 'reseller@gmail.com', googleName || 'Reseller')}
                    className="w-full py-2 bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Sign In with this Google Account
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Continue without an account
          </button>
          {/* Account Benefits Footer Card */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 space-y-2 text-[11px] text-neutral-600 dark:text-neutral-400">
            <span className="font-bold text-neutral-900 dark:text-white block text-xs">
              Reseller Account Privileges:
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>"My Orders" Hub:</strong> Track parcels live on Guardian Angel & EasyCoach buses.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Cancel & Refund:</strong> Change destination stage or cancel with instant wallet credit.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Blues Wallet:</strong> Load funds and pay without waiting for M-Pesa STK prompts!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
