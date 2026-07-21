import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { getEventRegistrations, addRealtimeRegistration } from '../utils/mockData';
import { Search, Filter, Download, DollarSign, Users, Receipt, Calendar } from 'lucide-react';

export default function Transactions() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const { socket } = useSocket();

  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('ALL');

  const fetchTransactionsData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        const myEvents = data.events || [];
        setEvents(myEvents);

        // Gather all registrations across events
        let allRegs = [];
        myEvents.forEach(evt => {
          const regs = getEventRegistrations(evt);
          allRegs = [...allRegs, ...regs];
        });

        // Sort by date descending
        allRegs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(allRegs);
      }
    } catch (err) {
      console.error('Error fetching transactions data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTransactionsData();
    }
  }, [token]);

  // Listen for real-time payment confirmations globally
  useEffect(() => {
    if (!socket || events.length === 0) return;

    const handlePaymentConfirmed = (data) => {
      console.log('Realtime payment confirmed in Transactions:', data);
      const matchedEvent = events.find(e => e.title === data.eventName);
      if (matchedEvent) {
        addRealtimeRegistration(matchedEvent.id, {
          userName: data.userName,
          amount: data.amount,
          eventName: data.eventName
        });
        fetchTransactionsData();
        addToast(`Realtime Payment: ₹${data.amount} received from ${data.userName} for ${data.eventName}!`, 'success');
      }
    };

    socket.on('payment:confirmed', handlePaymentConfirmed);

    return () => {
      socket.off('payment:confirmed', handlePaymentConfirmed);
    };
  }, [socket, events]);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEvent = selectedEventId === 'ALL' || tx.eventId === selectedEventId;

    return matchesSearch && matchesEvent;
  });

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      addToast('No records to export.', 'info');
      return;
    }

    const headers = ['Transaction ID', 'Attendee Name', 'Attendee Email', 'Event Name', 'Amount (INR)', 'Status', 'Date'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.userName,
      t.userEmail,
      t.eventName,
      t.amount,
      t.status,
      new Date(t.createdAt).toLocaleString('en-IN')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ML Hive_Organiser_Transactions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV export successful!', 'success');
  };

  const totalVolume = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#8155ff] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-xs font-sans">Loading transaction feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white px-6 md:px-12 py-10 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Transactions Audit</h1>
            <p className="text-sm text-white/50">Comprehensive ledger of attendee tickets purchased.</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] text-white px-5 py-3 rounded-2xl font-bold text-[13px] transition-all cursor-pointer w-fit"
          >
            <Download size={15} /> Export Ledger (CSV)
          </button>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/[0.02] border border-white/[0.04] p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/15">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-white/35">Filtered Revenue</p>
              <p className="text-sm font-extrabold text-white">₹{totalVolume.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.04] p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#8155ff]/10 text-[#8155ff] flex items-center justify-center border border-[#8155ff]/15">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-white/35">Filtered Registrants</p>
              <p className="text-sm font-extrabold text-white">{filteredTransactions.length}</p>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.04] p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/15">
              <Receipt size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-white/35">Events Represented</p>
              <p className="text-sm font-extrabold text-white">
                {selectedEventId === 'ALL' ? events.length : 1}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl">
          {/* Search by registrant */}
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={15} />
            <input
              type="text"
              placeholder="Search by registrant, email, transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/35 outline-none focus:border-[#8155ff]"
            />
          </div>

          {/* Event Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs text-white/40 font-medium shrink-0 flex items-center gap-1">
              <Filter size={13} /> Filter Event:
            </span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#8155ff] cursor-pointer w-full md:w-60 font-sans"
            >
              <option value="ALL">All Events</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>{evt.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions list table */}
        <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-20 text-white/35 text-xs font-sans">
              No transactions match the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/[0.05] rounded-2xl bg-black/20">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.02] text-white/45 uppercase text-[9px] font-bold tracking-wider">
                    <th className="p-4">Attendee</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Event</th>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-bold text-white">{tx.userName}</td>
                      <td className="p-4 text-white/60">{tx.userEmail}</td>
                      <td className="p-4 font-semibold text-[#8155ff]">{tx.eventName}</td>
                      <td className="p-4 font-mono text-[10px] text-white/45">{tx.id}</td>
                      <td className="p-4 font-semibold text-white/80">₹{tx.amount}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-white/50">{new Date(tx.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
