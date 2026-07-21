import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getToken } from '../api/tokens.js';
import { Users, Plus, Trash2, ArrowLeft, Loader2, UserPlus, CheckCircle, Lightbulb } from 'lucide-react';

export default function TeamRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [event, setEvent] = useState(null);
  const [problemStatements, setProblemStatements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedPS, setSelectedPS] = useState('');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.event) {
            setEvent(data.event);
            setProblemStatements(data.event.problemStatements || []);
            if (user) {
              setMembers([{
                name: user.name || '',
                email: user.email || '',
                phone: '',
                gender: '',
                isLeader: true,
              }]);
            }
          }
        }
      } catch (err) {
        addToast('Failed to load event.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    if (user) init();
  }, [id, user, addToast]);

  const maxMembers = event?.maxTeamSize || 5;
  const minMembers = event?.minTeamSize || 1;

  const addMember = () => {
    if (members.length >= maxMembers) {
      addToast(`Maximum team size is ${maxMembers}`, 'error');
      return;
    }
    setMembers([...members, { name: '', email: '', phone: '', gender: '', isLeader: false }]);
  };

  const removeMember = (index) => {
    if (members[index].isLeader) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) {
      addToast('Please enter a team name.', 'error');
      return;
    }

    if (members.length < minMembers) {
      addToast(`Minimum ${minMembers} member(s) required.`, 'error');
      return;
    }

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name.trim() || !m.email.trim()) {
        addToast(`Please fill name and email for member ${i + 1}.`, 'error');
        return;
      }
    }

    const hasFemale = members.some(m => m.gender && m.gender.toLowerCase() === 'female');
    if (!hasFemale) {
      addToast('Team must have at least 1 female member.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teams/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: id,
          teamName: teamName.trim(),
          members: members.map(({ isLeader, ...rest }) => rest),
          problemStatementId: selectedPS || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Team registered successfully!', 'success');
        navigate(`/hackathon/confirmation/${data.team.id}`);
      } else {
        addToast(data.error || 'Registration failed.', 'error');
      }
    } catch (err) {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
        <h2 className="text-2xl font-bold text-white mb-2">Not a Hackathon</h2>
        <p className="text-white/40 mb-6">Team registration is only for hackathon events.</p>
        <button onClick={() => navigate('/events')} className="bg-[#8155ff] hover:bg-[#6035f5] text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-24 min-h-screen relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[180px] -z-10 pointer-events-none" />

      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(`/events/${id}`)} className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white/70 hover:text-white transition-all cursor-pointer">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Register Your Team</h1>
          <p className="text-xs text-white/50">{event.title} &middot; Rs.{event.price} per team</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Team Name */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-white/55">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Code Warriors"
              required
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#8155ff] transition-colors"
            />
          </div>
        </div>

        {/* Problem Statement Selection */}
        {problemStatements.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-purple-400" />
              <h3 className="text-sm font-bold text-white">Choose Problem Statement</h3>
            </div>
            <div className="space-y-2">
              {problemStatements.map((ps) => (
                <label
                  key={ps.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedPS === ps.id
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : 'bg-black/20 border-white/5 hover:border-white/15'
                  }`}
                >
                  <input
                    type="radio"
                    name="problemStatement"
                    value={ps.id}
                    checked={selectedPS === ps.id}
                    onChange={(e) => setSelectedPS(e.target.value)}
                    className="mt-0.5 accent-purple-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{ps.title}</p>
                    <p className="text-[10px] text-white/40 mt-1 leading-relaxed">{ps.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-purple-400" />
              <h3 className="text-sm font-bold text-white">Team Members</h3>
            </div>
            <span className="text-[10px] text-white/40">{members.length}/{maxMembers} members</span>
          </div>

          <div className="space-y-4">
            {members.map((member, index) => (
              <div key={index} className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    {member.isLeader ? 'Team Leader (You)' : `Member ${index + 1}`}
                  </span>
                  {!member.isLeader && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="text-red-400/60 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                    placeholder="Full Name"
                    disabled={member.isLeader}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-[#8155ff] transition-colors disabled:opacity-50"
                  />
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateMember(index, 'email', e.target.value)}
                    placeholder="Email Address"
                    disabled={member.isLeader}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-[#8155ff] transition-colors disabled:opacity-50"
                  />
                  <input
                    type="tel"
                    value={member.phone}
                    onChange={(e) => updateMember(index, 'phone', e.target.value)}
                    placeholder="Phone Number"
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-[#8155ff] transition-colors"
                  />
                  <select
                    value={member.gender}
                    onChange={(e) => updateMember(index, 'gender', e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-[#8155ff] transition-colors appearance-none"
                  >
                    <option value="" className="bg-black">Gender *</option>
                    <option value="male" className="bg-black">Male</option>
                    <option value="female" className="bg-black">Female</option>
                    <option value="other" className="bg-black">Other</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {members.length < maxMembers && (
            <button
              type="button"
              onClick={addMember}
              className="w-full border-2 border-dashed border-white/10 hover:border-purple-500/30 rounded-xl py-3 text-xs font-semibold text-white/50 hover:text-purple-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={14} /> Add Member
            </button>
          )}

          <p className="text-[10px] text-white/30 text-center">
            Min {minMembers} member(s) &middot; At least 1 female member required
          </p>
        </div>

        {/* Summary */}
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60">Registration Fee</p>
            <p className="text-lg font-bold text-white">Rs.{event.price}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Team Size</p>
            <p className="text-lg font-bold text-white">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 bg-gradient-to-r from-[#8155ff] to-[#6035f5] text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Registering...
            </>
          ) : (
            <>
              <CheckCircle size={16} /> Register Team & Pay Rs.{event.price}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
