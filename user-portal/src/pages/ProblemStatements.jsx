import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getToken } from '../api/tokens.js';
import { Brain, Users, Calendar, MapPin, IndianRupee, Clock, Lightbulb, ChevronRight, Shield } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'TBA';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function ProblemStatements() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [event, setEvent] = useState(null);
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.event) {
            setEvent(data.event);
            setProblems(data.event.problemStatements || []);
          }
        } else {
          addToast('Event not found.', 'error');
        }
      } catch (err) {
        addToast('Failed to load event.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id, addToast]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex justify-center items-center bg-[#050508]">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!event || !event.isHackathon) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-white/40 mb-6">This is not a hackathon event.</p>
        <button onClick={() => navigate('/events')} className="bg-[#8155ff] hover:bg-[#6035f5] text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-24 min-h-screen relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/15 rounded-full blur-[180px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
          <Brain size={14} className="text-purple-400" />
          <span className="text-xs font-bold text-purple-300 tracking-wider uppercase">AI/ML Hackathon</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">{event.title}</h1>
        <p className="text-white/50 text-sm max-w-2xl mx-auto leading-relaxed">{event.description}</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
          <Calendar size={18} className="text-purple-400 mx-auto mb-2" />
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Date</p>
          <p className="text-xs font-semibold text-white/90">{formatDate(event.date)}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
          <MapPin size={18} className="text-purple-400 mx-auto mb-2" />
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Venue</p>
          <p className="text-xs font-semibold text-white/90">{event.location}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
          <IndianRupee size={18} className="text-purple-400 mx-auto mb-2" />
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Fee</p>
          <p className="text-xs font-semibold text-white/90">Rs.{event.price}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
          <Users size={18} className="text-purple-400 mx-auto mb-2" />
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Team Size</p>
          <p className="text-xs font-semibold text-white/90">{event.minTeamSize || 1} - {event.maxTeamSize || 5}</p>
        </div>
      </div>

      {/* Rules Section */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Shield size={16} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Rules & Guidelines</h2>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3">
          {[
            `Team size: ${event.minTeamSize || 1} to ${event.maxTeamSize || 5} members`,
            'At least 1 female member is mandatory in every team',
            `Registration fee: Rs.${event.price} per team (non-refundable)`,
            'All team members must be college students',
            'Decision of judges will be final and binding',
            'Plagiarism of any kind will lead to disqualification',
            'Organizers reserve the right to modify rules if needed',
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Problem Statements */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Lightbulb size={16} className="text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Problem Statements</h2>
        </div>
        {problems.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
            <p className="text-white/40 text-sm">Problem statements will be announced soon. Stay tuned!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {problems.map((ps, i) => (
              <div key={ps.id || i} className="bg-white/[0.02] border border-white/5 hover:border-purple-500/20 rounded-2xl p-6 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-purple-500/20 transition-colors">
                    PS {i + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-2">{ps.title}</h3>
                    <p className="text-xs text-white/50 leading-relaxed">{ps.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          onClick={() => navigate(`/events/${id}`)}
          className="bg-gradient-to-r from-[#8155ff] to-[#6035f5] text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 inline-flex items-center gap-2"
        >
          Register Your Team <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
