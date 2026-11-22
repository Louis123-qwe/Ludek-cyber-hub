import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hasLocalAdminAccount } from '../lib/storage';
import { loginSchema, passwordResetSchema, signUpSchema } from '../lib/validation';
import { Button, SurfaceCard, TextInput } from '../components/ui/DesignSystem';
import { useToast } from '../components/ui/ToastContext';

export function AuthPage() {
  const { authMode, login, signUp, resetPassword, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || '/dashboard';

  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'setup-admin'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const showFirstRunAdminOption = authMode === 'local-dev' && !hasLocalAdminAccount();

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090B10] p-4">
        <SurfaceCard className="w-full max-w-md p-6 space-y-4 text-center">
          <h1 className="font-display text-xl font-bold">Already signed in</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Signed in as <strong>{user.username}</strong> ({user.email}).
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            <Link to="/curriculum">
              <Button variant="secondary">Browse Curriculum</Button>
            </Link>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          setErrorMsg(parsed.error.issues[0]?.message || 'Check your inputs.');
          return;
        }
        const res = await login(parsed.data.email, parsed.data.password);
        if (!res.ok) {
          setErrorMsg(res.error || 'Login failed.');
          return;
        }
        showToast({ title: 'Welcome back to Ludek Tech Hub', variant: 'success' });
        navigate(redirectTo, { replace: true });
      } else if (mode === 'signup' || mode === 'setup-admin') {
        const parsed = signUpSchema.safeParse({ email, password, username, fullName });
        if (!parsed.success) {
          setErrorMsg(parsed.error.issues[0]?.message || 'Check your registration fields.');
          return;
        }
        const res = await signUp({
          ...parsed.data,
          role: mode === 'setup-admin' ? 'admin' : 'student',
        });
        if (!res.ok) {
          setErrorMsg(res.error || 'Registration failed.');
          return;
        }
        if (res.needsEmailVerification) {
          setInfoMsg('Verification email sent! Please confirm your email address, then log in.');
          setMode('login');
          return;
        }
        showToast({
          title: mode === 'setup-admin' ? 'Local Admin Account Created' : 'Account Created',
          description: 'Your learning progress will now be tracked.',
          variant: 'success',
        });
        navigate(mode === 'setup-admin' ? '/admin' : redirectTo, { replace: true });
      } else if (mode === 'reset') {
        const parsed = passwordResetSchema.safeParse({ email });
        if (!parsed.success) {
          setErrorMsg(parsed.error.issues[0]?.message || 'Enter a valid email.');
          return;
        }
        const res = await resetPassword(parsed.data.email);
        if (res.ok) setInfoMsg(res.message);
        else setErrorMsg(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090B10] p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
          <span className="text-xs font-mono text-slate-500">
            {authMode === 'supabase' ? 'Supabase Auth Active' : 'Local Development Mode'}
          </span>
        </div>

        <SurfaceCard className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {mode === 'login'
                ? 'Sign in to Ludek Tech Hub'
                : mode === 'signup'
                ? 'Create your learner account'
                : mode === 'setup-admin'
                ? 'First-Run Local Admin Setup'
                : 'Reset your password'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {authMode === 'local-dev'
                ? 'Running in Local Development Mode (credentials hashed locally via Web Crypto; configure Supabase env vars for cloud production auth).'
                : 'Authenticated securely via Supabase Auth & Row Level Security.'}
            </p>
          </div>

          <div className="flex gap-1 rounded-lg bg-slate-100 dark:bg-[#0D1017] p-1 text-xs">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-md font-medium ${mode === 'login' ? 'bg-white dark:bg-[#1B2230] shadow-xs' : 'text-slate-500'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-md font-medium ${mode === 'signup' ? 'bg-white dark:bg-[#1B2230] shadow-xs' : 'text-slate-500'}`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => { setMode('reset'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-md font-medium ${mode === 'reset' ? 'bg-white dark:bg-[#1B2230] shadow-xs' : 'text-slate-500'}`}
            >
              Reset
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}
          {infoMsg && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {(mode === 'signup' || mode === 'setup-admin') && (
              <>
                <TextInput
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ada Lovelace"
                  required
                />
                <TextInput
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ada_codes"
                  helperText="3-32 characters, letters, numbers, underscores or hyphens."
                  required
                />
              </>
            )}

            <TextInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="learner@example.com"
              required
            />

            {mode !== 'reset' && (
              <TextInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In'
                : mode === 'signup'
                ? 'Create Account'
                : mode === 'setup-admin'
                ? 'Create Local Admin Account'
                : 'Send Reset Instructions'}
            </Button>
          </form>

          {showFirstRunAdminOption && mode !== 'setup-admin' && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setMode('setup-admin'); setErrorMsg(null); }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <span>First-Run Setup: Claim Local Admin Account</span>
              </button>
            </div>
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
