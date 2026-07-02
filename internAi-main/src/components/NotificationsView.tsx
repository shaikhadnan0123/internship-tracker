import React from 'react';
import { Bell, Briefcase, Trash, Eye, ArrowRight, TrendingUp } from 'lucide-react';
import AiIcon from './AiIcon';
import { Notification } from '../types';

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  searchQuery: string;
}

export default function NotificationsView({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  searchQuery
}: NotificationsViewProps) {

  // Filter notifications based on search query
  const filteredNotifications = notifications.filter(notif => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      notif.senderName.toLowerCase().includes(query) ||
      notif.text.toLowerCase().includes(query) ||
      (notif.senderHeadline && notif.senderHeadline.toLowerCase().includes(query))
    );
  });

  const matchCards = [
    {
      id: 'match_google',
      company: 'Google',
      role: 'Frontend Internship',
      score: '98%',
      summary: 'Strong fit for React, TypeScript, and UI performance work.',
      details: 'Hybrid • 6-month • Remote-friendly',
      type: 'internship'
    },
    {
      id: 'match_stripe',
      company: 'Stripe',
      role: 'AI Engineer Intern',
      score: '95%',
      summary: 'Excellent alignment with internAi SDK and full-stack delivery.',
      details: 'Remote • Paid • Fast-track review',
      type: 'job'
    },
    {
      id: 'match_airbnb',
      company: 'Airbnb',
      role: 'Product UI Engineer',
      score: '92%',
      summary: 'Great match for Tailwind, interaction design, and polished UX.',
      details: 'On-site • Full-time • Creative team',
      type: 'job'
    }
  ];

  const getBgClass = (read: boolean) => {
    return read ? 'bg-slate-900/70' : 'bg-slate-800/80 hover:bg-slate-700/80 border-l-4 border-l-indigo-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="ln-notifications-container">
      {/* Left sidebar: AI Match Summary */}
      <div className="md:col-span-1 liquid-glass-card rounded-xl p-4 shadow-sm h-fit flex flex-col gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">AI Updates</h3>
          <p className="text-xs text-slate-300 font-medium mt-1 leading-normal">Automatically matched internship and job openings based on your resume and skills.</p>
        </div>

        <div className="rounded-xl bg-slate-900/70 border border-slate-400/20 p-3">
          <div className="flex items-center gap-2 text-indigo-300">
            <AiIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Live Match Engine</span>
          </div>
          <p className="mt-2 text-sm font-bold text-slate-100">3 new opportunities align with your profile.</p>
        </div>

        <button 
          onClick={onMarkAllAsRead}
          disabled={notifications.every(n => n.read)}
          className="w-full text-center py-2.5 border border-slate-400/20 rounded-full text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-slate-800/70 cursor-pointer disabled:opacity-40 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      {/* Main updates list */}
      <div className="md:col-span-3 liquid-glass-card rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-3.5 border-b border-slate-400/20 flex justify-between items-center bg-slate-950/60">
          <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Auto-Matched Opportunities</h3>
          <span className="text-[10px] text-slate-200 font-bold bg-slate-800/80 rounded-full px-2 py-0.5 uppercase tracking-wider">
            {notifications.filter(n => !n.read).length} new
          </span>
        </div>

        <div className="flex flex-col">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-300 text-xs font-semibold">
              No automatic matches to display right now.
            </div>
          ) : (
            matchCards.map((match) => (
              <div 
                key={match.id}
                className={`p-4 border-b border-slate-100 last:border-b-0 flex items-start gap-3.5 transition-colors ${getBgClass(false)}`}
              >
                <div className="p-2 bg-indigo-500/15 border border-indigo-400/20 rounded-full flex items-center justify-center self-center shrink-0">
                  {match.type === 'internship' ? <Briefcase className="w-4 h-4 text-indigo-300" /> : <TrendingUp className="w-4 h-4 text-indigo-300" />}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-slate-100">{match.company}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full">
                      {match.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-normal mt-1">
                    {match.summary}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">{match.details}</p>
                </div>

                <div className="flex flex-col items-end gap-2 self-center shrink-0">
                  <span className="text-sm font-black text-emerald-300">{match.score}</span>
                  <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-300 hover:text-indigo-200">
                    View <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
