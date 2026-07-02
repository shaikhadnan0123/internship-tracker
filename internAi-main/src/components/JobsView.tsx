import React, { useState } from 'react';
import { Briefcase, MapPin, Building2, AlertCircle, Loader2, CheckCircle, FileText, ArrowLeft } from 'lucide-react';
import AiIcon from './AiIcon';
import { Job, Profile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface JobsViewProps {
  jobs: Job[];
  profile: Profile;
  onApplyJob: (jobId: string) => void;
  searchQuery: string;
}

export default function JobsView({ jobs, profile, onApplyJob, searchQuery }: JobsViewProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // Job list search specific filters
  const [jobSearchText, setJobSearchText] = useState('');
  const [jobLocationText, setJobLocationText] = useState('');

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const handleOpenApply = () => {
    setCoverLetterText('');
    setAiError('');
    setIsApplyModalOpen(true);
  };

  const handleGenerateAiCoverLetter = async () => {
    if (!selectedJob) return;
    setIsAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: selectedJob.title,
          company: selectedJob.company,
          jobDescription: selectedJob.description,
          profile: profile
        })
      });
      if (!response.ok) throw new Error('Failed to generate cover letter');
      const data = await response.json();
      setCoverLetterText(data.coverLetter || '');
    } catch (err) {
      setAiError('Failed to compose cover letter using AI. Try typing a brief intro.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmitApplication = () => {
    if (!selectedJob) return;
    onApplyJob(selectedJob.id);
    setIsApplyModalOpen(false);
  };

  // Combine global search with local specific inputs
  const filteredJobs = jobs.filter(job => {
    // global search filter
    const globalQuery = searchQuery.toLowerCase();
    const matchesGlobal = !searchQuery || 
      job.title.toLowerCase().includes(globalQuery) ||
      job.company.toLowerCase().includes(globalQuery) ||
      job.description.toLowerCase().includes(globalQuery);

    // local inputs
    const localTitleQuery = jobSearchText.toLowerCase();
    const matchesLocalTitle = !jobSearchText || 
      job.title.toLowerCase().includes(localTitleQuery) ||
      job.company.toLowerCase().includes(localTitleQuery);

    const localLocQuery = jobLocationText.toLowerCase();
    const matchesLocalLoc = !jobLocationText || 
      job.location.toLowerCase().includes(localLocQuery);

    return matchesGlobal && matchesLocalTitle && matchesLocalLoc;
  });

  return (
    <div className="flex flex-col gap-4" id="ln-jobs-container">
      {/* Top Banner Search Fields */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative flex items-center">
          <Briefcase className="w-4 h-4 text-slate-200 absolute left-3 pointer-events-none z-10" />
          <input 
            type="text" 
            placeholder="Search job titles, companies..."
            value={jobSearchText}
            onChange={(e) => setJobSearchText(e.target.value)}
            className="w-full liquid-glass-input text-xs pl-9 pr-3 py-2.5 rounded-md outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex-1 relative flex items-center">
          <MapPin className="w-4 h-4 text-slate-200 absolute left-3 pointer-events-none z-10" />
          <input 
            type="text" 
            placeholder="City, state, or remote..."
            value={jobLocationText}
            onChange={(e) => setJobLocationText(e.target.value)}
            className="w-full liquid-glass-input text-xs pl-9 pr-3 py-2.5 rounded-md outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Split Pane Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Left Column: Job Cards List */}
        <div className="md:col-span-2 flex flex-col gap-2.5 max-h-[70vh] overflow-y-auto pr-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">Recommended for you</h3>
          
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500 text-xs">
              No matching jobs found. Try adjusting your search query.
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              return (
                <div 
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-3.5 rounded-xl border flex gap-3 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-indigo-500/80 bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.15)]' 
                      : 'border-slate-800 bg-white hover:border-slate-700'
                  }`}
                  id={`ln-job-list-item-${job.id}`}
                >
                  <img 
                    src={job.logo} 
                    alt={job.company} 
                    className="w-10 h-10 rounded-md object-cover border border-slate-200"
                  />
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 hover:text-[#0a66c2] truncate leading-tight tracking-tight">
                      {job.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate font-medium">{job.company}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-semibold uppercase tracking-wider">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.workplaceType}</span>
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                        {job.jobType}
                      </span>
                      {job.applied && (
                        <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-sm font-bold flex items-center gap-0.5 uppercase tracking-wider">
                          ✓ Applied
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Active Job Details Side Panel */}
        <div className="md:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col max-h-[70vh] overflow-y-auto">
          {selectedJob ? (
            <div className="flex flex-col flex-1" id="ln-job-details-pane">
              {/* Job Title and Org */}
              <div className="flex gap-4 items-start pb-4 border-b border-slate-100">
                <img 
                  src={selectedJob.logo} 
                  alt={selectedJob.company} 
                  className="w-14 h-14 rounded-md object-cover border border-slate-200 shadow-sm"
                />
                
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-base font-bold text-slate-900 leading-snug tracking-tight">{selectedJob.title}</h2>
                  <p className="text-xs text-slate-700 font-bold mt-0.5 uppercase tracking-wide">{selectedJob.company}</p>
                  
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedJob.location} ({selectedJob.workplaceType})
                    </span>
                    <span>•</span>
                    <span>Posted {selectedJob.postedAt}</span>
                    <span>•</span>
                    <span className="text-slate-900">{selectedJob.salary}</span>
                  </div>
                </div>
              </div>

              {/* Description Body */}
              <div className="py-5 flex flex-col gap-4 text-xs text-slate-700 leading-relaxed border-b border-slate-100 flex-1">
                <div>
                  <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest mb-2">About the Job</h3>
                  <p className="whitespace-pre-line text-sm text-slate-800 leading-relaxed font-medium">{selectedJob.description}</p>
                </div>

                <div>
                  <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest mb-2">Key Requirements</h3>
                  <ul className="list-disc pl-4 space-y-1.5 text-sm text-slate-800 leading-relaxed font-medium">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Apply Button */}
              <div className="pt-4 flex gap-3 items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Stored Profile Application
                </span>
                
                {selectedJob.applied ? (
                  <button 
                    disabled 
                    className="bg-green-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-full flex items-center gap-1.5 shadow-sm opacity-90"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Applied</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleOpenApply}
                    className="bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-full transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <span>Easy Apply</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs">
              Select a job from the panel to view descriptions and apply.
            </div>
          )}
        </div>
      </div>

      {/* EASY APPLY MODAL WITH AI COVER LETTER GENERATION */}
      <AnimatePresence>
        {isApplyModalOpen && selectedJob && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="liquid-glass-card rounded-2xl border border-white/20 w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-slate-900/80">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-slate-100 text-xs">
                    Easy Apply to {selectedJob.company}
                  </h3>
                  <span className="text-[10px] text-slate-400">{selectedJob.title}</span>
                </div>
                <button 
                  onClick={() => setIsApplyModalOpen(false)}
                  className="p-1 hover:bg-white/15 rounded-full cursor-pointer text-slate-400 hover:text-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
                {/* Profile Overview snapshot */}
                <div className="p-3 bg-white/5 border border-white/10 rounded-md">
                  <h4 className="text-[10.5px] font-bold text-slate-200 mb-2">Contact Information Summary</h4>
                  <div className="flex gap-3 items-center text-xs">
                    <img src={profile.avatar} alt={profile.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    <div>
                      <p className="font-semibold text-slate-100">{profile.name}</p>
                      <p className="text-[10px] text-slate-400">{profile.headline}</p>
                      <p className="text-[9.5px] text-slate-400 mt-0.5">{profile.location}</p>
                    </div>
                  </div>
                </div>

                {/* Cover letter section */}
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10.5px] font-bold text-slate-200">Cover Letter</label>
                    <button 
                      onClick={handleGenerateAiCoverLetter}
                      disabled={isAiLoading}
                      className="border border-indigo-500/30 hover:border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-[10px] py-1.5 px-3 rounded-full flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {isAiLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>AI is composing...</span>
                        </>
                      ) : (
                        <>
                          <AiIcon className="w-3 h-3 text-[#7839ec]" />
                          <span>Draft Tailored with internAi ✨</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiError && (
                    <div className="flex items-center gap-1.5 text-red-500 text-[9.5px] font-semibold">
                      <AlertCircle className="w-3 h-3" />
                      <span>{aiError}</span>
                    </div>
                  )}

                  <textarea
                    placeholder="Write a cover letter or click above to draft a tailored introduction dynamically matching your profile experience..."
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                    className="w-full min-h-[180px] text-xs p-2.5 liquid-glass-input rounded-md outline-none resize-y font-sans"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-3 border-t border-white/10 flex justify-end gap-2 bg-slate-900/80">
                <button 
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-3.5 py-1.5 border border-white/20 hover:bg-white/10 rounded-full text-xs font-semibold text-slate-300 hover:text-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitApplication}
                  className="liquid-glass-primary-btn text-xs px-5 py-1.5 rounded-full cursor-pointer shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
