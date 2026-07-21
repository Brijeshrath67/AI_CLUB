import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getToken } from '../api/tokens.js';
import { CheckCircle, Users, MapPin, Calendar, Hash, ArrowLeft, Download, Share2, Clock, Lightbulb } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'TBA';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function Confirmation() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teams/${teamId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.team) {
            setTeam(data.team);
          }
        } else {
          addToast('Team not found.', 'error');
        }
      } catch (err) {
        addToast('Failed to load team details.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, [teamId, addToast]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      addToast('Link copied to clipboard!', 'success');
    } catch {
      addToast('Failed to copy link.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex justify-center items-center bg-[#050508]">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-white mb-2">Team Not Found</h2>
        <p className="text-white/40 mb-6">Could not find your team registration.</p>
        <button onClick={() => navigate('/events')} className="bg-[#8155ff] hover:bg-[#6035f5] text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
          Back to Events
        </button>
      </div>
    );
  }

  const members = typeof team.members === 'string' ? JSON.parse(team.members) : team.members;

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 min-h-screen relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-600/10 rounded-full blur-[180px] -z-10 pointer-events-none" />

      <button onClick={() => navigate('/events')} className="text-white/60 hover:text-white font-medium text-sm transition-colors flex items-center gap-1 mb-8 cursor-pointer">
        <ArrowLeft size={14} /> Back to Events
      </button>

      {/* Success Banner */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Registration Confirmed!</h1>
        <p className="text-sm text-white/50">Your team has been successfully registered for the hackathon.</p>
      </div>

      {/* Ticket Card */}
      <div className="bg-black/40 backdrop-blur-2xl border border-white/5 border-l-green-500/20 border-t-green-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-[2rem] overflow-hidden">
        {/* Header */}
        <div className="bg-white/5 px-8 py-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{team.event?.title || 'Hackathon'}</h2>
              <p className="text-xs text-white/40 mt-1">Team Registration Ticket</p>
            </div>
            <div className="text-right">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Confirmed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Registration ID */}
          <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Registration ID</p>
            <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#8155ff] tracking-widest">
              {team.registrationId || 'PENDING'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
                <Users size={10} /> Team Name
              </p>
              <p className="text-sm font-semibold text-white">{team.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={10} /> Date
              </p>
              <p className="text-sm font-semibold text-white">{formatDate(team.event?.date)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={10} /> Venue
              </p>
              <p className="text-sm font-semibold text-white">{team.event?.location || 'TBA'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
                <Clock size={10} /> Registered
              </p>
              <p className="text-sm font-semibold text-white">
                {new Date(team.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            {team.problemStatement && (
              <div className="col-span-2 space-y-1 bg-purple-500/5 border border-purple-500/10 rounded-xl p-3">
                <p className="text-[10px] text-purple-400 uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb size={10} /> Problem Statement
                </p>
                <p className="text-xs font-semibold text-white">{team.problemStatement.title}</p>
              </div>
            )}
          </div>

          {/* Members */}
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Team Members ({members.length})</p>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {m.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {m.name}
                      {i === 0 && <span className="text-[10px] text-purple-400 ml-2">(Leader)</span>}
                    </p>
                    <p className="text-[10px] text-white/40 truncate">{m.email}</p>
                  </div>
                  {m.gender && (
                    <span className="text-[10px] text-white/30 uppercase">{m.gender}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          {team.transaction && (
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
              <span className="text-xs text-white/50">Payment</span>
              <span className={`text-xs font-bold ${team.transaction.status === 'SUCCESS' ? 'text-green-400' : team.transaction.status === 'PENDING' ? 'text-amber-400' : 'text-red-400'}`}>
                {team.transaction.status} &middot; Rs.{team.transaction.amount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleShare}
          className="flex-1 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-white/80 py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Share2 size={14} /> Share
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 bg-gradient-to-r from-[#8155ff] to-[#6035f5] text-white py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Download size={14} /> Save Ticket
        </button>
      </div>
    </div>
  );
}
