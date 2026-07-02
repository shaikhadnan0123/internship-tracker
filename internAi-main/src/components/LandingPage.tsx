import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Briefcase, FileCheck, HelpCircle, ArrowRight } from 'lucide-react';
import AiIcon from './AiIcon';
import { LoginForm, SignUpForm } from './AuthForms';

interface LandingPageProps {
  onLogin: (registeredData?: any) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans select-none">
      {/* Decorative radial gradients & glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-[95%] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between z-10">
        <button 
          onClick={() => setAuthView('landing')}
          className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer text-left hover:opacity-90 transition-opacity"
        >
          <AiIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
          <span className="text-lg font-black tracking-tight text-white">
            intern<span className="text-indigo-400">Ai</span>
          </span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setAuthView('login')}
            className={`px-4 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer ${
              authView === 'login' 
                ? 'text-white bg-white/10 border-slate-400' 
                : 'text-slate-300 hover:text-white hover:bg-white/5 border-slate-500/20 hover:border-slate-500/40'
            }`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setAuthView('signup')}
            className={`px-4 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer ${
              authView === 'signup'
                ? 'text-white bg-indigo-500 border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/30'
            }`}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 max-w-5xl mx-auto z-10 w-full pt-10 pb-20">
        <AnimatePresence mode="wait">
          {authView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center w-full"
            >
              {/* Animated Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-6 shadow-3xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Next Generation Career Consultant</span>
              </div>

              {/* Hero Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-center text-white tracking-tight leading-tight max-w-3xl">
                Launch Your Internship Journey with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400">AI Guidance</span>
              </h1>

              {/* Hero Subtext */}
              <p className="text-xs md:text-sm text-slate-400 text-center font-medium leading-relaxed max-w-xl mt-4.5">
                The ultimate developer workspace designed for students and graduates. Score your resume, optimize your developer profile, and align with top job matches instantly.
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-8 w-full sm:w-auto">
                <button 
                  onClick={() => setAuthView('signup')}
                  className="w-full sm:w-auto px-6.5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-full cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30 hover:scale-[1.02]"
                >
                  <span>Get Started for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setAuthView('signup')}
                  className="w-full sm:w-auto px-6.5 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-500/20 text-slate-200 text-xs font-black uppercase tracking-widest rounded-full cursor-pointer flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                >
                  <span>Scan Your Resume</span>
                </button>
              </div>

              {/* Dynamic Key Features Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-20">
                {/* Card 1: Resume Analysis */}
                <div className="liquid-glass-card rounded-2xl p-6.5 flex flex-col gap-4 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100">AI Resume Scoring</h3>
                    <p className="text-[11.5px] text-slate-400 leading-relaxed font-semibold mt-2">
                      Drop your CV to receive instant overall alignment scoring, vibe indexing, and customized bullet rewrites tailored for recruiters.
                    </p>
                  </div>
                </div>

                {/* Card 2: Internship Match */}
                <div className="liquid-glass-card rounded-2xl p-6.5 flex flex-col gap-4 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100">Target Job Matching</h3>
                    <p className="text-[11.5px] text-slate-400 leading-relaxed font-semibold mt-2">
                      Discover matching internship and entry-level positions based on your professional experience and exact skillset index.
                    </p>
                  </div>
                </div>

                {/* Card 3: Profile Coaching */}
                <div className="liquid-glass-card rounded-2xl p-6.5 flex flex-col gap-4 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 group">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100">Interactive Prep Chat</h3>
                    <p className="text-[11.5px] text-slate-400 leading-relaxed font-semibold mt-2">
                      Consult with our AI career agent to ask questions about cover letters, draft interview replies, and identify skill development gaps.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {authView === 'login' && (
            <LoginForm 
              onSubmit={onLogin} 
              onToggleToSignUp={() => setAuthView('signup')} 
              onCancel={() => setAuthView('landing')} 
            />
          )}

          {authView === 'signup' && (
            <SignUpForm 
              onSubmit={onLogin} 
              onToggleToSignIn={() => setAuthView('login')} 
              onCancel={() => setAuthView('landing')} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Simple Footer */}
      <footer className="w-full text-center py-6 border-t border-slate-900/60 z-10 mt-auto">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Powered by internAi Insights • © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
