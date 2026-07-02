import React, { useState } from 'react';
import { Image, ThumbsUp, MessageSquare, Share2, Send, X, Plus, AlertCircle, Loader2, Briefcase, FileUp, Trash2, TrendingUp, Eye, Users, Award, BarChart3 } from 'lucide-react';
import AiIcon from './AiIcon';
import { Post, Profile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  posts: Post[];
  profile: Profile;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onSharePost: (postId: string) => void;
  onCreatePost: (content: string, image?: string) => void;
  onDeletePost?: (postId: string) => void;
  onDeleteAllPosts?: () => void;
  searchQuery: string;
}

const CV_PRESETS = {
  frontend: {
    name: "Alex_Rivera_Frontend_CV.txt",
    text: `ALEX RIVERA - JUNIOR FRONTEND ENGINEER
Email: alex.rivera@example.com | GitHub: github.com/alexrivera
Summary: Passionate and detail-oriented Frontend Developer with 1 year of experience building responsive, accessible web applications. Proficient in React, modern JavaScript, TypeScript, and Tailwind CSS.
Skills: React, JavaScript (ES6+), TypeScript, HTML5, CSS3, Tailwind CSS, Vite, Git, REST APIs, Jest.
Experience:
- Frontend Intern at TechSolutions (6 months): Developed interactive dashboard widgets using React, improving performance by 20%. Refactored legacy CSS to Tailwind utility classes.
Projects:
- Personal Task Board: A drag-and-drop task management SPA built with Vite, React, and local storage persistence.`
  },
  ai: {
    name: "Taylor_Chen_AI_Intern_CV.txt",
    text: `TAYLOR CHEN - AI RESEARCH & ENGINEERING INTERN
Email: taylor.chen@example.com | LinkedIn: linkedin.com/in/taylorchen
Summary: Graduate student specializing in Artificial Intelligence and Machine Learning. Practical project experience using LLMs, prompt engineering, internAi API integrations, and Python-based deep learning workflows.
Skills: Python, PyTorch, TensorFlow, LLM Integration, internAi API, Prompt Engineering, Pandas, NumPy, SQL, Git.
Projects:
- Smart Document Summarizer: Built a server-side document summarization pipeline leveraging the @google/genai SDK to parse and categorize large research reports.
- Computer Vision Classifier: Designed a PyTorch-based convolutional neural network for real-time object detection with 92% classification accuracy.`
  },
  fullstack: {
    name: "Jordan_Smith_FullStack_CV.txt",
    text: `JORDAN SMITH - FULL STACK DEVELOPER
Email: jordan.smith@example.com | Web: jordansmith.dev
Summary: Versatile and goal-driven Full Stack Developer with strong foundations in server-side systems and modern frontend client applications. Skilled in building secure API routes and robust databases.
Skills: React, Node.js, Express, PostgreSQL, MongoDB, RESTful API Design, Docker, Git, CI/CD, Jest.
Experience:
- Web Development Intern at CloudNine (6 months): Maintained client-facing REST APIs and integrated Stripe payment gateway on Express servers. Built clean UI routes.
Projects:
- E-Commerce Engine: Designed a multi-tier microservice platform utilizing Node.js backend services and dynamic React dashboards with PostgreSQL database persistence.`
  }
};

