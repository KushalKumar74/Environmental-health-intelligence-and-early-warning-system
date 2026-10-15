import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Wind, Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  // If navigated from a protected action, redirect back after login
  const from = (routerLocation.state as { from?: string })?.from ?? '/';

  const [tab, setTab] = useState<Tab>('login');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    try {
      await login(email, password, remember);
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome to UAQI 🌿');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="particle" style={{ '--i': i } as React.CSSProperties} />
      ))}

      {/* Glass card */}
      <div className="glass-card w-full max-w-md relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-sky shadow-glow mb-4 overflow-hidden">
            <img
              src="/logo.png"
              alt="UAQI logo"
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute('hidden');
              }}
            />
            <Wind className="h-8 w-8 text-white" hidden />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">UAQI</h1>
          <p className="text-slate-400 mt-1 text-sm">Breathe smarter. Live better.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-white/5 p-1 mb-8 relative">
          <div
            className="tab-indicator"
            style={{ transform: tab === 'login' ? 'translateX(0)' : 'translateX(100%)' }}
          />
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${tab === t ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              {t === 'login' ? '🔑 Sign In' : '✨ Register'}
            </button>
          ))}
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="input-group">
              <Mail className="input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                required
              />
            </div>
            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-500"
                />
                <span className="text-sm text-slate-300">Remember me</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="gradient-btn w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Sign In →'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="input-group">
              <UserIcon className="input-icon" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input"
                required
              />
            </div>
            <div className="input-group">
              <Mail className="input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                required
              />
            </div>
            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="gradient-btn w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Create Account ✨'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-400 mt-6">
          {tab === 'login' ? (
            <>No account?{' '}
              <button onClick={() => setTab('register')} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Register free
              </button>
            </>
          ) : (
            <>Already registered?{' '}
              <button onClick={() => setTab('login')} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Sign in
              </button>
            </>
          )}
        </p>

        <p className="text-center text-xs text-slate-600 mt-4">
          🔒 Your data is private and encrypted
        </p>
      </div>
    </div>
  );
}
