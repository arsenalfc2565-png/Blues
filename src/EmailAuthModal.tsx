import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Store,
  MapPin,
  Check,
  AlertCircle,
  ArrowRight,
  LogIn,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import {
  CustomerUser,
  registerDirectAccount,
  loginWithDirectAccount,
  getRegisteredAccounts,
  loginWithGoogleAccount,
} from '../utils/customerAuth';
import { Z_INDEX } from '../constants/zIndex';

export interface EmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: CustomerUser) => void;
  initialMode?: 'login' | 'register' | 'forgot';
  onSwitchToGoogle?: () => void;
  currentUser?: CustomerUser;
}

export const EmailAuthModal: React.FC<EmailAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  onSwitchToGoogle,
  currentUser,
}) => {
  // Navigation mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // --- LOGIN FORM STATE ---
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // --- REGISTRATION FORM STATE ---
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShopName, setRegShopName] = useState('');
  const [regTown, setRegTown] = useState('Eldoret');
  const [regStage, setRegStage] = useState('Main Bus Stage (Guardian Angel)');
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);

  // --- FORGOT PASSWORD STATE ---
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<'input' | 'sent'>('input');
  const [resetPin, setResetPin] = useState('');

  // --- UI FEEDBACK STATES ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registeredAccounts = getRegisteredAccounts();

  if (!isOpen) return null;

  // Validate email address format
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // --- HANDLE REGISTRATION SUBMIT ---
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form Validations
    if (!regFullName.trim() || regFullName.trim().length < 2) {
      setErrorMessage('Please enter your full name or legal trading name.');
      return;
    }

    if (!regEmail.trim() || !isValidEmail(regEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. reseller@gmail.com).');
      return;
    }

    const cleanPhone = regPhone.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage('Please enter a valid Safaricom phone number (e.g. 0712345678).');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long for security.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password confirmation.');
      return;
    }

    if (!regAgreeTerms) {
      setErrorMessage('Please agree to the Blues Wholesale reseller terms to create an account.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = registerDirectAccount({
        name: regFullName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: cleanPhone,
        password: regPassword,
        businessName: regShopName.trim() || `${regFullName.trim().split(' ')[0]}'s Reseller Shop`,
        deliveryTown: regTown,
        deliveryStage: regStage,
      });

      setIsSubmitting(false);

      if (res.success && res.user) {
        setSuccessMessage('🎉 Account registered successfully! KSh 5,000 welcome credit deposited to your wallet.');
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || 'Failed to create account. Please check your credentials.');
      }
    }, 400);
  };

  // --- HANDLE LOGIN SUBMIT ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your email address or phone number.');
      return;
    }

    if (!loginPassword) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = loginWithDirectAccount(loginIdentifier, loginPassword);
      setIsSubmitting(false);

      if (res.success && res.user) {
        setSuccessMessage(`Welcome back, ${res.user.name.split(' ')[0]}!`);
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.error || 'Invalid email/phone or password. Please try again or reset your password.');
      }
    }, 400);
  };

  // --- HANDLE FORGOT PASSWORD ---
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setErrorMessage('Please enter your registered email or phone number.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      setResetPin(generatedPin);
      setForgotStep('sent');
      setSuccessMessage(`A temporary password reset code (${generatedPin}) has been sent to ${forgotIdentifier}!`);
    }, 500);
  };

  // --- QUICK DEMO ACCOUNT SELECTOR ---
  const handleSelectDemoAccount = (acc: CustomerUser) => {
    setErrorMessage(null);
    setLoginIdentifier(acc.email || acc.phone);
    setLoginPassword(acc.password || 'password123');
    const res = loginWithDirectAccount(acc.email || acc.phone, acc.password || 'password123');
    if (res.success && res.user) {
      setSuccessMessage(`Signed in as ${res.user.name}!`);
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 600);
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

          <div className="w-12 h-12 bg-blue-600 rounded-2xl shadow-md flex items-center justify-center mx-auto mb-3 text-white">
            {mode === 'register' ? (
              <UserPlus className="w-6 h-6" />
            ) : mode === 'forgot' ? (
              <KeyRound className="w-6 h-6" />
            ) : (
              <LogIn className="w-6 h-6" />
            )}
          </div>

          <h3 className="font-display font-extrabold text-xl text-neutral-900 dark:text-white">
            {mode === 'register'
              ? 'Create Reseller Account'
              : mode === 'forgot'
              ? 'Reset Account Password'
              : 'Sign In with Email / Password'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            {mode === 'register'
              ? 'Join Kenya’s premier wholesale footwear network with standard email & password.'
              : mode === 'forgot'
              ? 'Enter your registered email address or phone number to recover your password.'
              : 'Sign in directly with your email address or phone number as a backup to Google OAuth.'}
          </p>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-200 dark:bg-neutral-950 rounded-2xl mt-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-neutral-800 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In (Login)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-neutral-800 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account (Register)</span>
              </button>
            </div>
          )}
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
          {/* 1. REGISTRATION FORM (STANDARD EMAIL & PASSWORD SIGN UP)                  */}
          {/* ========================================================================= */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3 rounded-2xl border border-blue-200 dark:border-blue-800/60 flex items-center gap-2 text-blue-900 dark:text-blue-300 text-[11px]">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  <strong>Standard Registration:</strong> No Google account needed. Instant wallet setup with <strong>KSh 5,000</strong> welcome testing credit!
                </span>
              </div>

              {/* Full Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Full Legal / Business Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mary Wanjiku"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Safaricom Phone Number *
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

              {/* Email Address */}
              <div>
                <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. mary.wanjiku@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Password (Min 6 chars) *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Create a strong password"
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

                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-type password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Shop Trading Name & Preferred Town */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Boutique / Shop Name
                  </label>
                  <div className="relative">
                    <Store className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Wanjiku Classic Shoes"
                      value={regShopName}
                      onChange={(e) => setRegShopName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Delivery Destination Town
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <select
                      value={regTown}
                      onChange={(e) => setRegTown(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Eldoret">Eldoret (Uasin Gishu)</option>
                      <option value="Nakuru">Nakuru (Nakuru)</option>
                      <option value="Kisii">Kisii (Kisii)</option>
                      <option value="Kakamega">Kakamega (Kakamega)</option>
                      <option value="Kericho">Kericho (Kericho)</option>
                      <option value="Nairobi">Nairobi (CBD Central Depot)</option>
                      <option value="Mombasa">Mombasa (Coast)</option>
                      <option value="Kisumu">Kisumu (Bus Park Main Depot)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regAgreeTerms}
                  onChange={(e) => setRegAgreeTerms(e.target.checked)}
                  className="rounded text-blue-600 mt-0.5"
                />
                <span className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-tight">
                  I agree to Blues Wholesale Reseller Terms, including the 1:2:2:1 sizing balance rule and 4:00 PM bus dispatch parcel policies.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Register & Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Google OAuth Fallback / Switcher */}
              <div className="pt-2 text-center border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="text-[11px] text-neutral-500 block">Prefer Google OAuth?</span>
                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchToGoogle) {
                      onSwitchToGoogle();
                    } else {
                      const user = loginWithGoogleAccount('seapower2565@gmail.com', 'Brian Otieno');
                      onSuccess(user);
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.28-2.09 3.66-5.17 3.66-9.14z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.41l4.03-3.13z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"/>
                  </svg>
                  <span>Sign Up with Google Instead</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 2. LOGIN FORM (STANDARD EMAIL & PASSWORD SIGN IN)                         */}
          {/* ========================================================================= */}
          {mode === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Email Address or Phone Number *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. mary@gmail.com or 0712345678"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setForgotIdentifier(loginIdentifier);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-neutral-600 dark:text-neutral-400 text-xs">Remember this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-2xl bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In with Password</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Reseller Switcher */}
              {registeredAccounts.length > 0 && (
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    Quick Sign-In (Demo Reseller Accounts):
                  </span>
                  <div className="space-y-1.5">
                    {registeredAccounts.slice(0, 2).map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleSelectDemoAccount(acc)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-blue-50/40 dark:hover:bg-blue-950/40 flex items-center justify-between transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                            {acc.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-neutral-900 dark:text-white text-xs block leading-tight">
                              {acc.name}
                            </strong>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                              {acc.email || acc.phone}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          KSh {acc.walletBalance.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Google OAuth Fallback / Switcher */}
              <div className="pt-2 text-center border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                <span className="text-[11px] text-neutral-500 block">Or use 1-click login:</span>
                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchToGoogle) {
                      onSwitchToGoogle();
                    } else {
                      const user = loginWithGoogleAccount('seapower2565@gmail.com', 'Brian Otieno');
                      onSuccess(user);
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.28-2.09 3.66-5.17 3.66-9.14z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.41l4.03-3.13z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"/>
                  </svg>
                  <span>Sign In with Google</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. FORGOT PASSWORD FLOW                                                  */}
          {/* ========================================================================= */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Registered Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Enter registered email or phone"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {forgotStep === 'sent' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 space-y-2 text-[11px] text-emerald-900 dark:text-emerald-300">
                    <span className="font-bold block text-xs">Reset Code Generated:</span>
                    <p>
                      Your temporary 6-digit recovery code is <strong className="font-mono text-sm">{resetPin}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setLoginIdentifier(forgotIdentifier);
                        setLoginPassword('password123');
                        setSuccessMessage('Password reset complete. You may now sign in!');
                      }}
                      className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 cursor-pointer"
                    >
                      Auto-Fill & Sign In
                    </button>
                  </div>
                )}

                {forgotStep === 'input' && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Send Password Reset Link</span>
                  </button>
                )}

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
