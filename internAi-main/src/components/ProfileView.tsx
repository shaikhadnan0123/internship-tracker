import React, { useState } from 'react';
import { Camera, MapPin, Loader2, AlertCircle, Edit3, Plus, Trash, Check, X, Award, Briefcase, GraduationCap, FileUp } from 'lucide-react';
import AiIcon from './AiIcon';
import { secureFetch } from '../firebase';
import { Profile, Experience, Education } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileViewProps {
  profile: Profile;
  onUpdateProfile: (updated: Profile) => void;
  connectionsCount: number;
  onLogout?: () => void;
}

export default function ProfileView({ profile, onUpdateProfile, connectionsCount, onLogout }: ProfileViewProps) {
  // Editing states
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Form states
  const [headerForm, setHeaderForm] = useState({
    name: profile.name,
    headline: profile.headline,
    location: profile.location
  });
  const [aboutForm, setAboutForm] = useState(profile.about);
  
  const [newExp, setNewExp] = useState<Omit<Experience, 'id'>>({
    company: '',
    role: '',
    duration: '',
    description: ''
  });

  const [newEdu, setNewEdu] = useState<Omit<Education, 'id'>>({
    school: '',
    degree: '',
    duration: ''
  });

  const [newSkillText, setNewSkillText] = useState('');

  // AI Career Coach optimization states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    headline?: string;
    about?: string;
    experience?: string;
    skills?: string;
  } | null>(null);
  const [aiError, setAiError] = useState('');
  const [showAiCoach, setShowAiCoach] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  // Handlers
  const handleProfileResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      setAiError("Invalid file type. Only PDF, Word (.docx), and Text (.txt) are supported.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (!result) {
        setAiError("Failed to read file.");
        return;
      }
      
      const base64Data = result.split(',')[1];
      setIsAiLoading(true);
      setAiError('');
      setAiSuccessMessage('');
      
      try {
        const response = await secureFetch('/api/ai/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64Data,
            fileName: file.name,
            fileMimeType: file.type
          })
        });
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to parse resume');
        }
        
        const data = await response.json();
        const parsed = data.parsedProfile;
        
        if (parsed) {
          const updatedProfile = {
            ...profile,
            name: parsed.name || profile.name,
            headline: parsed.headline || profile.headline,
            location: parsed.location || profile.location || 'San Francisco, CA',
            about: parsed.about || profile.about,
            skills: parsed.skills && parsed.skills.length > 0 ? parsed.skills : profile.skills,
            experience: parsed.experience && parsed.experience.length > 0 ? parsed.experience.map((exp: any, i: number) => ({
              id: `exp_${Date.now()}_${i}`,
              company: exp.company || 'Unknown',
              role: exp.role || 'Developer',
              duration: exp.duration || 'N/A',
              description: exp.description || ''
            })) : profile.experience,
            education: parsed.education && parsed.education.length > 0 ? parsed.education.map((edu: any, i: number) => ({
              id: `edu_${Date.now()}_${i}`,
              school: edu.school || 'Unknown College',
              degree: edu.degree || 'Degree',
              duration: edu.duration || 'N/A'
            })) : profile.education
          };
          
          onUpdateProfile(updatedProfile);
          
          setHeaderForm({
            name: updatedProfile.name,
            headline: updatedProfile.headline,
            location: updatedProfile.location
          });
          setAboutForm(updatedProfile.about);
          
          setAiSuccessMessage("🎉 Profile successfully parsed and imported from your resume!");
          setTimeout(() => setAiSuccessMessage(''), 8000);
        } else {
          throw new Error("No parsed profile data returned.");
        }
      } catch (err: any) {
        console.error(err);
        setAiError(err.message || 'Failed to import resume. Please ensure the file contains clear text.');
      } finally {
        setIsAiLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveHeader = () => {
    onUpdateProfile({
      ...profile,
      name: headerForm.name,
      headline: headerForm.headline,
      location: headerForm.location
    });
    setIsEditingHeader(false);
  };

  const handleSaveAbout = () => {
    onUpdateProfile({
      ...profile,
      about: aboutForm
    });
    setIsEditingAbout(false);
  };

  const handleAddExp = () => {
    if (!newExp.company || !newExp.role) return;
    const added: Experience = {
      id: `exp_${Date.now()}`,
      ...newExp
    };
    onUpdateProfile({
      ...profile,
      experience: [added, ...profile.experience]
    });
    setNewExp({ company: '', role: '', duration: '', description: '' });
    setIsAddingExperience(false);
  };

  const handleDeleteExp = (id: string) => {
    onUpdateProfile({
      ...profile,
      experience: profile.experience.filter(e => e.id !== id)
    });
  };

  const handleAddEdu = () => {
    if (!newEdu.school || !newEdu.degree) return;
    const added: Education = {
      id: `edu_${Date.now()}`,
      ...newEdu
    };
    onUpdateProfile({
      ...profile,
      education: [added, ...profile.education]
    });
    setNewEdu({ school: '', degree: '', duration: '' });
    setIsAddingEducation(false);
  };

  const handleDeleteEdu = (id: string) => {
    onUpdateProfile({
      ...profile,
      education: profile.education.filter(e => e.id !== id)
    });
  };

  const handleAddSkill = () => {
    const text = newSkillText.trim();
    if (!text || profile.skills.includes(text)) return;
    onUpdateProfile({
      ...profile,
      skills: [...profile.skills, text]
    });
    setNewSkillText('');
    setIsAddingSkill(false);
  };

  const handleDeleteSkill = (skill: string) => {
    onUpdateProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skill)
    });
  };

  // Profile Optimization AI request
  const handleRequestAiOptimization = async () => {
    setIsAiLoading(true);
    setAiError('');
    setAiSuggestions(null);
    try {
      const response = await secureFetch('/api/ai/optimize-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      setAiSuggestions(data.suggestions || {});
      setShowAiCoach(true);
    } catch (err) {
      setAiError('Failed to generate AI audit. Try updating your headline or summary.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiHeadline = () => {
    if (!aiSuggestions?.headline) return;
    // Extract headline suggestion if it contains a short readable form, or apply suggestions directly
    const extracted = aiSuggestions.headline.replace(/💡|Try including.*E\.g\.,\s*/, '').replace(/['"]/g, '').split('instead')[0].trim();
    setHeaderForm(prev => ({ ...prev, headline: extracted }));
    onUpdateProfile({ ...profile, headline: extracted });
  };

  const handleApplyAiAbout = () => {
    if (!aiSuggestions?.about) return;
    const cleanedAbout = aiSuggestions.about.replace(/💡|Your 'About' section should.*E\.g\.,\s*/, '').replace(/['"]/g, '').trim();
    setAboutForm(cleanedAbout);
    onUpdateProfile({ ...profile, about: cleanedAbout });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="ln-profile-container">
      {/* Left 3 Columns: Profile timeline */}
      <div className="md:col-span-3 flex flex-col gap-4">
        {aiSuccessMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex justify-between items-center text-xs font-bold uppercase tracking-wider animate-fadeIn shadow-2xs">
            <span>{aiSuccessMessage}</span>
            <button onClick={() => setAiSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700 font-extrabold cursor-pointer">✕</button>
          </div>
        )}

        {aiError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex justify-between items-center text-xs font-bold uppercase tracking-wider animate-fadeIn shadow-2xs">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              {aiError}
            </span>
            <button onClick={() => setAiError('')} className="text-rose-500 hover:text-rose-700 font-extrabold cursor-pointer">✕</button>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative" id="ln-profile-card-header">
          {/* Rearranged Profile Avatar */}
          <div className="shrink-0" id="ln-profile-avatar-container">
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-24 h-24 rounded-full border-2 border-slate-200/80 object-cover shadow-md bg-white shrink-0"
            />
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            {isEditingHeader ? (
              <div className="flex flex-col gap-2 max-w-md mx-auto sm:mx-0">
                <input 
                  type="text" 
                  value={headerForm.name} 
                  onChange={(e) => setHeaderForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full liquid-glass-input rounded-md text-xs p-2.5 font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Full name"
                />
                <input 
                  type="text" 
                  value={headerForm.headline} 
                  onChange={(e) => setHeaderForm(prev => ({ ...prev, headline: e.target.value }))}
                  className="w-full liquid-glass-input rounded-md text-xs p-2.5 outline-none font-medium focus:ring-1 focus:ring-indigo-500"
                  placeholder="Headline"
                />
                <input 
                  type="text" 
                  value={headerForm.location} 
                  onChange={(e) => setHeaderForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full liquid-glass-input rounded-md text-xs p-2.5 outline-none font-medium focus:ring-1 focus:ring-indigo-500"
                  placeholder="Location"
                />
                <div className="flex gap-2 mt-1.5 justify-center sm:justify-start">
                  <button 
                    onClick={handleSaveHeader} 
                    className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                  <button 
                    onClick={() => setIsEditingHeader(false)} 
                    className="border border-slate-300 text-slate-500 font-bold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-full cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
                  <button 
                    onClick={() => {
                      setHeaderForm({ name: profile.name, headline: profile.headline, location: profile.location });
                      setIsEditingHeader(true);
                    }}
                    className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400 hover:text-[#0a66c2] transition-colors"
                    title="Edit header info"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-slate-700 mt-1 max-w-xl leading-relaxed font-semibold">{profile.headline}</p>
                
                <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-3">
                  <span className="flex items-center gap-0.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.location}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0 self-center sm:self-start w-full sm:w-auto">
            <input 
              type="file" 
              id="profile-resume-input" 
              className="hidden" 
              accept=".pdf,.docx,.txt" 
              onChange={handleProfileResumeUpload} 
            />
            <button 
              onClick={() => document.getElementById('profile-resume-input')?.click()}
              disabled={isAiLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-5 rounded-full flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 transition-colors w-full sm:w-auto"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Import from Resume</span>
                </>
              )}
            </button>
            <button 
              onClick={handleRequestAiOptimization}
              disabled={isAiLoading}
              className="bg-[#6d25e4] hover:bg-[#5217b7] text-white font-bold text-[10px] uppercase tracking-wider py-2 px-5 rounded-full flex items-center justify-center gap-1 shadow-sm cursor-pointer disabled:opacity-50 transition-colors w-full sm:w-auto"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <AiIcon className="w-3.5 h-3.5" />
                  <span>Optimize with AI Coach</span>
                </>
              )}
            </button>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 hover:border-red-600 font-bold text-[10px] uppercase tracking-wider py-2 px-5 rounded-full flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto cursor-pointer"
              >
                Log Out
              </button>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">About</h2>
            <button 
              onClick={() => {
                setAboutForm(profile.about);
                setIsEditingAbout(true);
              }}
              className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400 hover:text-[#0a66c2] transition-colors"
              title="Edit Summary"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {isEditingAbout ? (
            <div className="flex flex-col gap-3">
              <textarea 
                value={aboutForm}
                onChange={(e) => setAboutForm(e.target.value)}
                className="w-full min-h-[120px] liquid-glass-input rounded-md text-xs p-2.5 outline-none font-medium focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveAbout} 
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" /> Save
                </button>
                <button 
                  onClick={() => setIsEditingAbout(false)} 
                  className="border border-slate-300 text-slate-500 font-bold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-full cursor-pointer transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{profile.about}</p>
          )}
        </div>

        {/* Experience Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>Experience</span>
            </h2>
            <button 
              onClick={() => setIsAddingExperience(true)}
              className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-[#0a66c2] transition-colors"
              title="Add Experience"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Form to Add Experience */}
          <AnimatePresence>
            {isAddingExperience && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-slate-200 rounded-xl p-4 mb-4 flex flex-col gap-2.5 bg-slate-50/50"
              >
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Add Professional Role</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Company name"
                    value={newExp.company}
                    onChange={(e) => setNewExp(prev => ({ ...prev, company: e.target.value }))}
                    className="bg-white border border-slate-200 text-xs rounded-md p-2.5 font-medium outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Title / Role"
                    value={newExp.role}
                    onChange={(e) => setNewExp(prev => ({ ...prev, role: e.target.value }))}
                    className="bg-white border border-slate-200 text-xs rounded-md p-2.5 font-medium outline-none"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Duration (e.g. Jun 2021 - Present)"
                  value={newExp.duration}
                  onChange={(e) => setNewExp(prev => ({ ...prev, duration: e.target.value }))}
                  className="bg-white border border-slate-200 text-xs rounded-md p-2.5 font-medium outline-none"
                />
                <textarea 
                  placeholder="Describe accomplishments & tools used..."
                  value={newExp.description}
                  onChange={(e) => setNewExp(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white border border-slate-200 text-xs rounded-md p-2.5 font-medium min-h-[60px] outline-none"
                />
                <div className="flex gap-2 justify-end mt-1">
                  <button 
                    onClick={() => setIsAddingExperience(false)} 
                    className="border border-slate-300 text-slate-500 font-bold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-full cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddExp}
                    className="bg-[#0a66c2] text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-full cursor-pointer hover:bg-[#004182] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List of Experiences */}
          <div className="flex flex-col gap-4">
            {profile.experience.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 font-semibold">No experience items added yet.</p>
            ) : (
              profile.experience.map((exp, index) => (
                <div key={exp.id} className="flex gap-3.5 items-start relative group">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-md mt-0.5 shrink-0">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                  </div>
                  
                  <div className="flex-1 text-xs">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight tracking-tight">{exp.role}</h4>
                      <button 
                        onClick={() => handleDeleteExp(exp.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-1 cursor-pointer"
                        title="Delete Role"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-700 font-bold mt-0.5">{exp.company}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{exp.duration}</p>
                    <p className="text-slate-600 font-medium leading-relaxed mt-2 whitespace-pre-wrap">{exp.description}</p>
                  </div>
                  {index < profile.experience.length - 1 && (
                    <span className="absolute left-[17px] top-9 bottom-[-18px] w-[1px] bg-slate-200" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span>Education</span>
            </h2>
            <button 
              onClick={() => setIsAddingEducation(true)}
              className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-[#0a66c2] transition-colors"
              title="Add Education"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Form to Add Education */}
          <AnimatePresence>
            {isAddingEducation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-slate-200 rounded-xl p-4 mb-4 flex flex-col gap-2.5 bg-slate-50/50"
              >
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Add Academic Background</h4>
                <input 
                  type="text" 
                  placeholder="School / University"
                  value={newEdu.school}
                  onChange={(e) => setNewEdu(prev => ({ ...prev, school: e.target.value }))}
                  className="bg-white border border-slate-200 text-xs rounded-md p-2.5 font-medium outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Degree / Major"
                    value={newEdu.degree}
                    onChange={(e) => setNewEdu(prev => ({ ...prev, degree: e.target.value }))}
                    className="bg-white border border-slate-200 text-xs rounded-md p-2.5 font-medium outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Years (e.g. 2015 - 2019)"
                    value={newEdu.duration}
                    onChange={(e) => setNewEdu(prev => ({ ...prev, duration: e.target.value }))}
                    className="bg-white border border-slate-200 text-xs rounded-md p-2.5 font-medium outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end mt-1">
                  <button 
                    onClick={() => setIsAddingEducation(false)} 
                    className="border border-slate-300 text-slate-500 font-bold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-full cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddEdu}
                    className="bg-[#0a66c2] text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-full cursor-pointer hover:bg-[#004182] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List of Education */}
          <div className="flex flex-col gap-4">
            {profile.education.map((edu) => (
              <div key={edu.id} className="flex gap-3.5 items-start relative group">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-md mt-0.5 shrink-0">
                  <GraduationCap className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight tracking-tight">{edu.school}</h4>
                    <button 
                      onClick={() => handleDeleteEdu(edu.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 p-1 cursor-pointer"
                      title="Delete education"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-700 font-bold mt-0.5">{edu.degree}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{edu.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Award className="w-4 h-4 text-slate-400" />
              <span>Skills</span>
            </h2>
            <button 
              onClick={() => setIsAddingSkill(true)}
              className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-[#0a66c2] transition-colors"
              title="Add Skill"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Form to Add Skill */}
          <AnimatePresence>
            {isAddingSkill && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="border border-slate-200 rounded-xl p-3.5 mb-4 flex gap-2 bg-slate-50/50"
              >
                <input 
                  type="text" 
                  placeholder="Skill name (e.g., Python, Kubernetes)"
                  value={newSkillText}
                  onChange={(e) => setNewSkillText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="flex-1 bg-white border border-slate-200 text-xs rounded-md p-2.5 font-medium outline-none"
                />
                <button 
                  onClick={handleAddSkill}
                  className="bg-[#0a66c2] text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full cursor-pointer hover:bg-[#004182] transition-colors"
                >
                  Add
                </button>
                <button 
                  onClick={() => setIsAddingSkill(false)}
                  className="border border-slate-300 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skills Grid List */}
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <div 
                key={skill}
                className="group bg-slate-50 hover:bg-slate-100 text-[9.5px] font-extrabold text-slate-700 uppercase tracking-wider py-1.5 px-3.5 rounded-full flex items-center gap-1.5 transition-all border border-slate-200 shadow-3xs"
              >
                <span>{skill}</span>
                <button 
                  onClick={() => handleDeleteSkill(skill)}
                  className="text-slate-400 hover:text-red-600 transition-colors hover:scale-110 cursor-pointer"
                  title={`Remove ${skill}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right 1 Column: AI Career Coach Drawer/Feed panel */}
      <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-fit flex flex-col gap-4">
        <div className="flex items-center gap-1.5 text-purple-700 font-extrabold text-[10px] uppercase tracking-widest border-b border-slate-100 pb-2.5">
          <AiIcon className="w-4 h-4 text-[#7839ec]" />
          <span>AI Profile Coach</span>
        </div>

        {aiSuggestions ? (
          <div className="flex flex-col gap-4 text-xs">
            {aiSuggestions.headline && (
              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl shadow-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="font-extrabold text-purple-300 text-[10px] uppercase tracking-wider">Headline Tip</h4>
                  <button 
                    onClick={handleApplyAiHeadline}
                    className="text-[9px] font-bold uppercase tracking-wider bg-[#6d25e4] text-white py-1 px-3 rounded-full hover:bg-[#5217b7] cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed">{aiSuggestions.headline}</p>
              </div>
            )}

            {aiSuggestions.about && (
              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl shadow-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="font-extrabold text-purple-300 text-[10px] uppercase tracking-wider">About Tip</h4>
                  <button 
                    onClick={handleApplyAiAbout}
                    className="text-[9px] font-bold uppercase tracking-wider bg-[#6d25e4] text-white py-1 px-3 rounded-full hover:bg-[#5217b7] cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed">{aiSuggestions.about}</p>
              </div>
            )}

            {aiSuggestions.experience && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-extrabold text-slate-500 text-[10px] uppercase tracking-wider mb-1.5">Experience Tips</h4>
                <p className="text-slate-600 font-medium leading-relaxed">{aiSuggestions.experience}</p>
              </div>
            )}

            {aiSuggestions.skills && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-extrabold text-slate-500 text-[10px] uppercase tracking-wider mb-1.5">In-Demand Skills</h4>
                <p className="text-slate-600 font-medium leading-relaxed">{aiSuggestions.skills}</p>
              </div>
            )}

            <button 
              onClick={handleRequestAiOptimization}
              disabled={isAiLoading}
              className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-700 transition-colors cursor-pointer"
            >
              Re-Analyze Profile
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 text-xs text-slate-500 font-medium">
            <p className="leading-relaxed">
              Analyze your profile items using internAi to obtain dynamic custom insights for your industry keyword index and cover matches.
            </p>
            <button 
              onClick={handleRequestAiOptimization}
              disabled={isAiLoading}
              className="w-full text-center py-2.5 bg-purple-950/20 border border-[#8f58f7]/30 hover:border-[#8f58f7] rounded-md text-[10px] font-extrabold uppercase tracking-wider text-purple-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-3 animate-spin" />
                  <span>Analyzing Profile...</span>
                </>
              ) : (
                <>
                  <AiIcon className="w-3 text-[#7839ec]" />
                  <span>Scan with AI Coach</span>
                </>
              )}
            </button>
            {aiError && (
              <div className="flex items-center gap-1.5 text-red-500 font-semibold mt-1">
                <AlertCircle className="w-3" />
                <span>{aiError}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
