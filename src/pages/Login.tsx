import React, { useState } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Server,
  ArrowRight,
  ShieldCheck,
  Key,
  Copy,
  Check,
  X,
  FileText,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Institutional Demo Accounts - Preserved with exact credentials
const DEMO_ACCOUNTS = [
  {
    role: 'Lead Forensic Investigator',
    roleTag: 'INVESTIGATOR',
    tagColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    name: 'Vikram Sengupta',
    department: 'Financial Cybercrime Investigation Wing',
    accountNumber: 'DEMO200001',
    aadhaarNumber: 'XXXX-XXXX-2001',
    password: 'Demo@123',
    description: 'Lead forensic officer managing transaction anomalies, case dossiers, and mule account networks.'
  },
  {
    role: 'Senior Supervisory Officer',
    roleTag: 'SENIOR_INVESTIGATOR',
    tagColor: 'bg-teal-950 text-teal-300 border-teal-800',
    name: 'Dr. Priya Nambiar',
    department: 'Special Anti-Syndicate Directorate',
    accountNumber: 'DEMO300001',
    aadhaarNumber: 'XXXX-XXXX-3001',
    password: 'Demo@123',
    description: 'Senior review officer with statutory authorization for emergency account shadow freezes.'
  },
  {
    role: 'Platform Root Administrator',
    roleTag: 'ADMIN',
    tagColor: 'bg-purple-950 text-purple-300 border-purple-800',
    name: 'Rajeshwer Mehra',
    department: 'Security Operations & Governance',
    accountNumber: 'DEMO900001',
    aadhaarNumber: 'XXXX-XXXX-9001',
    password: 'Demo@123',
    description: 'System governance officer overseeing risk scoring thresholds, audit trails, and access logs.'
  },
  {
    role: 'Citizen Consumer',
    roleTag: 'CITIZEN',
    tagColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    name: 'Aarav Patel',
    department: 'Citizen Grievance & Dispute Redressal',
    accountNumber: 'DEMO100001',
    aadhaarNumber: 'XXXX-XXXX-1001',
    password: 'Demo@123',
    description: 'Verified citizen tracking account security posture and filing cyber financial fraud disputes.'
  }
];

