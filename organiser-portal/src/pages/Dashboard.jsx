import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, DollarSign, ArrowRight, PlusCircle, TrendingUp, Sparkles, Brain, UserCheck, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Dashboard() {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    totalTeams: 0,
    hackathonTeams: 0,
    totalMembers: 0,
    paidTeams: 0,
    pendingTeams: 0,
    totalCollected: 0,
    expectedCollection: 0,
  });
  const [recentTeams, setRecentTeams] = useState([]);
  const [hackathonStats, setHackathonStats] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const myEvents = data.events || [];
        setEvents(myEvents);

        let totalRegistrations = 0;
        let totalRevenue = 0;
        let totalTeams = 0;
        let hackathonTeams = 0;
        let totalMembers = 0;
        let paidTeams = 0;
        let pendingTeams = 0;
        let totalCollected = 0;
        let expectedCollection = 0;

        let allTeams = [];
        for (const evt of myEvents) {
          totalRegistrations += evt._count?.transactions || 0;
          totalTeams += evt._count?.teams || 0;

          if (evt.isHackathon) {
            try {
              const teamRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teams/event/${evt.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const teamData = await teamRes.json();
              if (teamData.success && teamData.teams) {
                const teams = teamData.teams;
                allTeams = [...allTeams, ...teams.map(t => ({ ...t, eventTitle: evt.title }))];
                hackathonTeams += teams.length;

                teams.forEach(t => {
                  const members = typeof t.members === 'string' ? JSON.parse(t.members) : (t.members || []);
                  totalMembers += members.length;
                  if (t.transaction?.status === 'SUCCESS') {
                    paidTeams++;
                    totalCollected += t.transaction?.amount || evt.price || 0;
                  } else {
                    pendingTeams++;
                  }
                  expectedCollection += evt.price || 0;
                });

                const statsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teams/stats/${evt.id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const statsData = await statsRes.json();
                if (statsData.success) setHackathonStats(statsData.stats);
              }
            } catch {}
          }
        }
        allTeams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentTeams(allTeams.slice(0, 8));

        setStats({
          totalEvents: myEvents.length,
          totalRegistrations,
          totalRevenue,
          totalTeams,
          hackathonTeams,
          totalMembers,
          paidTeams,
          pendingTeams,
          totalCollected,
          expectedCollection,
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  useEffect(() => {
    if (!socket) return;
    const handlePayment = () => fetchDashboardData();
    socket.on('payment:confirmed', handlePayment);
    socket.on('team:registered', handlePayment);
    return () => {
      socket.off('payment:confirmed', handlePayment);
      socket.off('team:registered', handlePayment);
    };
  }, [socket, events]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#8155ff] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-xs font-sans">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white px-6 md:px-12 py-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-10">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.04]">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-200">
              Organiser Command Center
            </h1>
            <p className="text-sm text-white/55">
              Monitor event performance, check transaction volumes, and review real-time checkouts.
            </p>
          </div>
          <Link
            to="/events/create"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#8155ff] to-[#6035f5] hover:opacity-90 text-white px-5 py-3 rounded-2xl font-bold text-[13px] shadow-lg shadow-purple-500/20 transition-all w-fit cursor-pointer"
          >
            <PlusCircle size={16} /> Create Event
          </Link>
        </div>

        {/* Core Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#8155ff] mb-3">
              <Calendar size={18} />
            </div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Events</p>
            <h3 className="text-2xl font-extrabold mt-1">{stats.totalEvents}</h3>
          </div>

          <div className="relative bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-purple-400 mb-3">
              <Users size={18} />
            </div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Teams</p>
            <h3 className="text-2xl font-extrabold mt-1">{stats.hackathonTeams}</h3>
          </div>

          <div className="relative bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-emerald-400 mb-3">
              <UserCheck size={18} />
            </div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Members</p>
            <h3 className="text-2xl font-extrabold mt-1">{stats.totalMembers}</h3>
          </div>

          <div className="relative bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-amber-400 mb-3">
              <DollarSign size={18} />
            </div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Collection</p>
            <h3 className="text-2xl font-extrabold mt-1">Rs.{stats.totalCollected.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* Hackathon Deep Dive */}
        {hackathonStats && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-purple-400" />
              <h2 className="text-lg font-bold">Hackathon Analytics</h2>
            </div>

            {/* Payment + Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Payment Breakdown */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign size={14} className="text-emerald-400" />
                  <p className="text-xs font-bold text-white">Payment Status</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-green-400" />
                      <span className="text-xs text-white/60">Paid Teams</span>
                    </div>
                    <span className="text-xs font-bold text-green-400">{stats.paidTeams}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-amber-400" />
                      <span className="text-xs text-white/60">Pending Teams</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400">{stats.pendingTeams}</span>
                  </div>
                  <div className="border-t border-white/5 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40">Collected</span>
                      <span className="text-xs font-bold text-emerald-400">Rs.{stats.totalCollected.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-white/40">Expected</span>
                      <span className="text-xs font-bold text-white/70">Rs.{stats.expectedCollection.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${stats.expectedCollection > 0 ? (stats.totalCollected / stats.expectedCollection) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/40 text-center">
                    {stats.expectedCollection > 0 ? Math.round((stats.totalCollected / stats.expectedCollection) * 100) : 0}% collection rate
                  </p>
                </div>
              </div>

              {/* Gender Breakdown */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={14} className="text-purple-400" />
                  <p className="text-xs font-bold text-white">Gender Demographics</p>
                </div>
                <div className="flex items-end gap-4 h-24">
                  {[
                    { label: 'Male', count: hackathonStats.genderBreakdown.male, color: 'bg-blue-500' },
                    { label: 'Female', count: hackathonStats.genderBreakdown.female, color: 'bg-pink-500' },
                    { label: 'Other', count: hackathonStats.genderBreakdown.other, color: 'bg-purple-500' },
                  ].map(g => {
                    const max = Math.max(hackathonStats.genderBreakdown.male, hackathonStats.genderBreakdown.female, hackathonStats.genderBreakdown.other, 1);
                    return (
                      <div key={g.label} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-white">{g.count}</span>
                        <div
                          className={`w-full ${g.color} rounded-t-lg transition-all`}
                          style={{ height: `${(g.count / max) * 70}px`, minHeight: g.count > 0 ? '8px' : '2px' }}
                        />
                        <span className="text-[10px] text-white/40">{g.label}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-white/40 text-center mt-4">
                  {hackathonStats.genderBreakdown.female} female participants ({hackathonStats.totalMembers > 0 ? Math.round((hackathonStats.genderBreakdown.female / hackathonStats.totalMembers) * 100) : 0}%)
                </p>
              </div>

              {/* Problem Statement Distribution */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={14} className="text-purple-400" />
                  <p className="text-xs font-bold text-white">Track Popularity</p>
                </div>
                <div className="space-y-3">
                  {Object.entries(hackathonStats.problemStatementBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([ps, count]) => (
                      <div key={ps} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-white/60 truncate flex-1 mr-2">{ps}</span>
                          <span className="text-xs font-bold text-purple-400">{count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${(count / hackathonStats.totalTeams) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  }
                  {Object.keys(hackathonStats.problemStatementBreakdown).length === 0 && (
                    <p className="text-[10px] text-white/30 text-center py-6">No data yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events + Recent Teams */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">My Events</h2>
              <Link to="/events" className="text-xs font-semibold text-[#8155ff] hover:text-[#a88bff] flex items-center gap-1 transition-colors">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-3xl p-12 text-center">
                <Calendar size={28} className="text-white/35 mx-auto mb-4" />
                <h3 className="text-base font-bold mb-1">No Events Found</h3>
                <p className="text-xs text-white/45 mb-6">Start creating events to receive registrations.</p>
                <Link to="/events/create" className="bg-white text-black font-semibold text-xs px-5 py-2.5 rounded-full hover:bg-white/95 transition-all">
                  Create Your First Event
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.slice(0, 4).map((evt) => (
                  <div key={evt.id} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 hover:border-[#8155ff]/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-sm text-white line-clamp-1">{evt.title}</h4>
                      {evt.isHackathon && (
                        <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <Brain size={10} /> Hack
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-extrabold">{evt._count?.transactions || 0}</p>
                        <p className="text-[10px] text-white/40">Txns</p>
                      </div>
                      <div>
                        <p className="text-lg font-extrabold text-purple-400">{evt._count?.teams || 0}</p>
                        <p className="text-[10px] text-white/40">Teams</p>
                      </div>
                      <div>
                        <p className="text-lg font-extrabold text-emerald-400">{evt.capacity}</p>
                        <p className="text-[10px] text-white/40">Capacity</p>
                      </div>
                    </div>
                    <Link to={`/events/${evt.id}`} className="w-full mt-3 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-white py-2 rounded-xl text-center text-xs font-semibold block transition-all">
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Teams */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Recent Teams</h2>
              <Link to="/teams" className="text-xs font-semibold text-[#8155ff] hover:text-[#a88bff] flex items-center gap-1 transition-colors">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 space-y-3 max-h-[500px] overflow-y-auto">
              {recentTeams.length === 0 ? (
                <div className="py-12 text-center">
                  <Users size={18} className="text-white/30 mx-auto mb-3" />
                  <p className="text-xs text-white/45">No team registrations yet</p>
                </div>
              ) : (
                recentTeams.map((team) => {
                  const members = typeof team.members === 'string' ? JSON.parse(team.members) : team.members;
                  return (
                    <Link
                      key={team.id}
                      to="/teams"
                      className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {team.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{team.name}</p>
                        <p className="text-[10px] text-white/50 truncate">
                          {team.leader?.name} &middot; {members.length} members
                        </p>
                        <p className="text-[10px] text-purple-400 font-mono">{team.registrationId}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        team.transaction?.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' :
                        team.transaction?.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-white/5 text-white/40'
                      }`}>
                        {team.transaction?.status || 'N/A'}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
