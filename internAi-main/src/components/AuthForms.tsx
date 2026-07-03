import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface LoginFormProps {
  onSubmit: (data: any) => void;
  onToggleToSignUp: () => void;
  onCancel: () => void;
}

export function LoginForm({ onSubmit, onToggleToSignUp, onCancel }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      
      // Enforce email verification check on client side
      if (!cred.user.emailVerified) {
        setError('Your email address is not verified. Please check your inbox for the verification link.');
        setLoading(false);
        return;
      }

      // Retrieve profile details from Firestore
      const docRef = doc(db, 'users', cred.user.uid);
      const docSnap = await getDoc(docRef);
      
      onSubmit(docSnap.exists() ? docSnap.data() : null);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Sign-in method is disabled. Please enable "Email/Password" in your Firebase console under Authentication > Sign-in method.');
      } else {
        setError(`Failed to sign in: ${err.message || err.code}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email.trim()) {
      setError('Please enter your email address to request a reset link.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMessage('A secure password reset link has been sent to your email.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account exists with this email address.');
      } else {
        setError(`Failed to send password reset: ${err.message || err.code}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md liquid-glass-card rounded-2xl p-8 border border-white/10 shadow-2xl flex flex-col gap-6"
    >
      <div className="flex items-center gap-2">
        <button 
          onClick={forgotPasswordMode ? () => { setForgotPasswordMode(false); setError(''); setInfoMessage(''); } : onCancel}
          disabled={loading}
          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {forgotPasswordMode ? 'Reset Password' : 'Welcome Back'}
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            {forgotPasswordMode ? 'Get a secure link to recover your credentials' : 'Sign in to access your AI career workspace'}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      {forgotPasswordMode ? (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full liquid-glass-input rounded-xl px-4 py-3 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all disabled:opacity-60"
              placeholder="name@example.com"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-full cursor-pointer transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full liquid-glass-input rounded-xl px-4 py-3 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all disabled:opacity-60"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => { setForgotPasswordMode(true); setError(''); setInfoMessage(''); }}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold bg-transparent border-none cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full liquid-glass-input rounded-xl px-4 py-3 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all disabled:opacity-60"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-full cursor-pointer transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      )}

      <div className="text-center border-t border-slate-900/60 pt-4">
        <span className="text-[11px] font-semibold text-slate-400">
          New to internAi?{' '}
          <button 
            onClick={onToggleToSignUp}
            disabled={loading}
            className="text-indigo-400 hover:text-indigo-300 font-black cursor-pointer bg-transparent border-none disabled:opacity-50"
          >
            Create an Account
          </button>
        </span>
      </div>
    </motion.div>
  );
}

interface SignUpFormProps {
  onSubmit: (data: any) => void;
  onToggleToSignIn: () => void;
  onCancel: () => void;
}