export default function Login() {
  const { login, register, forgotPassword, health, checkHealth } = useAuth() as any;

  // Form states
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Demo accounts modal state
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Tab: login vs signup vs forgot
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');

  // Sign up state
  const [signupForm, setSignupForm] = useState({
    name: '',
    accountNumber: '',
    aadhaarNumber: '',
    password: '',
    confirmPassword: '',
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleQuickFill = (idVal: string, pwdVal: string) => {
    setIdentity(idVal);
    setPassword(pwdVal);
    setErrorMessage(null);
    setActiveTab('LOGIN');
    setDemoModalOpen(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identity.trim()) {
      setErrorMessage('Please enter your account number or Aadhaar number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(identity.trim(), password);
      if (!res.success) {
        setErrorMessage(res.message || 'Invalid account/Aadhaar number or password.');
      } else {
        setSuccessMessage(`Authentication successful. Redirecting to ${res.role} workspace...`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signupForm.name || !signupForm.accountNumber || !signupForm.aadhaarNumber || !signupForm.password) {
      setErrorMessage('Please complete all registration fields.');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(signupForm);
      if (!res.success) {
        setErrorMessage(res.message || 'Registration failed.');
      } else {
        setSuccessMessage('Demo citizen account created successfully! Access granted.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to register demo user.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identity.trim()) {
      setErrorMessage('Please enter your account number or Aadhaar number to reset password.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(identity);
      setSuccessMessage(res.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] flex flex-col justify-between selection:bg-emerald-900 selection:text-emerald-200">
      {/* Top security header bar */}
      <div className="border-b border-zinc-900 bg-[#0a0a0a]/80 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center border border-emerald-500/30">
            <Shield className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-zinc-200">
              Real-Time Fraud Intelligence &amp; Investigation Platform
            </div>
            <div className="text-[10px] text-zinc-400">
              Department of Financial Crime Surveillance &bull; Restricted Portal
            </div>
          </div>
        </div>

        {/* Header Right: Backend health badge + Discreet Demo Key Access */}
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setDemoModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            title="Authorized Demo Credentials Reference"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Demo Access Key</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#111111] border border-zinc-800">
            <span className={`w-2 h-2 rounded-full ${health.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-zinc-400 text-[11px]">Server:</span>
            <span className={health.connected ? 'text-emerald-400 font-mono text-[11px] font-semibold' : 'text-red-400 font-mono text-[11px]'}>
              {health.connected ? 'Online' : 'Offline'}
            </span>
          </div>
          <button
            onClick={() => checkHealth()}
            className="text-[11px] text-zinc-400 hover:text-emerald-400 underline underline-offset-2"
          >
            Check Status
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Login Card */}
          <div className="lg:col-span-7 bg-[#111111] border border-zinc-800/90 rounded-xl p-8 shadow-2xl shadow-black/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-zinc-100 uppercase">
                    Secure Portal Login
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Authorized investigative staff and citizen account access
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 font-mono uppercase tracking-wider">
                  TLS 1.3 Active
                </span>
              </div>

              {/* Navigation tabs: Login / Sign Up */}
              <div className="flex gap-2 p-1 bg-[#181818] rounded-lg border border-zinc-800/80 mb-6 text-xs">
                <button
                  type="button"
                  onClick={() => { setActiveTab('LOGIN'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`flex-1 py-1.5 font-medium rounded-md transition-all ${
                    activeTab === 'LOGIN' ? 'bg-[#222222] text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('SIGNUP'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`flex-1 py-1.5 font-medium rounded-md transition-all ${
                    activeTab === 'SIGNUP' ? 'bg-[#222222] text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Sign Up (Citizen Demo)
                </button>
              </div>

              {/* Feedback Alert */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-900/80 text-red-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/80 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* TAB 1: LOGIN FORM */}
              {activeTab === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Single Identity input: Account Number OR Aadhaar Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Account Number or Aadhaar Number</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Enter either identifier</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={identity}
                        onChange={(e) => setIdentity(e.target.value)}
                        placeholder="Enter account number or Aadhaar number"
                        disabled={loading}
                        className="w-full pl-9 pr-3 py-2.5 bg-[#181818] border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Password input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Password</span>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('FORGOT'); setErrorMessage(null); setSuccessMessage(null); }}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                      >
                        Forgot Password?
                      </button>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        disabled={loading}
                        className="w-full pl-9 pr-10 py-2.5 bg-[#181818] border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Options: Remember me & discreet evaluator helper link */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Remember Me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setDemoModalOpen(true)}
                      className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      <Key className="w-3 h-3 text-emerald-500" />
                      <span>Demo Access Key</span>
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs tracking-wide uppercase rounded-lg shadow-lg shadow-emerald-950/60 border border-emerald-400/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: SIGN UP FORM */}
              {activeTab === 'SIGNUP' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Full Legal Name</label>
                    <input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Chandra (Demo)"
                      className="w-full px-3 py-2 bg-[#181818] border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Account Number</label>
                      <input
                        type="text"
                        value={signupForm.accountNumber}
                        onChange={(e) => setSignupForm({ ...signupForm, accountNumber: e.target.value })}
                        placeholder="e.g. DEMO100099"
                        className="w-full px-3 py-2 bg-[#181818] border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Aadhaar (Fictional)</label>
                      <input
                        type="text"
                        value={signupForm.aadhaarNumber}
                        onChange={(e) => setSignupForm({ ...signupForm, aadhaarNumber: e.target.value })}
                        placeholder="e.g. XXXX-XXXX-1099"
                        className="w-full px-3 py-2 bg-[#181818] border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Password</label>
                      <input
                        type="password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        placeholder="Demo@123"
                        className="w-full px-3 py-2 bg-[#181818] border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Confirm Password</label>
                      <input
                        type="password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        placeholder="Repeat password"
                        className="w-full px-3 py-2 bg-[#181818] border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400">
                    * Fictional demo registration only. Passwords are salted &amp; hashed via bcrypt.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide uppercase rounded-lg shadow-lg border border-emerald-400/30 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Creating Account...' : 'Register Citizen Demo Account'}
                  </button>
                </form>
              )}

              {/* TAB 3: FORGOT PASSWORD */}
              {activeTab === 'FORGOT' && (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Enter Account Number or Aadhaar Number:
                    </label>
                    <input
                      type="text"
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      placeholder="Account or Aadhaar"
                      className="w-full px-3 py-2.5 bg-[#181818] border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-xs text-zinc-400">
                    In this demonstration environment, all demo accounts default to the password: <span className="font-mono text-emerald-400">Demo@123</span>.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('LOGIN')}
                      className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg"
                    >
                      Back to Login
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
                    >
                      Request Demo Reset
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero-Trust Architecture</span>
              </div>
              <span>Platform Version 3.4-prod</span>
            </div>
          </div>

          {/* Right Column: Secure Portal Information & Regulatory Directives ONLY */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
            <div className="bg-[#0e1210] border border-emerald-900/60 rounded-xl p-6 shadow-xl space-y-5">
              {/* Portal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Secure Portal Information
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold uppercase tracking-wider">
                  RESTRICTED GATEWAY
                </span>
              </div>

              {/* Access Scope Directives */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Authorized Access Scope
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This secure gateway is restricted to authorized financial intelligence officers, law enforcement investigators, and verified citizens accessing the grievance redressal docket.
                </p>
              </div>

              {/* Authentication Protocols */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Authentication Directives
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-[#141815] border border-zinc-800 space-y-1">
                    <div className="font-semibold text-zinc-200 text-[11px]">Dual Identifier Validation</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Authentication accepts either your institutional <strong className="text-zinc-300">Account Number</strong> (10 alphanumeric characters) or your registered <strong className="text-zinc-300">Aadhaar Token</strong> (format: XXXX-XXXX-XXXX).
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#141815] border border-zinc-800 space-y-1">
                    <div className="font-semibold text-zinc-200 text-[11px]">Session Integrity &amp; Encryption</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Every authenticated session is signed with 24-hour cryptographically secure tokens. Credentials are validated using salt-hashed encryption with automated replay defense.
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal & Regulatory Warning */}
              <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-900/50 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider text-[10px]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Statutory Cybercrime Notice
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Unauthorized access attempts or tampering with electronic fraud registries are punishable under Sections 43, 66 &amp; 70 of the Information Technology Act, 2000. All IP addresses, geo-locations, and forensic sessions are logged continuously.
                </p>
              </div>
            </div>

            {/* System Telemetry & Operational Health Status */}
            <div className="p-4 rounded-lg bg-[#0c0c0c] border border-zinc-850 text-[11px] font-mono text-zinc-400 space-y-1.5">
              <div className="text-zinc-300 font-semibold text-[10px] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3 h-3 text-emerald-400" />
                  System Telemetry &amp; Gateway Health
                </span>
                <span className="text-[10px] text-emerald-400 font-normal">FIPS-Compliant</span>
              </div>
              <div className="flex justify-between">
                <span>Gateway Proxy:</span>
                <span className="text-zinc-200">Port 3000 (Vite + Express Proxy)</span>
              </div>
              <div className="flex justify-between">
                <span>Data Persistence:</span>
                <span className="text-emerald-400">{health.database || 'Store Active'}</span>
              </div>
              <div className="flex justify-between">
                <span>Fraud Engine:</span>
                <span className="text-emerald-400">Online &bull; Real-Time Anomaly Scoring</span>
              </div>
              <div className="flex justify-between">
                <span>Audit Trail:</span>
                <span className="text-zinc-300">CERT-In Statutory Logging Enabled</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#0a0a0a] px-6 py-3 text-center text-xs text-zinc-400">
        Strictly for authorized law-enforcement simulation and financial intelligence research. No real Aadhaar or personal banking data stored or accessed.
      </footer>

      {/* MODAL: AUTHORIZED DEMO ACCESS KEY & CREDENTIALS */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-zinc-750 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#151515]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                    Authorized Demo Accounts Key
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Pre-configured credentials for authorized testing and evaluation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/60 text-xs text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">All accounts use the universal demo password: </span>
                  <span className="font-mono font-bold text-white bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700 ml-1">
                    Demo@123
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    You may sign in using either the <strong className="text-zinc-300">Account Number</strong> or the corresponding <strong className="text-zinc-300">Aadhaar Number</strong>. Click any option below to auto-fill.
                  </p>
                </div>
              </div>

              {/* Demo Accounts List */}
              <div className="space-y-3">
                {DEMO_ACCOUNTS.map((acc, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-[#161616] border border-zinc-800 hover:border-zinc-700 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-100">{acc.role}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${acc.tagColor}`}>
                            {acc.roleTag}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {acc.name} &bull; {acc.department}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {acc.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
                      <div className="p-2 rounded bg-[#0d0d0d] border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-zinc-400 uppercase font-sans">Account Number</div>
                          <div className="text-zinc-200 font-bold">{acc.accountNumber}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.accountNumber)}
                          className="p-1 hover:text-emerald-400 text-zinc-500"
                          title="Copy Account Number"
                        >
                          {copiedText === acc.accountNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="p-2 rounded bg-[#0d0d0d] border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-zinc-400 uppercase font-sans">Aadhaar Number</div>
                          <div className="text-zinc-200 font-bold">{acc.aadhaarNumber}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.aadhaarNumber)}
                          className="p-1 hover:text-emerald-400 text-zinc-500"
                          title="Copy Aadhaar"
                        >
                          {copiedText === acc.aadhaarNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="p-2 rounded bg-[#0d0d0d] border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-zinc-400 uppercase font-sans">Password</div>
                          <div className="text-emerald-400 font-bold">{acc.password}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.password)}
                          className="p-1 hover:text-emerald-400 text-zinc-500"
                          title="Copy Password"
                        >
                          {copiedText === acc.password ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Fill Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleQuickFill(acc.accountNumber, acc.password)}
                        className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <span>Fill with Account ({acc.accountNumber})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickFill(acc.aadhaarNumber, acc.password)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <span>Fill with Aadhaar ({acc.aadhaarNumber})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-800 bg-[#151515] flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                All 4 personas preserve their exact existing roles, cases, and permissions.
              </span>
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
