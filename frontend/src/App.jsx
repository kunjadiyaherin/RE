import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  MapPin, 
  CircleDollarSign, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  Grid3X3, 
  Bookmark, 
  Settings, 
  LayoutDashboard,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import OverviewTab from './pages/OverviewTab';
import RERATab from './pages/RERATab';
import BuildersTab from './pages/BuildersTab';
import CircleRatesTab from './pages/CircleRatesTab';
import GrowthTab from './pages/GrowthTab';
import HistoricalTab from './pages/HistoricalTab';
import ForecastTab from './pages/ForecastTab';
import ComparisonTab from './pages/ComparisonTab';
import FraudTab from './pages/FraudTab';
import WatchlistTab from './pages/WatchlistTab';
import AdminTab from './pages/AdminTab';
import SettingsTab from './pages/SettingsTab';
import GuidanceTab from './pages/GuidanceTab';
import { apiService } from './apiService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(null);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const effectiveTheme = user ? theme : 'light';
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme, user]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState('login'); // 'login', 'register', 'otp'
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState('investor');
  const [otpCode, setOtpCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Initial Auth Check
  useEffect(() => {
    async function checkAuth() {
      const startTime = Date.now();
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await apiService.getMe();
          setUser(profile);
        } catch (err) {
          console.warn('[App Auth] Session token is invalid or expired:', err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
        }
      }
      // Force minimum loader duration of 1200ms for premium experience
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, 1200 - elapsed);
      setTimeout(() => {
        setAppLoading(false);
      }, delay);
    }
    checkAuth();
  }, []);

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await apiService.login(authEmail, authPassword);
      setUser(res.user);
      setShowAuthModal(false);
      setAuthPassword('');
    } catch (err) {
      if (err.unverified) {
        setAuthEmail(err.email);
        setAuthStep('otp');
        setAuthSuccess('Account verification pending. A secure OTP was dispatched to your email.');
      } else {
        setAuthError(err.message || 'Login failed. Please verify credentials.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await apiService.register(authUsername, authEmail, authPassword, authRole);
      setAuthStep('otp');
      setAuthSuccess(res.message || 'Registration successful. A secure verification OTP was dispatched.');
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await apiService.verifyOtp(authEmail, otpCode);
      setUser(res.user);
      setShowAuthModal(false);
      setOtpCode('');
      setAuthStep('login');
    } catch (err) {
      setAuthError(err.message || 'Verification failed.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await apiService.resendOtp(authEmail);
      setAuthSuccess(res.message || 'Verification code resent.');
    } catch (err) {
      setAuthError(err.message || 'Failed to resend code.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await apiService.forgotPassword(authEmail);
      setAuthStep('reset');
      setAuthSuccess(res.message || 'Password reset code sent to your email address.');
    } catch (err) {
      setAuthError(err.message || 'Failed to send reset code.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await apiService.resetPassword(authEmail, resetCode, newPassword);
      setAuthStep('login');
      setAuthSuccess(res.message || 'Password reset successfully. Please log in.');
      setResetCode('');
      setNewPassword('');
    } catch (err) {
      setAuthError(err.message || 'Password reset failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'rera', label: 'RERA Legitimacy', icon: ShieldCheck },
    { id: 'builders', label: 'Builder Reputation', icon: Users },
    { id: 'circle_rates', label: 'Circle Rate Analyzer', icon: CircleDollarSign },
    { id: 'growth', label: 'Area Growth Score', icon: TrendingUp },
    { id: 'historical', label: 'Historical Trends', icon: Grid3X3 },
    { id: 'forecast', label: 'AI Price Forecast', icon: Sparkles },
    { id: 'comparison', label: 'Compare Cities', icon: Grid3X3 },
    { id: 'fraud', label: 'Fraud Detection Panel', icon: AlertTriangle },
    { id: 'watchlist', label: 'Investor Watchlist', icon: Bookmark },
    { id: 'guidance', label: 'Real Estate Guidance', icon: BookOpen },
    { id: 'settings', label: 'Account & Settings', icon: Settings },
    { id: 'admin', label: 'Admin Control Console', icon: ShieldCheck }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.id === 'admin') {
      return user && user.role === 'admin';
    }
    return true;
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OverviewTab setActiveTab={setActiveTab} />;
      case 'rera':
        return <RERATab />;
      case 'builders':
        return <BuildersTab />;
      case 'circle_rates':
        return <CircleRatesTab />;
      case 'growth':
        return <GrowthTab />;
      case 'historical':
        return <HistoricalTab />;
      case 'forecast':
        return <ForecastTab />;
      case 'comparison':
        return <ComparisonTab />;
      case 'fraud':
        return <FraudTab />;
      case 'watchlist':
        return <WatchlistTab />;
      case 'guidance':
        return <GuidanceTab />;
      case 'settings':
        return <SettingsTab onLogout={handleLogout} currentUser={user} theme={theme} toggleTheme={toggleTheme} />;
      case 'admin':
        if (user && user.role === 'admin') {
          return <AdminTab />;
        }
        return <OverviewTab setActiveTab={setActiveTab} />;
      default:
        return <OverviewTab setActiveTab={setActiveTab} />;
    }
  };

  if (appLoading) {
    return (
      <div class="min-h-screen bg-[#090D16] flex flex-col items-center justify-center relative overflow-hidden font-sans">
        {/* Glowing background shapes */}
        <div class="absolute w-[350px] h-[350px] rounded-full bg-brand-accent/15 blur-[80px] -top-10 -left-10 animate-pulse-glowing"></div>
        <div class="absolute w-[250px] h-[250px] rounded-full bg-brand-accent/10 blur-[60px] -bottom-10 -right-10 animate-pulse-glowing"></div>
        
        {/* Animated logo/loader */}
        <div class="flex flex-col items-center gap-6 relative z-10">
          <div class="relative w-20 h-20 flex items-center justify-center">
            {/* Pulsing ring */}
            <div class="absolute inset-0 rounded-xl border border-brand-accent/30 animate-spin-slow"></div>
            {/* Glowing core */}
            <div class="w-14 h-14 rounded-lg bg-brand-panel border border-brand-border flex items-center justify-center shadow-2xl animate-pulse-glowing">
              <Sparkles class="w-7 h-7 text-brand-accent" />
            </div>
          </div>
          
          <div class="text-center space-y-2">
            <h2 class="text-lg font-extrabold tracking-wider text-brand-text uppercase">PROP-INTELLIGENCE</h2>
            <p class="text-[10px] text-brand-accent font-bold tracking-widest uppercase">Official Aggregator Node-01</p>
          </div>
          
          {/* Progress simulation */}
          <div class="w-48 space-y-2 pt-4">
            <div class="w-full bg-brand-border/40 rounded-full h-1 overflow-hidden">
              <div class="bg-brand-accent h-full w-2/3 rounded-full animate-pulse"></div>
            </div>
            <p class="text-[9px] text-brand-muted font-semibold text-center select-none animate-pulse">Synchronizing ledger caches...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div class="min-h-screen bg-gradient-auth flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background glow */}
        <div class="absolute w-[400px] h-[400px] rounded-full bg-brand-accent/10 blur-[100px] -top-20 -right-20"></div>
        <div class="absolute w-[450px] h-[450px] rounded-full bg-brand-accent/5 blur-[120px] -bottom-20 -left-20"></div>

        <div class="glass-panel w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 border-brand-border/80">
          
          {/* Left panel: Info & Branding */}
          <div class="hidden md:flex flex-col justify-between p-8 bg-brand-panel/40 border-r border-brand-border/50 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent pointer-events-none"></div>
            
            {/* Logo */}
            <div class="flex items-center gap-2.5 relative z-10">
              <img src="/logo.png" alt="Logo" class="w-7 h-7 object-contain rounded" />
              <div>
                <span class="font-extrabold text-sm tracking-wider text-brand-text">PROP-INTELLIGENCE</span>
                <span class="block text-[8px] text-brand-accent font-bold uppercase tracking-widest mt-0.5">Enterprise Portal</span>
              </div>
            </div>

            {/* Feature lists */}
            <div class="space-y-6 my-10 relative z-10">
              <div>
                <h3 class="text-sm font-bold text-brand-text flex items-center gap-2">
                  <ShieldCheck class="w-4 h-4 text-brand-accent" />
                  <span>RERA Registry Verification</span>
                </h3>
                <p class="text-[11px] text-brand-muted mt-1 leading-relaxed">Direct query access to Maharashtra and Gujarat real estate databases for delay risks and legal litigation tracking.</p>
              </div>

              <div>
                <h3 class="text-sm font-bold text-brand-text flex items-center gap-2">
                  <TrendingUp class="w-4 h-4 text-brand-accent" />
                  <span>Circle Rate & Price Analytics</span>
                </h3>
                <p class="text-[11px] text-brand-muted mt-1 leading-relaxed">Circle-to-market variance analysis, valuation modeling, and area-specific growth scoring metrics.</p>
              </div>

              <div>
                <h3 class="text-sm font-bold text-brand-text flex items-center gap-2">
                  <BookOpen class="w-4 h-4 text-brand-accent" />
                  <span>Interactive Compliance Guidance</span>
                </h3>
                <p class="text-[11px] text-brand-muted mt-1 leading-relaxed">Interactive roadmaps, verification checksheets, document vaults, and an AI regulatory advisor helper.</p>
              </div>
            </div>
          </div>

          {/* Right panel: Forms */}
          <div class="p-8 flex flex-col justify-center">
            
            {/* Mobile Branding */}
            <div class="flex items-center gap-2 mb-6 md:hidden">
              <img src="/logo.png" alt="Logo" class="w-7 h-7 object-contain rounded" />
              <span class="font-extrabold text-xs tracking-wider text-brand-text">PROP-INTELLIGENCE</span>
            </div>

            {authStep === 'otp' ? (
              <div class="space-y-4 animate-fade-in">
                <div class="space-y-1.5">
                  <h3 class="text-lg font-bold text-brand-text">Verify Your Email</h3>
                  <p class="text-xs text-brand-muted leading-relaxed">A secure 6-digit OTP code has been sent to <span class="text-brand-accent font-semibold">{authEmail}</span>. Enter it below to activate your account.</p>
                </div>

                <form onSubmit={handleVerifyOtp} class="space-y-4 pt-2">
                  <div>
                    <label class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1.5">Verification Code (OTP)</label>
                    <input 
                      type="text" 
                      maxLength="6"
                      required
                      placeholder="e.g. 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent text-center font-mono tracking-widest text-lg"
                    />
                  </div>

                  {authError && <p class="text-xs text-brand-danger font-semibold bg-brand-danger/10 p-2 rounded border border-brand-danger/20">{authError}</p>}
                  {authSuccess && <p class="text-xs text-brand-success font-semibold bg-brand-success/10 p-2 rounded border border-brand-success/20">{authSuccess}</p>}

                  <button
                    type="submit"
                    disabled={otpLoading}
                    class="w-full py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold rounded shadow transition-colors flex items-center justify-center gap-2"
                  >
                    {otpLoading && <RefreshCw class="w-4 h-4 animate-spin" />}
                    <span>Confirm & Activate</span>
                  </button>
                </form>

                <div class="flex items-center justify-between text-xs pt-2">
                  <button 
                    onClick={handleResendOtp}
                    class="text-brand-accent hover:underline font-semibold"
                  >
                    Resend Code
                  </button>
                  <button 
                    onClick={() => setAuthStep('login')}
                    class="text-brand-muted hover:text-brand-text font-semibold"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            ) : authStep === 'forgot' ? (
              <div class="space-y-4 animate-fade-in">
                <div class="space-y-1.5">
                  <h3 class="text-lg font-bold text-brand-text">Forgot Password</h3>
                  <p class="text-xs text-brand-muted leading-relaxed">Enter your registered email address below. We will send a secure 6-digit reset code to your email.</p>
                </div>

                <form onSubmit={handleForgotPassword} class="space-y-4 pt-2">
                  <div>
                    <label class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="your@email.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
                    />
                  </div>

                  {authError && <p class="text-xs text-brand-danger font-semibold bg-brand-danger/10 p-2 rounded border border-brand-danger/20">{authError}</p>}
                  {authSuccess && <p class="text-xs text-brand-success font-semibold bg-brand-success/10 p-2 rounded border border-brand-success/20">{authSuccess}</p>}

                  <button
                    type="submit"
                    disabled={authLoading}
                    class="w-full py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold rounded shadow transition-colors flex items-center justify-center gap-2"
                  >
                    {authLoading && <RefreshCw class="w-4 h-4 animate-spin" />}
                    <span>Send Reset Code</span>
                  </button>
                </form>

                <div class="text-center pt-2">
                  <button 
                    onClick={() => { setAuthStep('login'); setAuthError(''); setAuthSuccess(''); }}
                    class="text-xs text-brand-muted hover:text-brand-text font-semibold"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            ) : authStep === 'reset' ? (
              <div class="space-y-4 animate-fade-in">
                <div class="space-y-1.5">
                  <h3 class="text-lg font-bold text-brand-text">Reset Password</h3>
                  <p class="text-xs text-brand-muted leading-relaxed">Enter the 6-digit reset code sent to your email along with your new password.</p>
                </div>

                <form onSubmit={handleResetPassword} class="space-y-4 pt-2">
                  <div>
                    <label class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="your@email.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1.5">Reset Code (6 Digits)</label>
                    <input 
                      type="text" 
                      maxLength="6"
                      required
                      placeholder="e.g. 123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                      class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent text-center font-mono tracking-widest"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1.5">New Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
                    />
                  </div>

                  {authError && <p class="text-xs text-brand-danger font-semibold bg-brand-danger/10 p-2 rounded border border-brand-danger/20">{authError}</p>}
                  {authSuccess && <p class="text-xs text-brand-success font-semibold bg-brand-success/10 p-2 rounded border border-brand-success/20">{authSuccess}</p>}

                  <button
                    type="submit"
                    disabled={authLoading}
                    class="w-full py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold rounded shadow transition-colors flex items-center justify-center gap-2"
                  >
                    {authLoading && <RefreshCw class="w-4 h-4 animate-spin" />}
                    <span>Reset Password</span>
                  </button>
                </form>

                <div class="text-center pt-2">
                  <button 
                    onClick={() => { setAuthStep('login'); setAuthError(''); setAuthSuccess(''); }}
                    class="text-xs text-brand-muted hover:text-brand-text font-semibold"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <div class="space-y-5 animate-fade-in">
                {/* Tabs */}
                <div class="flex border-b border-brand-border">
                  <button
                    onClick={() => { setAuthStep('login'); setAuthError(''); setAuthSuccess(''); }}
                    class={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
                      authStep === 'login' ? 'border-brand-accent text-brand-text' : 'border-transparent text-brand-muted hover:text-brand-text'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthStep('register'); setAuthError(''); setAuthSuccess(''); }}
                    class={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
                      authStep === 'register' ? 'border-brand-accent text-brand-text' : 'border-transparent text-brand-muted hover:text-brand-text'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {authStep === 'login' ? (
                  <form onSubmit={handleLogin} class="space-y-4 pt-2">
                    <div>
                      <label class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="your@email.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-1.5">
                        <label class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider">Password</label>
                        <button 
                          type="button"
                          onClick={() => { setAuthStep('forgot'); setAuthError(''); setAuthSuccess(''); }}
                          class="text-[10px] text-brand-accent hover:underline font-semibold"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
                      />
                    </div>

                    {authError && <p class="text-xs text-brand-danger font-semibold bg-brand-danger/10 p-2 rounded border border-brand-danger/20">{authError}</p>}
                    {authSuccess && <p class="text-xs text-brand-success font-semibold bg-brand-success/10 p-2 rounded border border-brand-success/20">{authSuccess}</p>}

                    <button
                      type="submit"
                      disabled={authLoading}
                      class="w-full py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold rounded shadow transition-colors flex items-center justify-center gap-2"
                    >
                      {authLoading && <RefreshCw class="w-4 h-4 animate-spin" />}
                      <span>Sign In</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} class="space-y-4 pt-2">
                    <div>
                      <label class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1.5">Username</label>
                      <input 
                        type="text" 
                        required
                        placeholder="john_doe"
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="your@email.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1.5">Password</label>
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                    <div>
                      <label class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-1.5">User Role</label>
                      <select
                        value={authRole}
                        onChange={(e) => setAuthRole(e.target.value)}
                        class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer"
                      >
                        <option value="investor">Institutional Investor</option>
                        <option value="analyst">Market Analyst</option>
                        <option value="developer">Property Developer</option>
                        <option value="admin">Platform Administrator (Audit)</option>
                      </select>
                    </div>

                    {authError && <p class="text-xs text-brand-danger font-semibold bg-brand-danger/10 p-2 rounded border border-brand-danger/20">{authError}</p>}

                    <button
                      type="submit"
                      disabled={authLoading}
                      class="w-full py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold rounded shadow transition-colors flex items-center justify-center gap-2"
                    >
                      {authLoading && <RefreshCw class="w-4 h-4 animate-spin" />}
                      <span>Create Account</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-brand-bg text-brand-text flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          class="fixed inset-0 bg-black/60 z-40 lg:hidden"
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside class={`fixed inset-y-0 left-0 bg-brand-panel border-r border-brand-border w-64 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-0'
      } lg:translate-x-0 transition-transform duration-200 ease-in-out z-50 lg:static flex flex-col`}>
        
        {/* Sidebar Header */}
        <div class="h-16 border-b border-brand-border flex items-center justify-between px-5 shrink-0">
          <div class="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" class="w-7 h-7 object-contain rounded" />
            <div>
              <span class="font-extrabold text-sm tracking-wider text-brand-text">PROP-INTELLIGENCE</span>
              <span class="block text-[8px] text-brand-accent font-bold uppercase tracking-widest mt-0.5">Enterprise Portal</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            class="text-brand-muted hover:text-brand-text lg:hidden"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1 select-none">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                class={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-brand-accent text-white shadow-sm' 
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-border/40'
                }`}
              >
                <Icon class="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div class="p-4 border-t border-brand-border bg-brand-bg/40 text-[10px] text-brand-muted space-y-1 select-none shrink-0">
          <p class="font-semibold text-brand-text">Registered Data Node: INDIA-01</p>
          <p>Index status: Sync Operational</p>
        </div>
      </aside>

      {/* Main Container */}
      <div class="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Utilities */}
        <header class="h-16 bg-brand-panel border-b border-brand-border flex items-center justify-between px-6 shrink-0 relative z-30">
          
          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setSidebarOpen(true)}
            class="text-brand-muted hover:text-brand-text lg:hidden"
          >
            <Menu class="w-6 h-6" />
          </button>

          {/* Institutional Brand Title */}
          <div class="hidden lg:flex items-center gap-2 text-xs font-semibold text-brand-muted uppercase tracking-wider">
            <span>Official Records Aggregate Portal</span>
            <span>•</span>
            <span class="text-brand-accent">Gujarat & Maharashtra Indexes Active</span>
          </div>

          {/* User profile & Alerts */}
          <div class="flex items-center gap-4 ml-auto">
            {/* Theme Toggler */}
            <button 
              onClick={toggleTheme}
              class="p-2 text-brand-muted hover:text-brand-text hover:bg-brand-border/50 rounded transition-colors"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <Sun class="w-4 h-4" /> : <Moon class="w-4 h-4" />}
            </button>

            {/* Notifications trigger */}
            <div class="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setUnreadNotifications(0);
                }}
                class="p-2 text-brand-muted hover:text-brand-text hover:bg-brand-border/50 rounded relative transition-colors"
              >
                <Bell class="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span class="absolute top-1 right-1 w-2 h-2 bg-brand-danger rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div class="absolute right-0 mt-2 w-80 bg-brand-panel border border-brand-border rounded shadow-xl py-2 z-50">
                  <div class="px-4 py-2 border-b border-brand-border flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-brand-text">Recent Sync Activity</span>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      class="text-[9px] text-brand-muted hover:text-brand-text uppercase font-semibold"
                    >
                      Close
                    </button>
                  </div>
                  <div class="max-h-60 overflow-y-auto text-xs divide-y divide-brand-border/40">
                    <div class="p-3 bg-brand-bg/40">
                      <p class="font-semibold text-brand-text">MahaRERA Project Sync Completed</p>
                      <p class="text-[10px] text-brand-muted mt-1 leading-relaxed">MahaRERA project crawler synchronized 42 new construction submissions in Lower Parel.</p>
                      <span class="text-[8px] text-brand-accent block mt-1">10 mins ago</span>
                    </div>
                    <div class="p-3 bg-brand-bg/40">
                      <p class="font-semibold text-brand-text">Circle Rate Deviation Warning</p>
                      <p class="text-[10px] text-brand-muted mt-1 leading-relaxed">Transaction deed MUM/LP/2025/1102 flagged with -35.48% variance below circle rate limit.</p>
                      <span class="text-[8px] text-brand-danger block mt-1">4 hours ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile badge */}
            <div 
              onClick={() => setActiveTab('settings')}
              class="flex items-center gap-2 border-l border-brand-border pl-4 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div class="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-xs font-bold text-white select-none">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div class="hidden md:block select-none">
                <span class="block text-xs font-bold text-brand-text">{user.username}</span>
                <span class="block text-[9px] text-brand-muted uppercase font-semibold mt-0.2">Role: {user.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Work Panel with page-transition fade animation */}
        <main class="flex-1 overflow-y-auto p-6 md:p-8">
          <div key={activeTab} class="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
