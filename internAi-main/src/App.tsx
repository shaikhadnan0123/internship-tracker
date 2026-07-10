import React, { useState, useEffect } from 'react';
import { initialProfile, initialPosts, initialJobs, initialConnections, initialConversations, initialNotifications } from './mockData';
import { Profile, Post, Job, Connection, Conversation, Notification, Comment, Message, Application, ApplicationStats, BenchmarkResult } from './types';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import JobsView from './components/JobsView';
import NotificationsView from './components/NotificationsView';
import ProfileView from './components/ProfileView';
import LandingPage from './components/LandingPage';
import TrackerView from './components/TrackerView';
import GcpFreeTierView from './components/GcpFreeTierView';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X, Bell, Building2, ChevronRight, Loader2 } from 'lucide-react';
import { auth, db, secureFetch } from './firebase';
import { onAuthStateChanged, signOut, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info';
}

export default function App() {
  // Authentication status
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('intern_is_logged_in') === 'true';
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Navigation active view
  const [activeView, setActiveView] = useState<string>('feed');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Floating Toasts state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Internship Tracker states
  const [applications, setApplications] = useState<Application[]>([]);
  const [trackerStats, setTrackerStats] = useState<ApplicationStats | null>(null);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [isTrackerLoading, setIsTrackerLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await secureFetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error("Error fetching applications:", e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await secureFetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setTrackerStats(data);
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  };

  const fetchBenchmark = async () => {
    try {
      const res = await secureFetch("/api/benchmark");
      if (res.ok) {
        const data = await res.json();
        setBenchmarkResult(data);
      }
    } catch (e) {
      console.error("Error fetching benchmark:", e);
    }
  };

  const loadTrackerData = async () => {
    setIsTrackerLoading(true);
    await Promise.all([fetchApplications(), fetchStats(), fetchBenchmark()]);
    setIsTrackerLoading(false);
  };

  useEffect(() => {
    if (activeView === 'tracker') {
      loadTrackerData();
    }
  }, [activeView]);

  const handleAddApplication = async (data: {
    company: string;
    role: string;
    platform: string;
    status: string;
    job_description: string;
  }) => {
    setIsActionLoading(true);
    try {
      const res = await secureFetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add application");
      }
      addToast(`Application for ${data.company} added and scored successfully!`, "success");
      // Reload applications list & statistics
      await Promise.all([fetchApplications(), fetchStats()]);
    } catch (e: any) {
      console.error("Error adding application:", e);
      addToast(e.message || "Failed to add application", "info");
      throw e;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRunBenchmark = async () => {
    setIsActionLoading(true);
    try {
      const res = await secureFetch("/api/benchmark/run", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") {
          setBenchmarkResult(data.results);
          addToast(`Benchmark completed! GPU Speedup: ${data.results.speedup.toFixed(1)}x faster.`, "success");
        } else {
          throw new Error(data.error || "Execution failed");
        }
      } else {
        throw new Error("HTTP error running benchmark");
      }
    } catch (e: any) {
      console.error("Error running benchmark:", e);
      addToast(e.message || "Failed to run CPU vs GPU benchmark", "info");
    } finally {
      setIsActionLoading(false);
    }
  };

  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsEmailVerified(user.emailVerified);
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as Profile);
          } else {
            // Profile doesn't exist, create a default profile using user auth info
            const defaultProfile: Profile = {
              name: user.displayName || user.email?.split('@')[0] || 'User',
              headline: 'AI Professional / Student',
              avatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
              banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
              location: 'San Francisco, CA',
              connectionsCount: 0,
              about: 'Welcome to your career workspace profile! Fill out details or ask the AI Coach to optimize it.',
              skills: ['React', 'JavaScript', 'TypeScript'],
              experience: [],
              education: []
            };
            await setDoc(docRef, defaultProfile);
            setProfile(defaultProfile);
          }
          setIsLoggedIn(true);
          localStorage.setItem('intern_is_logged_in', 'true');
        } catch (error) {
          console.error("Firestore user fetch/create error:", error);
        }
      } else {
        setIsLoggedIn(false);
        setIsEmailVerified(true);
        localStorage.removeItem('intern_is_logged_in');
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (registeredData?: any) => {
    setIsLoggedIn(true);
    localStorage.setItem('intern_is_logged_in', 'true');
    if (registeredData) {
      addToast(`Welcome to internAi, ${registeredData.name}!`);
    } else {
      addToast("Welcome back to internAi!");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      localStorage.removeItem('intern_is_logged_in');
      addToast("Logged out successfully.", "info");
    } catch (error) {
      addToast("Failed to log out. Please try again.", "info");
    }
  };

  // Persistent States
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('ln_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('ln_posts');
    const loaded = saved ? JSON.parse(saved) : initialPosts;
    return loaded.filter((p: any) => p.id !== 'post_2');
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('ln_jobs');
    return saved ? JSON.parse(saved) : initialJobs;
  });

  const [connections, setConnections] = useState<Connection[]>(() => {
    const saved = localStorage.getItem('ln_connections');
    return saved ? JSON.parse(saved) : initialConnections;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('ln_conversations');
    return saved ? JSON.parse(saved) : initialConversations;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('ln_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [activeConvId, setActiveConvId] = useState<string>(() => {
    const saved = localStorage.getItem('ln_activeConvId');
    return saved || 'conv_1';
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('ln_profile', JSON.stringify(profile));
    const user = auth.currentUser;
    if (user) {
      const syncProfile = async () => {
        try {
          await setDoc(doc(db, 'users', user.uid), profile);
        } catch (error) {
          console.error("Failed to sync profile to Firestore:", error);
        }
      };
      syncProfile();
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('ln_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('ln_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('ln_connections', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem('ln_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('ln_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ln_activeConvId', activeConvId);
  }, [activeConvId]);

  // Toast Helpers
  const addToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // POST HANDLERS
  const handleLikePost = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id !== postId) return p;
        const alreadyLiked = p.likes.includes("Somnath Das");
        const updatedLikes = alreadyLiked
          ? p.likes.filter(name => name !== "Somnath Das")
          : [...p.likes, "Somnath Das"];
        return { ...p, likes: updatedLikes };
      })
    );
  };

  const handleAddComment = (postId: string, content: string) => {
    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      authorName: profile.name,
      authorAvatar: profile.avatar,
      authorHeadline: profile.headline,
      content,
      timestamp: "Just now"
    };

    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id !== postId) return p;
        return { ...p, comments: [newComment, ...p.comments] };
      })
    );
    addToast("Comment published successfully!");
  };

  const handleSharePost = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id !== postId) return p;
        return { ...p, sharesCount: p.sharesCount + 1 };
      })
    );
    addToast("Post shared with your connection network!", "success");
  };

  const handleCreatePost = (content: string, image?: string) => {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorName: profile.name,
      authorHeadline: profile.headline,
      authorAvatar: profile.avatar,
      content,
      image,
      likes: [],
      comments: [],
      sharesCount: 0,
      timestamp: "Just now"
    };

    setPosts(prev => [newPost, ...prev]);
    addToast("Your post was successfully published!");
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    addToast("Post deleted successfully.");
  };

  const handleDeleteAllPosts = () => {
    setPosts([]);
    addToast("All posts deleted successfully.");
  };

  // CONNECTION HANDLERS
  const handleAcceptInvitation = (inviteId: string) => {
    // 1. Move state to 'connected'
    setConnections(prev =>
      prev.map(c => (c.id === inviteId ? { ...c, status: 'connected' } : c))
    );
    
    // 2. Remove from notification indicators if relevant
    setNotifications(prev =>
      prev.filter(n => !(n.type === 'connection_request' && n.id === inviteId))
    );

    // 3. Create a welcoming notification alert
    const acceptedPerson = connections.find(c => c.id === inviteId);
    if (acceptedPerson) {
      const welcomeNotification: Notification = {
        id: `notif_accept_${Date.now()}`,
        type: 'connection_accept',
        senderName: acceptedPerson.name,
        senderAvatar: acceptedPerson.avatar,
        senderHeadline: acceptedPerson.headline,
        text: "and you are now connected. Say hello!",
        timestamp: "Just now",
        read: false
      };
      setNotifications(prev => [welcomeNotification, ...prev]);
      
      // 4. Create initial empty message thread
      const exists = conversations.some(c => c.participant.id === inviteId);
      if (!exists) {
        const newConv: Conversation = {
          id: `conv_${Date.now()}`,
          participant: acceptedPerson,
          messages: [
            {
              id: `init_${Date.now()}`,
              senderId: inviteId,
              text: `Thanks for accepting my connection request, Somnath! Excited to connect.`,
              timestamp: "Just now"
            }
          ],
          unread: true
        };
        setConversations(prev => [newConv, ...prev]);
      }
    }
    
    addToast("Invitation accepted! Connection established.");
  };

  const handleIgnoreInvitation = (inviteId: string) => {
    setConnections(prev =>
      prev.map(c => (c.id === inviteId ? { ...c, status: 'suggested' } : c))
    );
    addToast("Invitation ignored. Person moved to suggestions.");
  };

  const handleSendConnectionRequest = (suggestId: string) => {
    setConnections(prev =>
      prev.map(c => (c.id === suggestId ? { ...c, status: 'pending_sent' } : c))
    );
    addToast("Connection invitation sent successfully!");
  };

  // JOB HANDLERS
  const handleApplyJob = (jobId: string) => {
    setJobs(prevJobs =>
      prevJobs.map(j => (j.id === jobId ? { ...j, applied: true } : j))
    );
    
    // Add success notification
    const selectedJobObj = jobs.find(j => j.id === jobId);
    if (selectedJobObj) {
      const jobNotif: Notification = {
        id: `notif_job_${Date.now()}`,
        type: 'job_alert',
        senderName: selectedJobObj.company,
        senderAvatar: selectedJobObj.logo,
        text: `received your application for the '${selectedJobObj.title}' position. Tracking in Progress.`,
        timestamp: "Just now",
        read: false
      };
      setNotifications(prev => [jobNotif, ...prev]);
    }
    addToast("Application submitted successfully!", "success");
  };

  // MESSAGING HANDLERS
  const handleSendMessage = (convId: string, text: string) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      text,
      timestamp: "Just now"
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      })
    );
  };

  const handleReceiveAiReply = (convId: string, replyText: string) => {
    const aiMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'ai', // partner id
      text: replyText,
      timestamp: "Just now"
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: [...c.messages, aiMsg],
          unread: true
        };
      })
    );
  };

  // NOTIFICATION HANDLERS
  const handleMarkAsRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast("All notifications marked as read!");
  };

  const handleDeleteNotification = (notifId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    addToast("Notification deleted.");
  };

  const activeConnectionsCount = connections.filter(c => c.status === 'connected').length;
  const unreadMessagesCount = conversations.filter(c => c.unread).length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-200" id="ln-app-auth-loading">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading your profile session...</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LandingPage onLogin={handleLogin} />
        {/* Floating toast notification bubbles container */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xl pointer-events-auto min-w-[280px]"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-100">{toast.message}</span>
                </div>
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </>
    );
  }

  if (isLoggedIn && !isEmailVerified) {
    return (
      <div className="min-h-screen bg-[#020617] bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.2),_transparent_36%)] text-slate-100 flex flex-col items-center justify-center p-6" id="ln-app-email-verification">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md liquid-glass-card rounded-2xl p-8 border border-white/10 shadow-2xl flex flex-col gap-6"
        >
          <div className="text-center">
            <h2 className="text-2xl font-black text-white tracking-tight">Verify Your Email</h2>
            <p className="text-xs text-slate-400 font-semibold mt-2">
              We've sent a verification link to <span className="text-indigo-400 font-black">{auth.currentUser?.email}</span>. Please verify your email to unlock your workspace.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={async () => {
                setIsActionLoading(true);
                try {
                  await auth.currentUser?.reload();
                  if (auth.currentUser?.emailVerified) {
                    setIsEmailVerified(true);
                    addToast("Email successfully verified! Welcome to your workspace.", "success");
                  } else {
                    addToast("Email is still not verified. Please check your inbox and click the verification link.", "info");
                  }
                } catch (e: any) {
                  addToast(`Failed to refresh status: ${e.message || e}`, "info");
                } finally {
                  setIsActionLoading(false);
                }
              }}
              disabled={isActionLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-full cursor-pointer transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : null}
              <span>I have verified my email (Check Status)</span>
            </button>

            <button
              onClick={async () => {
                if (auth.currentUser) {
                  setIsActionLoading(true);
                  try {
                    await sendEmailVerification(auth.currentUser);
                    addToast("Verification email resent. Please check your inbox.", "success");
                  } catch (e: any) {
                    addToast(`Failed to resend email: ${e.message || e}`, "info");
                  } finally {
                    setIsActionLoading(false);
                  }
                }
              }}
              disabled={isActionLoading}
              className="w-full py-3.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-black uppercase tracking-widest rounded-full cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>Resend Verification Email</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest rounded-full cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>Sign Out & Go Back</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.2),_transparent_36%)] text-slate-100 relative overflow-x-clip flex flex-col font-sans" id="ln-app-root">
      {/* Decorative Floating Fluid Liquid Glass Blobs */}
      <div className="absolute top-[-10%] left-[5%] w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-[#60a5fa]/25 to-[#c084fc]/15 blur-3xl pointer-events-none animate-fluid-one z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[50rem] h-[50rem] rounded-full bg-gradient-to-br from-[#818cf8]/20 to-[#f472b6]/10 blur-3xl pointer-events-none animate-fluid-two z-0" />
      <div className="absolute top-[40%] left-[30%] w-[35rem] h-[35rem] rounded-full bg-gradient-to-tr from-[#38bdf8]/15 to-[#818cf8]/15 blur-3xl pointer-events-none animate-fluid-three z-0" />

      {/* Universal Top Navigation Header */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadNotificationsCount={unreadNotificationsCount}
        profile={profile}
      />

      {/* Main Body Layout */}
      <main className="flex-1 pt-20 max-w-[95%] xl:max-w-[1400px] 2xl:max-w-[1600px] w-full mx-auto px-4 py-6 relative z-10 transition-all duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            {activeView === 'feed' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start" id="ln-feed-view">
                {/* Left: Snap profile & Communities summary */}
                <div className="md:col-span-1">
                  <div className="sticky top-24 self-start h-[calc(100vh-6.5rem)]">
                    <div className="h-full flex flex-col">
                      <Sidebar 
                        profile={profile} 
                        onViewProfile={() => setActiveView('profile')}
                        connectionsCount={activeConnectionsCount}
                      />
                    </div>
                  </div>
                </div>

                {/* Middle: Interactive Post Creation Feed lists */}
                <div className="md:col-span-2">
                  <Dashboard
                    posts={posts}
                    profile={profile}
                    onLikePost={handleLikePost}
                    onAddComment={handleAddComment}
                    onSharePost={handleSharePost}
                    onCreatePost={handleCreatePost}
                    onDeletePost={handleDeletePost}
                    onDeleteAllPosts={handleDeleteAllPosts}
                    searchQuery={searchQuery}
                  />
                </div>

                {/* Right: Company Recommendations Panel */}
                <div className="hidden md:block md:col-span-1">
                  <div className="sticky top-24 self-start h-[calc(100vh-6.5rem)]">
                    <div className="liquid-glass-card rounded-2xl p-5 md:p-6 shadow-md h-full flex flex-col" id="ln-feed-company-recommendations">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-500/20 mb-4 shrink-0">
                        <Building2 className="w-5.5 h-5.5 text-indigo-600" />
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Recommended Companies</h3>
                      </div>

                      <div className="flex flex-col gap-5 overflow-y-auto pr-1 flex-1 no-scrollbar">
                      {/* Recommendation 1: Google */}
                      <div className="group border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 p-4 rounded-xl transition-all duration-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-700 text-sm shrink-0 mt-0.5">
                              G
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-extrabold text-sm text-slate-950 break-words whitespace-normal leading-snug">Google</h4>
                              <p className="text-xs text-slate-500 font-medium break-words whitespace-normal leading-snug mt-0.5">Mountain View, CA</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0">
                            98% Match
                          </span>
                        </div>

                        <div className="mt-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Required Skills</span>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">React</span>
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">TypeScript</span>
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">Architecture</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => setActiveView('jobs')}
                          className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <span>View Positions</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Recommendation 2: Stripe */}
                      <div className="group border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 p-4 rounded-xl transition-all duration-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center font-black text-indigo-700 text-sm shrink-0 mt-0.5">
                              S
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-extrabold text-sm text-slate-950 break-words whitespace-normal leading-snug">Stripe</h4>
                              <p className="text-xs text-slate-500 font-medium break-words whitespace-normal leading-snug mt-0.5">San Francisco, CA</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full shrink-0">
                            95% Match
                          </span>
                        </div>

                        <div className="mt-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Required Skills</span>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">Node.js</span>
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">Express</span>
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">TypeScript</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => setActiveView('jobs')}
                          className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <span>View Positions</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Recommendation 3: Airbnb */}
                      <div className="group border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 p-4 rounded-xl transition-all duration-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center font-black text-red-600 text-sm shrink-0 mt-0.5">
                              A
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-extrabold text-sm text-slate-950 break-words whitespace-normal leading-snug">Airbnb</h4>
                              <p className="text-xs text-slate-500 font-medium break-words whitespace-normal leading-snug mt-0.5">Remote Friendly</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full shrink-0">
                            92% Match
                          </span>
                        </div>

                        <div className="mt-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Required Skills</span>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">Tailwind CSS</span>
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">React</span>
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">UI/UX</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => setActiveView('jobs')}
                          className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-600 py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <span>View Positions</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {activeView === 'jobs' && (
              <div id="ln-jobs-view">
                <JobsView
                  jobs={jobs}
                  profile={profile}
                  onApplyJob={handleApplyJob}
                  searchQuery={searchQuery}
                />
              </div>
            )}

            {activeView === 'tracker' && (
              <div id="ln-tracker-view">
                <TrackerView
                  applications={applications}
                  stats={trackerStats}
                  benchmark={benchmarkResult}
                  isLoading={isTrackerLoading}
                  isActionLoading={isActionLoading}
                  onAddApplication={handleAddApplication}
                  onRunBenchmark={handleRunBenchmark}
                />
              </div>
            )}

            {activeView === 'notifications' && (
              <div id="ln-notifications-view">
                <NotificationsView
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDeleteNotification={handleDeleteNotification}
                  searchQuery={searchQuery}
                />
              </div>
            )}

            {activeView === 'profile' && (
              <div id="ln-profile-view">
                <ProfileView
                  profile={profile}
                  onUpdateProfile={setProfile}
                  connectionsCount={activeConnectionsCount}
                  onLogout={handleLogout}
                />
              </div>
            )}

            {activeView === 'gcp' && (
              <div id="ln-gcp-view">
                <GcpFreeTierView />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating toast notification bubbles container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xl pointer-events-auto min-w-[280px]"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-100">{toast.message}</span>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
