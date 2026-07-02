import React, { useState } from 'react';
import { 
  BarChart3, 
  Plus, 
  Loader2, 
  Briefcase, 
  Building2, 
  Calendar, 
  TrendingUp, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  X, 
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Application, ApplicationStats, BenchmarkResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TrackerViewProps {
  applications: Application[];
  stats: ApplicationStats | null;
  benchmark: BenchmarkResult | null;
  isLoading: boolean;
  isActionLoading: boolean;
  onAddApplication: (data: {
    company: string;
    role: string;
    platform: string;
    status: string;
    job_description: string;
  }) => Promise<void>;
  onRunBenchmark: () => Promise<void>;
}

export default function TrackerView({
  applications,
  stats,
  benchmark,
  isLoading,
  isActionLoading,
  onAddApplication,
  onRunBenchmark
}: TrackerViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [status, setStatus] = useState('Applied');
  const [jd, setJd] = useState('');
  const [formError, setFormError] = useState('');
  
  // Expanded application details state
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  
  // Search state
  const [filterQuery, setFilterQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!company.trim() || !role.trim()) {
      setFormError('Company and Role are required.');
      return;
    }

    try {
      await onAddApplication({
        company: company.trim(),
        role: role.trim(),
        platform,
        status,
        job_description: jd.trim()
      });
      // Reset form
      setCompany('');
      setRole('');
      setPlatform('LinkedIn');
      setStatus('Applied');
      setJd('');
      setShowAddForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add application. Please check backend connection.');
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('interview')) return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    if (s.includes('reject')) return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    if (s.includes('offer')) return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    return 'bg-blue-500/10 text-blue-300 border-blue-500/30'; // Applied/Other
  };

  const getScoreColor = (score: number = 0) => {
    if (score >= 75) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (score >= 45) return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5';
    return 'text-slate-400 border-slate-500/30 bg-slate-500/5';
  };

  const filteredApps = applications.filter(app => {
    const query = filterQuery.toLowerCase();
    return (
      app.company.toLowerCase().includes(query) ||
      app.role.toLowerCase().includes(query) ||
      app.platform.toLowerCase().includes(query) ||
      app.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn max-w-7xl mx-auto" id="tracker-view-container">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-3 tracking-tight">
            <Briefcase className="w-8 h-8 text-indigo-400" />
            INTERNSHIP TRACKER
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-semibold mt-1">
            Automate application prioritization and run performance-accelerated GPU pipelines.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs bg-gradient-to-tr from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg cursor-pointer transition-all hover:scale-[1.02] duration-200"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel Application' : 'Add Application'}
        </button>
      </div>

      {/* Add Application Form Modal-style dropdown */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden w-full"
          >
            <form 
              onSubmit={handleSubmit}
              className="liquid-glass-card rounded-2xl p-6 md:p-8 flex flex-col gap-5 border border-white/20 shadow-xl"
            >
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10 shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">
                  Add Application & Trigger Scoring Pipeline
                </h3>
              </div>

              {formError && (
                <div className="bg-rose-950/45 border border-rose-500/30 text-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs font-semibold leading-relaxed">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-400 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Stripe, Nvidia"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full liquid-glass-input rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 outline-none border border-slate-500/25 focus:border-indigo-400 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Role / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frontend Intern, ML Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full liquid-glass-input rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 outline-none border border-slate-500/25 focus:border-indigo-400 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Platform Channel</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-[#0d1527]/90 rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 outline-none border border-slate-500/25 focus:border-indigo-400 transition-all"
                  >
                    <option value="LinkedIn">LinkedIn (15 pts)</option>
                    <option value="Wellfound">Wellfound / AngelList (20 pts)</option>
                    <option value="Referral">Employee Referral (25 pts)</option>
                    <option value="Email">Direct Cold Email (25 pts)</option>
                    <option value="Internshala">Internshala (10 pts)</option>
                    <option value="Indeed">Indeed / Jobs Board (5 pts)</option>
                    <option value="Other">Other / Portal (5 pts)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Current Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#0d1527]/90 rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 outline-none border border-slate-500/25 focus:border-indigo-400 transition-all"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing (+10 pts bonus)</option>
                    <option value="Rejected">Rejected (-5 pts penalty)</option>
                    <option value="Offer">Offer Received</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Job Description (Optional)</label>
                  <span className="text-[9px] text-indigo-300 font-bold">Matches keywords (Python, Flask, SQL, Cloud) up to 25 pts</span>
                </div>
                <textarea
                  placeholder="Paste details to run algorithmic matching score..."
                  value={jd}
                  rows={4}
                  onChange={(e) => setJd(e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 outline-none border border-slate-500/25 focus:border-indigo-400 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isActionLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50 cursor-pointer transition-all duration-200 mt-2"
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Calculating Priority Score & Syncing...
                  </>
                ) : (
                  'Ingest and Score Application'
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-metrics-grid">
        {/* Metric 1: Total Applications */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 shadow-sm relative overflow-hidden flex flex-col gap-2 bg-gradient-to-tr from-slate-900/40 to-indigo-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Applications</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl md:text-3xl font-black text-slate-100">
              {stats ? stats.total_applications : applications.length}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-semibold mt-1">Stored in BigQuery & Raw CSV</span>
        </div>

        {/* Metric 2: Interviewing Count */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 shadow-sm relative overflow-hidden flex flex-col gap-2 bg-gradient-to-tr from-slate-900/40 to-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Interviews</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl md:text-3xl font-black text-slate-100">
              {stats ? stats.interviewing_count : applications.filter(a => a.status.toLowerCase().includes('interview')).length}
            </span>
            <span className="text-[10px] text-amber-300 font-black px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/20 rounded-md">
              Bonus Active
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-semibold mt-1">Prioritized in Dashboard Feed</span>
        </div>

        {/* Metric 3: Rejected Count */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 shadow-sm relative overflow-hidden flex flex-col gap-2 bg-gradient-to-tr from-slate-900/40 to-rose-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejections</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
              <X className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl md:text-3xl font-black text-slate-100">
              {stats ? stats.rejected_count : applications.filter(a => a.status.toLowerCase().includes('reject')).length}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-semibold mt-1">Flagged to adjust pipeline filters</span>
        </div>

        {/* Metric 4: Average Score */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 shadow-sm relative overflow-hidden flex flex-col gap-2 bg-gradient-to-tr from-slate-900/40 to-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Priority Score</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl md:text-3xl font-black text-slate-100">
              {stats ? stats.avg_priority_score : '0.0'}
            </span>
            <span className="text-[9px] text-slate-300 font-bold">/ 100</span>
          </div>
          <span className="text-[9px] text-slate-400 font-semibold mt-1">Based on algorithmic urgency/match</span>
        </div>
      </div>

      {/* Main Grid: Applications List & Benchmarking Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Applications List (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-500/20">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm md:text-base font-extrabold text-slate-100">Scored Internship Pipelines</h2>
              </div>
              <input
                type="text"
                placeholder="Filter by company or role..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="liquid-glass-input text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-500/20 outline-none w-full sm:max-w-[240px] text-slate-200 focus:border-indigo-400"
              />
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Syncing application logs from Flask...</span>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center p-12 text-slate-500 text-xs font-semibold border border-dashed border-slate-700/50 rounded-xl">
                No internship applications found. Use the form to ingest one!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredApps.map((app) => {
                  const isExpanded = expandedAppId === app.application_id;
                  return (
                    <div 
                      key={app.application_id}
                      className="bg-slate-900/35 hover:bg-slate-900/65 border border-slate-500/25 rounded-xl p-4 transition-all duration-200"
                    >
                      {/* Main Application Row */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-500/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Building2 className="w-5 h-5 text-slate-300" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-sm text-slate-100 truncate">{app.company}</h4>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(app.status)}`}>
                                {app.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 font-bold truncate mt-0.5">{app.role}</p>
                            
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-400 font-semibold items-center">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {app.date_applied}
                              </span>
                              <span className="w-1.5 h-1.5 bg-slate-500/40 rounded-full"></span>
                              <span className="font-bold text-indigo-300">
                                {app.platform}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Priority Score circular display */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className={`border rounded-xl px-3 py-2 text-center flex flex-col justify-center min-w-[50px] shadow-3xs ${getScoreColor(app.priority_score)}`}>
                            <span className="text-base font-black leading-none">{app.priority_score || 0}</span>
                            <span className="text-[8px] uppercase font-extrabold tracking-wider mt-0.5">Priority</span>
                          </div>
                          
                          <button
                            onClick={() => setExpandedAppId(isExpanded ? null : app.application_id)}
                            className="p-1.5 hover:bg-slate-800/85 rounded-lg border border-slate-500/20 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Detailed Score Breakdown Drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-3.5 pt-3.5 border-t border-slate-500/20"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-500/15">
                              <div className="flex flex-col text-center p-2 border-r border-slate-500/10">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Urgency Score</span>
                                <span className="text-sm font-black text-slate-100 mt-1">{app.urgency_score || 0}/40</span>
                              </div>
                              <div className="flex flex-col text-center p-2 border-r border-slate-500/10">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Platform Score</span>
                                <span className="text-sm font-black text-indigo-300 mt-1">{app.platform_score || 0}/25</span>
                              </div>
                              <div className="flex flex-col text-center p-2 border-r border-slate-500/10">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">JD Match Score</span>
                                <span className="text-sm font-black text-purple-300 mt-1">{app.role_match_score || 0}/25</span>
                              </div>
                              <div className="flex flex-col text-center p-2">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status Bonus</span>
                                <span className={`text-sm font-black mt-1 ${(app.status_bonus || 0) < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {app.status_bonus || 0}/10
                                </span>
                              </div>
                            </div>

                            {app.job_description && (
                              <div className="mt-3 bg-slate-950/45 p-3 rounded-lg border border-slate-500/10">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <FileText className="w-3 h-3" /> Job Details Match
                                </span>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-semibold mt-1 bg-[#090f1d] p-2 rounded max-h-[120px] overflow-y-auto whitespace-pre-line no-scrollbar">
                                  {app.job_description}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: GPU Benchmarking Panel (1 col) */}
        <div className="flex flex-col gap-4">
          <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-500/20">
              <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
              <div>
                <h2 className="text-sm md:text-base font-extrabold text-slate-100 leading-none">GPU Pipeline Benchmark</h2>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                  NVIDIA cuDF vs Standard CPU Pandas
                </span>
              </div>
            </div>

            {benchmark ? (
              <div className="flex flex-col gap-4">
                {/* Speedup big badge */}
                <div className="bg-slate-900/60 p-4 border border-indigo-500/35 rounded-xl shadow-inner flex flex-col items-center justify-center text-center relative overflow-hidden bg-radial-gradient">
                  <div className="absolute top-1 right-2 flex items-center gap-1 text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Synchronized
                  </div>
                  
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">NVIDIA GPU SPEEDUP</span>
                  <span className="text-3xl md:text-4xl font-black text-indigo-400 mt-1 leading-none">
                    {benchmark.speedup.toFixed(1)}x
                  </span>
                  <span className="text-[10px] text-emerald-300 font-extrabold uppercase mt-1 tracking-wider">
                    Faster Pipeline Execution
                  </span>
                </div>

                {/* Graph/Bars Comparison */}
                <div className="flex flex-col gap-3.5 bg-slate-950/70 p-3.5 border border-slate-500/15 rounded-xl">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider block">Execution Comparison</span>
                  
                  {/* CPU Bar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400">Standard CPU (Pandas)</span>
                      <span className="text-slate-200">{benchmark.cpu_time_sec.toFixed(4)}s</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-slate-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  {/* GPU Bar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-indigo-400 flex items-center gap-1">
                        NVIDIA GPU (cuDF) {benchmark.gpu_active && '⚡'}
                      </span>
                      <span className="text-indigo-300">{benchmark.gpu_time_sec.toFixed(4)}s</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full shadow-glow" 
                        style={{ width: `${Math.max(4, (benchmark.gpu_time_sec / benchmark.cpu_time_sec) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-semibold text-slate-400 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-500/10">
                  <span className="font-bold text-slate-200 block mb-0.5">Dataset Context:</span>
                  Analyzed <strong className="text-slate-100">{benchmark.dataset_size_rows?.toLocaleString() || '100,000'}</strong> synthetic application data points performing merges, groups, and regex operations.
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs font-semibold border border-dashed border-slate-700/50 rounded-xl">
                No benchmarking data loaded. Run benchmark from Flask backend.
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={onRunBenchmark}
              disabled={isActionLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-indigo-500/35 bg-indigo-650/15 hover:bg-indigo-600 hover:text-white text-indigo-300 font-extrabold uppercase tracking-widest text-xs transition-all shadow-3xs shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  Running Benchmarking Kernels...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  Test GPU cuDF Speedup
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
