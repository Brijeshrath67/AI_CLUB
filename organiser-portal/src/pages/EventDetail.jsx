import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { getEventRegistrations, addRealtimeRegistration } from '../utils/mockData';
import { ArrowLeft, Calendar, Users, DollarSign, MapPin, Key, Globe, Copy, Check, Download, Trash2, Edit3, Save, X, Eye } from 'lucide-react';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToast } = useToast();
  const { socket } = useSocket();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [copied, setCopied] = useState(false);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDate, setEditDate] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/${id}`);
      const data = await res.json();
      if (res.ok) {
        setEvent(data.event);
        setEditTitle(data.event.title);
        setEditDescription(data.event.description);
        setEditPrice(data.event.price);
        setEditCapacity(data.event.capacity);
        setEditLocation(data.event.location);
        
        // Format date for datetime-local input
        const localDate = new Date(data.event.date);
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
        setEditDate(localDate.toISOString().slice(0, 16));

        // Get registrations
        const regs = getEventRegistrations(data.event);
        setRegistrations(regs);
      } else {
        addToast(data.error || 'Failed to fetch event details', 'error');
        navigate('/events');
      }
    } catch (err) {
      console.error('Error fetching event detail:', err);
      addToast('Network error fetching event details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  // Listen for real-time payments scoped to this event
  useEffect(() => {
    if (!socket || !event) return;

    const handlePaymentConfirmed = (data) => {
      console.log('Realtime payment confirmed in EventDetail:', data);
      // Check if matches this event name or event id
      if (data.eventName === event.title) {
        const updatedRegs = addRealtimeRegistration(event.id, {
          userName: data.userName,
          amount: data.amount,
          eventName: event.title
        });
        setRegistrations(updatedRegs);
        addToast(`Realtime Registration: ${data.userName} paid ₹${data.amount}!`, 'success');
      }
    };

    socket.on('payment:confirmed', handlePaymentConfirmed);

    return () => {
      socket.off('payment:confirmed', handlePaymentConfirmed);
    };
  }, [socket, event]);

  const handleCopyLink = () => {
    const studentPortalUrl = import.meta.env.VITE_STUDENT_PORTAL_URL || 'http://localhost:5173';
    const link = event.type === 'PRIVATE' 
      ? `${studentPortalUrl}/join-code?code=${event.code}`
      : `${studentPortalUrl}/events/${event.id}`;
    
    navigator.clipboard.writeText(link);
    setCopied(true);
    addToast('Registration link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(event.code);
    addToast('Invite code copied to clipboard!', 'success');
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) {
      addToast('No registrations to export.', 'info');
      return;
    }

    const headers = ['Transaction ID', 'Name', 'Email', 'Amount (INR)', 'Status', 'Date'];
    const rows = registrations.map(r => [
      r.id,
      r.userName,
      r.userEmail,
      r.amount,
      r.status,
      new Date(r.createdAt).toLocaleString('en-IN')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.title.replace(/\s+/g, '_')}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV export successful!', 'success');
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This will remove all registration counts permanently.')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/${event.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        addToast('Event deleted successfully.', 'success');
        navigate('/events');
      } else {
        const data = await res.json();
        addToast(data.error || 'Failed to delete event', 'error');
      }
    } catch (err) {
      console.error('Delete event error:', err);
      addToast('Network error deleting event.', 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          price: parseFloat(editPrice),
          capacity: parseInt(editCapacity),
          location: editLocation,
          date: editDate
        })
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Event updated successfully!', 'success');
        setIsEditing(false);
        fetchEventDetails();
      } else {
        addToast(data.error || 'Failed to update event', 'error');
      }
    } catch (err) {
      console.error('Update event error:', err);
      addToast('Network error updating event.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#8155ff] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-xs font-sans">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white px-6 md:px-12 py-10 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Back and Actions bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/events')}
              className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Event Workspace</h1>
              <p className="text-xs text-white/50">Manage details, sharing settings, and download attendee sheets.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-1.5 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                >
                  <Edit3 size={13} /> Edit Event
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                >
                  <Trash2 size={13} /> Delete Event
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Middle: Details or Edit Form */}
          <div className="lg:col-span-2 space-y-8">
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-6 md:p-8 space-y-5 relative">
                <h3 className="text-base font-bold flex items-center gap-2 border-b border-white/[0.04] pb-4">
                  <Edit3 size={16} className="text-[#8155ff]" /> Edit Event Details
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Event Title</label>
                  <input 
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#8155ff]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Event Description</label>
                  <textarea 
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#8155ff] resize-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Ticket Price (INR)</label>
                    <input 
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#8155ff]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Total Capacity</label>
                    <input 
                      type="number"
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#8155ff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Date & Time</label>
                    <input 
                      type="datetime-local"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#8155ff] font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Location / Venue</label>
                    <input 
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#8155ff]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-white/10 hover:bg-white/[0.03] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-[#8155ff] hover:bg-[#6b4ef0] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#8155ff]/5 blur-[80px] rounded-full pointer-events-none" />
                
                {event.image && (
                  <div className="h-64 w-full overflow-hidden rounded-2xl border border-white/[0.06]">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    event.type === 'PRIVATE' 
                      ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/20' 
                      : 'bg-[#8155ff]/15 text-[#8155ff] border border-[#8155ff]/20'
                  }`}>
                    {event.type === 'PRIVATE' ? <Key size={10} /> : <Globe size={10} />}
                    {event.type} Event
                  </span>
                  <h2 className="text-2xl font-extrabold text-white">{event.title}</h2>
                </div>

                <p className="text-sm text-white/60 leading-relaxed font-sans border-t border-b border-white/[0.04] py-5 whitespace-pre-wrap">
                  {event.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[#8155ff]">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-white/35">Date</p>
                      <p className="text-xs font-bold text-white/80">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[#8155ff]">
                      <MapPin size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-white/35">Venue</p>
                      <p className="text-xs font-bold text-white/80 truncate">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[#8155ff]">
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-white/35">Price</p>
                      <p className="text-xs font-bold text-white/80">₹{event.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[#8155ff]">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-white/35">Capacity</p>
                      <p className="text-xs font-bold text-white/80">{registrations.length} / {event.capacity}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Registrations List table */}
            <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold">Attendee Registration Sheet</h3>
                  <p className="text-[11px] text-white/50">Successful checkouts for this event.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>

              {registrations.length === 0 ? (
                <div className="text-center py-12 text-white/35 text-xs font-sans">
                  No registrations recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-white/[0.05] rounded-2xl bg-black/20">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.05] bg-white/[0.02] text-white/45 uppercase text-[9px] font-bold tracking-wider">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Transaction ID</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4 font-bold text-white">{reg.userName}</td>
                          <td className="p-4 text-white/60">{reg.userEmail}</td>
                          <td className="p-4 font-mono text-[10px] text-white/45">{reg.id}</td>
                          <td className="p-4 font-semibold text-white/80">₹{reg.amount}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                              {reg.status}
                            </span>
                          </td>
                          <td className="p-4 text-white/50">{new Date(reg.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Share & Invite */}
          <div className="space-y-6">
            <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-6 space-y-6">
              <h3 className="text-base font-bold border-b border-white/[0.04] pb-4">Distribute & Share</h3>

              {/* Registration Link */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-white/35">Student Portal Registration Link</p>
                <div className="flex items-center bg-black/45 border border-white/10 rounded-xl p-1.5 pl-3">
                  <span className="text-[11px] text-white/40 truncate flex-1 font-sans">
                    {event.type === 'PRIVATE' ? 'Private Join with Invite Code' : 'Public event link'}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-all cursor-pointer shrink-0"
                    title="Copy Link"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Private Invite Code */}
              {event.type === 'PRIVATE' && event.code && (
                <div className="space-y-2.5 p-4.5 rounded-2xl bg-[#f59e0b]/5 border border-[#f59e0b]/15">
                  <div className="flex items-center gap-1.5 text-xs text-[#f59e0b] font-bold">
                    <Key size={14} /> Private Invite Settings
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                    This event is hidden from the main feed. Students must enter this invite code in the portal to register:
                  </p>
                  <div className="flex items-center justify-between bg-black/50 border border-white/10 px-4 py-2 rounded-xl">
                    <span className="font-mono text-sm font-extrabold tracking-widest text-[#f59e0b]">
                      {event.code}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