export function SignUpForm({ onSubmit, onToggleToSignIn, onCancel }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    profession: 'student',
    workplace: '',
    city: '',
    country: '',
    skills: '',
    about: '',
    avatar: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check mandatory fields
    if (!formData.name.trim()) return setError('Full name is required.');
    if (!formData.email.trim()) return setError('Email address is required.');
    if (!formData.age.trim() || isNaN(Number(formData.age))) return setError('A valid age is required.');
    if (!formData.password.trim() || formData.password.length < 6) return setError('Password must be at least 6 characters.');
    if (!formData.workplace.trim()) {
      return setError(formData.profession === 'student' ? 'College name is required.' : 'Organization name is required.');
    }

    setLoading(true);
    try {
      // 1. Create account in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password.trim());
      
      // Send secure verification email
      try {
        await sendEmailVerification(cred.user);
      } catch (err) {
        console.error("Failed to send validation email:", err);
      }
      
      // 2. Build the detailed profile document matching the Profile TS interface
      const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
      const defaultBanner = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80';
      
      const newProfile = {
        name: formData.name.trim(),
        headline: formData.profession === 'student'
          ? `Student at ${formData.workplace.trim()}`
          : `Employee at ${formData.workplace.trim()}`,
        avatar: formData.avatar.trim() || defaultAvatar,
        banner: defaultBanner,
        location: (formData.city.trim() && formData.country.trim())
          ? `${formData.city.trim()}, ${formData.country.trim()}`
          : formData.city.trim() || formData.country.trim() || 'San Francisco, CA',
        connectionsCount: 0,
        about: formData.about.trim() || 'No about details provided yet.',
        skills: formData.skills
          ? formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
          : [],
        experience: formData.profession === 'employee' 
          ? [
              {
                id: `exp_${Date.now()}`,
                company: formData.workplace.trim(),
                role: 'Professional Employee',
                duration: 'Present',
                description: 'Full-time employment.'
              }
            ]
          : [],
        education: formData.profession === 'student'
          ? [
              {
                id: `edu_${Date.now()}`,
                school: formData.workplace.trim(),
                degree: 'Student',
                duration: 'Present'
              }
            ]
          : []
      };

      // 3. Write profile details to Firestore database
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);

      // 4. Trigger App login state update
      onSubmit(newProfile);
    } catch (err: any) {
      console.error("Firebase Sign Up error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email address already exists.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Sign-up method is disabled. Please enable "Email/Password" in your Firebase console under Authentication > Sign-in method.');
      } else {
        setError(`Failed to register account: ${err.message || err.code}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-xl liquid-glass-card rounded-2xl p-7 border border-white/10 shadow-2xl flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
    >
      <div className="flex items-center gap-2">
        <button 
          onClick={onCancel}
          disabled={loading}
          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          title="Back to Welcome"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Create Account</h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Fill out your profile details to launch your AI career dashboard</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name & Age Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name *</label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all disabled:opacity-60"
              placeholder="Alex Rivera"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Age *</label>
            <input 
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
              disabled={loading}
              className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all disabled:opacity-60"
              placeholder="21"
              required
            />
          </div>
        </div>

        {/* Email & Password Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address *</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all disabled:opacity-60"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Password *</label>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all disabled:opacity-60"
              placeholder="Minimum 6 characters"
              required
            />
          </div>
        </div>

        {/* Profession & Workplace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Profession *</label>
            <select
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              disabled={loading}
              className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none border border-slate-400/25 bg-slate-900 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all cursor-pointer disabled:opacity-60"
            >
              <option value="student">Student</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {formData.profession === 'student' ? 'College Name *' : 'Organization Name *'}
            </label>
            <input 
              type="text"
              name="workplace"
              value={formData.workplace}
              onChange={handleChange}
              disabled={loading}
              className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all disabled:opacity-60"
              placeholder={formData.profession === 'student' ? 'Stanford University' : 'Google Inc.'}
              required
            />
          </div>
        </div>

        {/* City & Country Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">City</label>
            <input 
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={loading}
              className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all disabled:opacity-60"
              placeholder="San Francisco"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Country</label>
            <input 
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              disabled={loading}
              className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all disabled:opacity-60"
              placeholder="United States"
            />
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Skills (Comma-separated)</label>
          <input 
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            disabled={loading}
            className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all disabled:opacity-60"
            placeholder="React, TypeScript, CSS, Node.js"
          />
        </div>

        {/* About */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">About Yourself</label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            disabled={loading}
            rows={3}
            className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all resize-none disabled:opacity-60"
            placeholder="Tell us about your background, career aspirations, or primary expertise..."
          />
        </div>

        {/* Profile Photo URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Profile Photo URL</label>
          <input 
            type="text"
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            disabled={loading}
            className="w-full liquid-glass-input rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none border border-slate-400/25 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all disabled:opacity-60"
            placeholder="https://images.unsplash.com/... or leave blank for default avatar"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-full cursor-pointer transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Sign Up & Create Account</span>
          )}
        </button>
      </form>

      <div className="text-center border-t border-slate-900/60 pt-4">
        <span className="text-[11px] font-semibold text-slate-400">
          Already have an account?{' '}
          <button 
            onClick={onToggleToSignIn}
            disabled={loading}
            className="text-indigo-400 hover:text-indigo-300 font-black cursor-pointer bg-transparent border-none disabled:opacity-50"
          >
            Sign In Here
          </button>
        </span>
      </div>
    </motion.div>
  );
}