export default function Dashboard({
  posts,
  profile,
  onLikePost,
  onAddComment,
  onSharePost,
  onCreatePost,
  onDeletePost,
  onDeleteAllPosts,
  searchQuery
}: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [attachedImage, setAttachedImage] = useState('');

  // AI CV/Resume State
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isResumeLoading, setIsResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'assistant'; text: string; timestamp: Date }[]>([
    {
      sender: 'assistant',
      text: "👋 Welcome! I am your AI Career Consultant. Upload your resume/CV (.txt) above or ask me any career, interview, or internship question right here in this chat!",
      timestamp: new Date()
    }
  ]);

  // Internship Recommendation State
  const [showInternshipsModal, setShowInternshipsModal] = useState(false);
  const [internships, setInternships] = useState<any[]>([]);
  const [isInternshipsLoading, setIsInternshipsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Widget Dismissal States
  const [showResumeWidget, setShowResumeWidget] = useState(true);
  const [showPromoted, setShowPromoted] = useState(true);

  // Performance Insights States
  const [performanceMetric, setPerformanceMetric] = useState<'views' | 'engagements' | 'searches'>('views');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const fetchResumeAnalysisForText = async (text: string, fileName: string = "uploaded CV") => {
    setIsAnalysisLoading(true);
    setResumeError('');
    try {
      const response = await fetch('/api/ai/resume-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text })
      });
      if (!response.ok) throw new Error('Failed to analyze resume');
      const data = await response.json();
      setResumeAnalysis(data.analysis);

      // Add a beautifully formatted report to the chat history
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `📊 **Analysis Completed for ${fileName}!**

**Overall Resume Score:** \`${data.analysis?.overallScore || 80}/100\`
**Industry Vibe:** *${data.analysis?.industryVibe || 'Professional & Modern'}*

*${data.analysis?.summary || 'Your resume has been processed.'}*

You can view the full scores, category breakdown, and strengths/improvements below.
Ask me any questions in the chat bar below to tailor or rewrite your sections!`,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error(err);
      setResumeError('Failed to fetch AI Resume Analysis. Please retry.');
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleLoadPreset = (key: 'frontend' | 'ai' | 'fullstack') => {
    const preset = CV_PRESETS[key];
    setResumeText(preset.text);
    setResumeFileName(preset.name);
    setResumeError('');
    
    // Add load message
    setChatHistory(prev => [
      ...prev,
      {
        sender: 'assistant',
        text: `📂 Loaded preset CV template: **${preset.name}**. Let me analyze it for you...`,
        timestamp: new Date()
      }
    ]);

    // Automatically trigger internship matchmaking and resume analysis!
    fetchInternshipRecommendationsForText(preset.text);
    fetchResumeAnalysisForText(preset.text, preset.name);
  };

  const handleClearResume = () => {
    setResumeText('');
    setResumeFileName('');
    setCustomQuestion('');
    setAiAnswer('');
    setInternships([]);
    setResumeAnalysis(null);
    setResumeError('');
    setChatHistory([
      {
        sender: 'assistant',
        text: "👋 AI Career Consultant reset. I'm ready to advise you! Drop a resume above to unlock tailored score analysis, or ask me any career/interview/internship question right here!",
        timestamp: new Date()
      }
    ]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.png', '.jpeg', '.jpg'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension) && !file.type.startsWith('image/')) {
      setResumeError("Invalid file type. Only PDF, Word (.docx/.doc), Text (.txt), and Images (.png/.jpeg) are supported.");
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `❌ **Upload failed:** "${file.name}" is not a supported file format. Please upload a PDF, Word (.docx/.doc), Text (.txt), or Image (.png/.jpeg) file.`,
          timestamp: new Date()
        }
      ]);
      return;
    }

    setResumeFileName(file.name);
    setResumeError('');

    setChatHistory(prev => [
      ...prev,
      {
        sender: 'assistant',
        text: `📁 Received file: **${file.name}**. Parsing and analyzing details...`,
        timestamp: new Date()
      }
    ]);
    
    // If it's a txt file, read it
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          setResumeText(text);
          fetchInternshipRecommendationsForText(text);
          fetchResumeAnalysisForText(text, file.name);
        } else {
          setResumeError("The uploaded file is empty.");
        }
      };
      reader.readAsText(file);
    } else {
      // PDF or DOCX binary parsing simulation
      const cleanedName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      const generatedCVText = `Parsed from Uploaded CV: ${file.name}
Candidate Name: ${cleanedName}
File Size: ${(file.size / 1024).toFixed(1)} KB
Summary: Energetic candidate seeking high-impact technology internships. Proficient in engineering web applications and analyzing solutions.
Keywords: React, Node.js, Express, TypeScript, Python, Javascript, SQL, Git, API Design, Tailwind CSS.`;
      
      setResumeText(generatedCVText);
      fetchInternshipRecommendationsForText(generatedCVText);
      fetchResumeAnalysisForText(generatedCVText, file.name);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('resume-file-input')?.click();
  };

  const handleAskQuestion = async (question: string) => {
    const trimmedQ = question.trim();
    if (!trimmedQ) return;

    // Append the user's question to the chat history
    setChatHistory(prev => [
      ...prev,
      {
        sender: 'user',
        text: trimmedQ,
        timestamp: new Date()
      }
    ]);
    
    setIsResumeLoading(true);
    setLastQuestion(trimmedQ);
    setResumeError('');
    setCustomQuestion('');
    
    try {
      const response = await fetch('/api/ai/resume-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeText: resumeText || "No resume uploaded yet (general career consulting and guidance session)", 
          question: trimmedQ 
        })
      });
      if (!response.ok) throw new Error('Failed to fetch AI answer');
      const data = await response.json();
      
      // Append internAi's response to the chat history
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: data.answer,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      setResumeError('Failed to get answer from internAi. Please check server or retry.');
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: "❌ I apologize, but I failed to get an answer from internAi. Please check the backend connection and try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsResumeLoading(false);
    }
  };

  const fetchInternshipRecommendationsForText = async (text: string) => {
    setIsInternshipsLoading(true);
    try {
      const response = await fetch('/api/ai/resume-internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text })
      });
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      setInternships(data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInternshipsLoading(false);
    }
  };

  const fetchInternshipRecommendations = () => {
    if (!resumeText) return;
    fetchInternshipRecommendationsForText(resumeText);
    setShowInternshipsModal(true);
  };

  // AI Drafting State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showAiHelper, setShowAiHelper] = useState(false);

  // Comments state per post
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

  // Preset images for attachments to make it easy/visual
  const presetImages = [
    { name: 'Workspace', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&h=300&q=80' },
    { name: 'Developer Desk', url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=500&h=300&q=80' },
    { name: 'Collaboration', url: 'https://images.unsplash.com/photo-1531535934202-f0d44431dfec?auto=format&fit=crop&w=500&h=300&q=80' },
    { name: 'Brainstorm', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&h=300&q=80' }
  ];

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setShowAiHelper(false);
    setAiError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPostContent('');
    setAttachedImage('');
    setAiPrompt('');
  };

  const handleDraftWithAi = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Please describe the topic first.');
      return;
    }
    setIsAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/ai/post-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, tone: aiTone })
      });
      if (!response.ok) throw new Error('AI drafting failed.');
      const data = await response.json();
      setPostContent(data.draft || '');
      setShowAiHelper(false);
    } catch (err) {
      setAiError('Error communicating with AI Assistant. Try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmitPost = () => {
    if (!postContent.trim() && !attachedImage) return;
    onCreatePost(postContent, attachedImage || undefined);
    handleCloseModal();
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInput[postId];
    if (!text || !text.trim()) return;
    onAddComment(postId, text);
    setCommentInput(prev => ({ ...prev, [postId]: '' }));
  };

  // Filter posts based on global search
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(query) ||
      post.authorName.toLowerCase().includes(query) ||
      post.authorHeadline.toLowerCase().includes(query) ||
      (post.tags && post.tags.some(t => t.toLowerCase().includes(query)))
    );
  });

  return (
    <div className="flex flex-col gap-4 w-full" id="ln-feed-container">
      {/* AI CV/Resume Consultant Panel */}
      <div className="liquid-glass-card rounded-2xl p-7 md:p-8 shadow-md flex flex-col gap-6 animate-fadeIn" id="ln-feed-resume-ai-widget">
          <div className="flex justify-between items-center pb-3 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="text-indigo-400">
                <AiIcon className="w-7 h-7 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-extrabold text-slate-100 mt-1">RESUME DASHBOARD</h2>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {resumeText && (
                <button 
                  onClick={handleClearResume}
                  className="text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

        {/* Upload or Select Resume area */}
        {!resumeText ? (
          <div className="flex flex-col gap-4">
            <div 
              onDragOver={handleDrag} 
              onDragLeave={handleDrag} 
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-xl p-7 md:p-8 text-center cursor-pointer transition-all ${
                dragActive ? 'border-indigo-400 bg-indigo-500/15' : 'border-slate-400/35 hover:border-indigo-400/70 hover:bg-slate-900/70'
              }`}
            >
              <input 
                type="file" 
                id="resume-file-input" 
                accept=".pdf,.docx,.doc,.txt,image/png,image/jpeg,image/jpg" 
                className="hidden" 
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-slate-900/80 text-slate-100 rounded-full border border-slate-400/20">
                  <FileUp className="w-7 h-7 text-slate-100" />
                </div>
                <p className="text-sm md:text-base font-bold text-slate-100">Drag & drop your Resume here</p>
                <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">or click to browse from files</p>
              </div>
            </div>

            {/* Quick Presets for Demo */}
            <div className="flex flex-col gap-3 bg-slate-900/70 p-4 rounded-xl border border-slate-400/20">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                ⚡ Don't have a file? Select an expert template to test instantly:
              </span>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => handleLoadPreset('frontend')}
                  className="p-3 text-left bg-slate-800/80 hover:bg-slate-700/90 border border-slate-400/20 rounded-lg transition-colors text-xs md:text-sm font-bold text-slate-100 flex flex-col gap-1 shadow-3xs cursor-pointer"
                >
                  <span className="text-indigo-400 font-black text-xs">Frontend Dev</span>
                  <span className="text-[10px] text-slate-300 font-semibold">React, TS, Tailwind</span>
                </button>
                <button 
                  onClick={() => handleLoadPreset('ai')}
                  className="p-3 text-left bg-slate-800/80 hover:bg-slate-700/90 border border-slate-400/20 rounded-lg transition-colors text-xs md:text-sm font-bold text-slate-100 flex flex-col gap-1 shadow-3xs cursor-pointer"
                >
                  <span className="text-indigo-400 font-black text-xs">AI Engineer</span>
                  <span className="text-[10px] text-slate-300 font-semibold">Python, internAi API</span>
                </button>
                <button 
                  onClick={() => handleLoadPreset('fullstack')}
                  className="p-3 text-left bg-slate-800/80 hover:bg-slate-700/90 border border-slate-400/20 rounded-lg transition-colors text-xs md:text-sm font-bold text-slate-100 flex flex-col gap-1 shadow-3xs cursor-pointer"
                >
                  <span className="text-indigo-400 font-black text-xs">Full Stack</span>
                  <span className="text-[10px] text-slate-300 font-semibold">Node.js, Express</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 animate-fadeIn">
            {/* Loaded Status Bar */}
            <div className="bg-slate-900/70 border border-slate-400/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4 shadow-3xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-lg shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-100 truncate">{resumeFileName}</p>
                  <p className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                    Verified with internAi Insights
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => handleClearResume()}
                className="text-xs font-extrabold uppercase tracking-widest text-slate-300 hover:text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-md transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Analysis Section */}
            {isAnalysisLoading ? (
              <div className="flex flex-col items-center justify-center p-10 bg-slate-900/70 border border-slate-400/20 rounded-xl gap-4 animate-pulse">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest text-center">internAi is analyzing your resume metrics and score...</span>
              </div>
            ) : resumeAnalysis ? (
              <div className="flex flex-col gap-5">
                {/* Score & Vibe & Summary Header */}
                <div className="flex flex-col sm:flex-row gap-5 items-center bg-slate-900/70 p-5 border border-slate-400/20 rounded-xl shadow-4xs">
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-indigo-600 transition-all duration-1000"
                        strokeDasharray={`${resumeAnalysis.overallScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-900 leading-none">{resumeAnalysis.overallScore}</span>
                      <span className="text-[9px] font-extrabold text-slate-300 uppercase tracking-wider mt-0.5">Rating</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                      ✨ {resumeAnalysis.industryVibe}
                    </div>
                    <p className="text-sm text-slate-200 font-bold leading-relaxed">
                      {resumeAnalysis.summary}
                    </p>
                  </div>
                </div>

                {/* Categories scores breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resumeAnalysis.categories?.map((cat: any) => (
                    <div key={cat.name} className="bg-slate-900/70 p-4 border border-slate-400/20 rounded-xl shadow-4xs flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{cat.name}</span>
                          <span className="text-xs font-black text-indigo-600">{cat.score}/100</span>
                        </div>
                        <div className="w-full bg-slate-200/40 rounded-full h-1.5">
                          <div 
                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${cat.score}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed font-semibold">{cat.feedback}</p>
                    </div>
                  ))}
                </div>

                {/* Strengths & Improvements Bento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-emerald-950/50 border border-emerald-400/20 rounded-xl p-4 md:p-5">
                    <h4 className="text-xs font-extrabold text-emerald-200 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Key Strengths
                    </h4>
                    <ul className="flex flex-col gap-2.5">
                      {resumeAnalysis.strengths?.map((str: string, index: number) => (
                        <li key={index} className="text-[11px] md:text-xs text-emerald-100 font-bold leading-relaxed flex gap-2 items-start">
                          <span className="text-emerald-500 text-sm shrink-0 mt-0.5">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas of Improvement */}
                  <div className="bg-amber-950/50 border border-amber-400/20 rounded-xl p-4 md:p-5">
                    <h4 className="text-xs font-extrabold text-amber-200 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Improvement Plan
                    </h4>
                    <ul className="flex flex-col gap-2.5">
                      {resumeAnalysis.improvements?.map((imp: string, index: number) => (
                        <li key={index} className="text-[11px] md:text-xs text-amber-100 font-bold leading-relaxed flex gap-2 items-start">
                          <span className="text-amber-500 text-sm shrink-0 mt-0.5">→</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggested roles list and matching */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-xl border border-slate-400/20">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Top Targets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeAnalysis.suggestedRoles?.map((role: string) => (
                        <span key={role} className="text-[11px] font-extrabold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={fetchInternshipRecommendations}
                    disabled={isInternshipsLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest py-2.5 px-4 rounded-full cursor-pointer flex items-center gap-1.5 transition-all shadow-3xs shrink-0 self-end sm:self-auto font-bold"
                  >
                    {isInternshipsLoading ? 'Matching...' : 'View Open Internships'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Unified, Conversational AI Chat Module */}
        <div className="flex flex-col gap-4 border-t border-slate-100/30 pt-4">
          {/* Quick Suggestions Strip */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">Quick Suggestions:</span>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleAskQuestion(resumeText ? "What specific technical skills should I add to my resume?" : "What technical skills are recruiters looking for in full-stack interns?")}
                disabled={isResumeLoading || isAnalysisLoading}
                className="py-2.5 px-1.5 bg-slate-900/70 hover:bg-slate-800/90 border border-slate-400/20 rounded-xl text-[10px] md:text-xs font-bold text-slate-100 text-center transition-all shadow-3xs cursor-pointer line-clamp-1 disabled:opacity-50"
              >
                🛠️ Skill Strategy
              </button>
              <button 
                onClick={() => handleAskQuestion(resumeText ? "Give me a mock interview challenge tailored for my resume" : "Give me a mock behavior interview question for junior engineers")}
                disabled={isResumeLoading || isAnalysisLoading}
                className="py-2.5 px-1.5 bg-slate-900/70 hover:bg-slate-800/90 border border-slate-400/20 rounded-xl text-[10px] md:text-xs font-bold text-slate-100 text-center transition-all shadow-3xs cursor-pointer line-clamp-1 disabled:opacity-50"
              >
                🎯 Interview Prep
              </button>
              <button 
                onClick={() => handleAskQuestion(resumeText ? "Rephrase my accomplishment points to have maximum impact" : "What is the best format for a junior resume?")}
                disabled={isResumeLoading || isAnalysisLoading}
                className="py-2.5 px-1.5 bg-slate-900/70 hover:bg-slate-800/90 border border-slate-400/20 rounded-xl text-[10px] md:text-xs font-bold text-slate-100 text-center transition-all shadow-3xs cursor-pointer line-clamp-1 disabled:opacity-50"
              >
                📝 CV Optimizer
              </button>
            </div>
          </div>

          {/* Chat History bubble stream */}
          <div 
            className={`flex flex-col gap-3 overflow-y-auto pr-1 border border-slate-400/20 rounded-xl bg-slate-950/70 shadow-inner scrollbar-thin transition-all duration-300 ${
              (chatHistory.length > 0 || isResumeLoading)
                ? 'p-4 min-h-[360px] max-h-[440px]'
                : 'p-0 h-0 border-none opacity-0 overflow-hidden'
            }`} 
            id="ln-feed-ai-chat-history"
          >
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`flex flex-col max-w-[85%] rounded-2xl px-4 py-3 text-sm font-semibold leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600/95 text-white self-end rounded-tr-none shadow-3xs' 
                    : 'bg-slate-900/90 text-slate-100 self-start border border-slate-400/20 rounded-tl-none shadow-3xs'
                }`}
              >
                <div className="prose prose-sm max-w-none text-inherit whitespace-pre-wrap leading-relaxed font-semibold">
                  {msg.text}
                </div>
                <span className={`text-[10px] mt-2 self-end ${msg.sender === 'user' ? 'text-indigo-100' : 'text-slate-400 font-medium'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isResumeLoading && (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-400/20 text-slate-200 self-start rounded-2xl rounded-tl-none px-4 py-3 text-sm font-semibold shadow-3xs animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>internAi is thinking...</span>
              </div>
            )}
          </div>

          {/* The AI Chat Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder={resumeText ? "Ask internAi anything else about this resume..." : "Ask internAi any career, skill, or resume prep question..."} 	
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion(customQuestion)}
                className="w-full liquid-glass-input rounded-xl px-4.5 py-3 text-sm font-semibold text-slate-100 outline-none pr-12 shadow-3xs border border-slate-400/20 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all"
                disabled={isResumeLoading || isAnalysisLoading}
              />
              <button 
                onClick={() => handleAskQuestion(customQuestion)}
                disabled={isResumeLoading || !customQuestion.trim() || isAnalysisLoading}
                className="absolute right-2 top-2 p-2 text-indigo-300 hover:bg-indigo-500/15 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {resumeError && (
            <p className="text-xs text-red-500 font-semibold ml-1">{resumeError}</p>
          )}
        </div>
      </div>

      {/* Career & Profile Performance Insights Widget */}
      {!searchQuery && (
        <div className="liquid-glass-card rounded-xl shadow-sm flex flex-col overflow-hidden animate-fadeIn" id="ln-feed-performance-insights">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/20">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Your Analytics</h3>
                <h2 className="text-sm font-extrabold text-slate-800 mt-1">Profile & Network Performance</h2>
              </div>
            </div>
            
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              Live Insights
            </span>
          </div>

          {/* Performance Summary Metrics Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-500/30 bg-slate-950/70">
            {/* Tab 1: Profile Views */}
            <button
              onClick={() => { setPerformanceMetric('views'); setHoveredDayIndex(null); }}
              className={`p-3 text-left border-r border-slate-700/50 transition-all duration-200 cursor-pointer flex flex-col gap-1 rounded-t-2xl ${
                performanceMetric === 'views' ? 'bg-slate-900/85 border-b-2 border-b-indigo-500' : 'hover:bg-slate-900/80'
              }`}
            >
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-300" /> Views
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-black text-slate-100">156</span>
                <span className="text-[9px] font-extrabold text-emerald-300 flex items-center">
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +24%
                </span>
              </div>
              <span className="text-[8px] text-slate-400 font-medium">Last 7 days</span>
            </button>

            {/* Tab 2: Post Engagement */}
            <button
              onClick={() => { setPerformanceMetric('engagements'); setHoveredDayIndex(null); }}
              className={`p-3 text-left border-r border-slate-700/50 transition-all duration-200 cursor-pointer flex flex-col gap-1 rounded-t-2xl ${
                performanceMetric === 'engagements' ? 'bg-slate-900/85 border-b-2 border-b-indigo-500' : 'hover:bg-slate-900/80'
              }`}
            >
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-300" /> Engagements
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-black text-slate-100">344</span>
                <span className="text-[9px] font-extrabold text-emerald-300 flex items-center">
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +42%
                </span>
              </div>
              <span className="text-[8px] text-slate-400 font-medium">Last 7 days</span>
            </button>

            {/* Tab 3: Search Appearances */}
            <button
              onClick={() => { setPerformanceMetric('searches'); setHoveredDayIndex(null); }}
              className={`p-3 text-left transition-all duration-200 cursor-pointer flex flex-col gap-1 rounded-t-2xl ${
                performanceMetric === 'searches' ? 'bg-slate-900/85 border-b-2 border-b-indigo-500' : 'hover:bg-slate-900/80'
              }`}
            >
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-300" /> Searches
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-black text-slate-100">67</span>
                <span className="text-[9px] font-extrabold text-indigo-300 flex items-center">
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +18%
                </span>
              </div>
              <span className="text-[8px] text-slate-400 font-medium">Last 7 days</span>
            </button>
          </div>

          {/* Interactive Sparkline Chart Workspace */}
          <div className="p-4 flex flex-col gap-3 bg-slate-950/75 border border-slate-400/20 rounded-3xl shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              <span>Weekly Trend ({performanceMetric === 'views' ? 'Profile Views' : performanceMetric === 'engagements' ? 'Engagements' : 'Search Appearances'})</span>
              <span className="text-indigo-300 font-extrabold">Hover over data points</span>
            </div>

            {/* SVG Interactive Chart */}
            <div className="relative h-28 w-full bg-slate-900/85 border border-slate-500/30 rounded-2xl p-3 flex flex-col justify-between overflow-hidden">
              {/* Tooltip Overlay */}
              <AnimatePresence>
                {hoveredDayIndex !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md z-10"
                  >
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                    <span>
                      {['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'][hoveredDayIndex]}:{' '}
                      <strong className="font-extrabold text-indigo-200">
                        {performanceMetric === 'views' 
                          ? [12, 18, 15, 24, 30, 22, 35][hoveredDayIndex]
                          : performanceMetric === 'engagements'
                          ? [32, 45, 28, 55, 64, 48, 72][hoveredDayIndex]
                          : [5, 8, 4, 12, 15, 9, 14][hoveredDayIndex]}
                      </strong>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chart Line with SVG */}
              <div className="w-full h-16 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="5" x2="100" y2="5" stroke="rgba(148, 163, 184, 0.36)" strokeWidth="0.75" strokeDasharray="2,2" />
                  <line x1="0" y1="15" x2="100" y2="15" stroke="rgba(148, 163, 184, 0.36)" strokeWidth="0.75" strokeDasharray="2,2" />
                  <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(148, 163, 184, 0.36)" strokeWidth="0.75" strokeDasharray="2,2" />

                  {/* Gradient Fill under the line */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.04" />
                    </linearGradient>
                  </defs>

                  {/* Path rendering based on state */}
                  {performanceMetric === 'views' && (
                    <>
                      <path 
                        d="M 0 25 Q 16.6 20 16.6 18 T 33.3 22 T 50 12 T 66.6 8 T 83.3 14 T 100 3" 
                        fill="none" 
                        stroke="#8b5cf6" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M 0 25 Q 16.6 20 16.6 18 T 33.3 22 T 50 12 T 66.6 8 T 83.3 14 T 100 3 L 100 30 L 0 30 Z" 
                        fill="url(#chartGradient)" 
                      />
                    </>
                  )}

                  {performanceMetric === 'engagements' && (
                    <>
                      <path 
                        d="M 0 20 Q 16.6 12 16.6 14 T 33.3 22 T 50 8 T 66.6 4 T 83.3 12 T 100 2" 
                        fill="none" 
                        stroke="#38bdf8" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <linearGradient id="chartGradientEng" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
                      </linearGradient>
                      <path 
                        d="M 0 20 Q 16.6 12 16.6 14 T 33.3 22 T 50 8 T 66.6 4 T 83.3 12 T 100 2 L 100 30 L 0 30 Z" 
                        fill="url(#chartGradientEng)" 
                      />
                    </>
                  )}

                  {performanceMetric === 'searches' && (
                    <>
                      <path 
                        d="M 0 24 Q 16.6 18 16.6 18 T 33.3 26 T 50 10 T 66.6 6 T 83.3 14 T 100 4" 
                        fill="none" 
                        stroke="#60a5fa" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M 0 24 Q 16.6 18 16.6 18 T 33.3 26 T 50 10 T 66.6 6 T 83.3 14 T 100 4 L 100 30 L 0 30 Z" 
                        fill="url(#chartGradient)" 
                      />
                    </>
                  )}
                </svg>

                {/* Hover Interaction Areas */}
                <div className="absolute inset-0 flex">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                    <div 
                      key={dayIndex}
                      onMouseEnter={() => setHoveredDayIndex(dayIndex)}
                      onMouseLeave={() => setHoveredDayIndex(null)}
                      className="flex-1 h-full cursor-pointer relative group"
                    >
                      {/* Hover vertical alignment reference line */}
                      <div className={`absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-indigo-300/70 transition-opacity ${hoveredDayIndex === dayIndex ? 'opacity-100' : 'opacity-0'}`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day Labels */}
              <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-wider px-1">
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
              </div>
            </div>

            {/* AI Performance Tips Banner */}
            <div className="bg-slate-900/80 border border-slate-500/30 p-3 rounded-xl flex items-start gap-2">
              <AiIcon className="w-4 h-4 text-indigo-300 mt-0.5 shrink-0 animate-pulse" />
              <div className="flex-1">
                <span className="text-[8px] font-bold text-indigo-300 uppercase tracking-widest block">AI Career Optimization Tip:</span>
                <p className="text-[11px] text-slate-200 font-semibold leading-relaxed mt-0.5">
                  {performanceMetric === 'views' && "Your profile views surged by 24% after loading your resume! Recruiters looking for 'React Developer' are visiting your timeline."}
                  {performanceMetric === 'engagements' && "Posting updates about fullstack projects and cloud frameworks is earning high visibility from engineering leaders."}
                  {performanceMetric === 'searches' && "You are appearing in recruiter search filters because your resume features hot keywords: TypeScript, Node.js, and Express."}
                </p>
              </div>
            </div>

            {/* Interactive Boost Buttons */}
            <div className="flex items-center gap-2 mt-1">
              <button 
                onClick={() => handleAskQuestion("Give me suggestions on how to improve my profile views and stand out to recruiters")}
                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-extrabold uppercase tracking-widest rounded-lg shadow-3xs cursor-pointer text-center transition-all"
              >
                Boost Reach With AI
              </button>
              <button 
                onClick={() => {
                  setChatHistory(prev => [
                    ...prev,
                    {
                      sender: 'assistant',
                      text: `🚀 **Reach Boost Triggered!** I've scanned the network and generated optimization flags. 

To improve search visibility by **+35%**:
1. Add **TypeScript & Vite** to your summary profile headline.
2. Complete a short post sharing your recent fullstack achievements. 
3. Engage with our **Recommended Companies** (Google, Stripe, Airbnb) to align with talent acquirers.`,
                      timestamp: new Date()
                    }
                  ]);
                }}
                className="py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700/90 border border-slate-500/30 text-slate-100 hover:text-indigo-100 text-[9px] font-extrabold uppercase tracking-widest rounded-lg cursor-pointer transition-all"
              >
                Simulate Reach Campaign
              </button>
            </div>
          </div>
        </div>
      )}


      {/* AI ANSWER POPUP MODAL */}
      <AnimatePresence>
        {showAnswerModal && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="liquid-glass-card rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              id="ln-resume-answer-modal"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-white/30 flex justify-between items-center bg-white/20">
                <div className="flex items-center gap-2">
                  <AiIcon className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">internAi Career Assistant</h3>
                </div>
                <button 
                  onClick={() => setShowAnswerModal(false)}
                  className="p-1 hover:bg-white/30 rounded-full cursor-pointer text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1 text-slate-800 leading-relaxed text-xs">
                <div className="bg-white/30 border border-white/40 rounded-lg p-3.5 mb-4">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Your Question</span>
                  <p className="font-extrabold text-slate-900 mt-1">"{lastQuestion}"</p>
                </div>
                
                <div className="prose prose-sm max-w-none text-slate-850 whitespace-pre-wrap font-semibold">
                  {aiAnswer}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3.5 border-t border-white/30 flex justify-end bg-white/20">
                <button 
                  onClick={() => setShowAnswerModal(false)}
                  className="px-4 py-2 liquid-glass-primary-btn font-extrabold text-[11px] uppercase tracking-wider rounded-full cursor-pointer"
                >
                  Close Consultant
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERNSHIPS RECOMMENDATION MODAL */}
      <AnimatePresence>
        {showInternshipsModal && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="liquid-glass-card rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              id="ln-resume-internships-modal"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-white/30 flex justify-between items-center bg-white/20">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Tailored Internship Openings</h3>
                </div>
                <button 
                  onClick={() => setShowInternshipsModal(false)}
                  className="p-1 hover:bg-white/30 rounded-full cursor-pointer text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
                <div className="text-xs font-semibold text-slate-600 bg-white/20 border border-white/30 rounded-lg p-3 text-center">
                  Matched by internAi based on your professional experience and core skill stack.
                </div>
                
                {isInternshipsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Analyzing alignment profiles...</p>
                  </div>
                ) : internships.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs font-medium">
                    No recommendations available. Please select a template or upload a different resume.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {internships.map((rec, index) => (
                      <div 
                        key={index}
                        className="liquid-glass-card rounded-xl p-4 flex flex-col gap-3 transition-colors shadow-3xs"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600">{rec.company}</span>
                            <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{rec.roleTitle}</h4>
                          </div>
                          <div className="flex items-center gap-1 bg-indigo-50/50 px-2 py-1 rounded-full text-indigo-700 border border-white/30">
                            <AiIcon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black">{rec.suitabilityScore}% Match</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 font-semibold leading-relaxed bg-white/30 p-2.5 rounded-lg border border-white/20">
                          {rec.matchReason}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mr-1">Skills to Highlight:</span>
                          {rec.skillsToShowcase?.map((skill: string, sIdx: number) => (
                            <span 
                              key={sIdx}
                              className="text-[9px] font-extrabold text-slate-700 bg-white/40 border border-white/30 px-2 py-0.5 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3.5 border-t border-white/30 flex justify-between items-center bg-white/20">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by internAi</p>
                <button 
                  onClick={() => setShowInternshipsModal(false)}
                  className="px-4 py-2 liquid-glass-primary-btn font-extrabold text-[11px] uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
