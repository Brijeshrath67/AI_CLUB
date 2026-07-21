import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getToken } from '../api/tokens';
import { CreditCard, Search, ExternalLink, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'TBA';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function AllTransactions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transactions/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.transaction)) {
          setTransactions(data.transaction);
        }
      } else {
        addToast('Failed to fetch transaction history.', 'error');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      addToast('An error occurred while loading transactions.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter((tx) => {
    const title = (tx.event?.title || '').toLowerCase();
    const orderId = (tx.razorpayOrderId || '').toLowerCase();
    const paymentId = (tx.razorpayPaymentId || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || orderId.includes(query) || paymentId.includes(query);
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center bg-[#050508] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-purple-300/80 text-sm font-medium tracking-wide animate-pulse">Loading transaction records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 min-h-screen relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">My Transactions</h1>
        <p className="text-white/50 text-sm">Keep track of your registered events, ticket bookings, and invoice summaries.</p>
      </div>

      {/* Search Filter */}
      <div className="mb-6 flex items-center bg-[#120c2b]/80 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#8155ff]/50 transition-colors">
        <Search className="text-white/40 mr-3 shrink-0" size={18} />
        <input 
          type="text" 
          placeholder="Search by event title, Razorpay Order ID or Payment ID..." 
          className="bg-transparent border-none text-white text-sm outline-none placeholder:text-white/40 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table / List View */}
      {filteredTransactions.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#120c2b]/20">
          <CreditCard size={48} className="text-white/20 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No Transactions Found</h3>
          <p className="text-white/40 text-sm max-w-sm text-center">You haven't made any transactions yet or no records match your search query.</p>
        </div>
      ) : (
        <div className="bg-[#120c2b]/40 backdrop-blur-2xl border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-[1.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-[11px] font-bold text-white/50 uppercase tracking-wider">
                  <th className="py-4 px-6">Event Details</th>
                  <th className="py-4 px-6">Payment ID / Order ID</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map((tx) => {
                  const isSuccess = tx.status === 'SUCCESS';
                  const isPending = tx.status === 'PENDING';
                  
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors text-sm">
                      {/* Event Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div>
                            <p 
                              onClick={() => tx.eventId && navigate(`/events/${tx.eventId}`)}
                              className="font-semibold text-white hover:text-[#8155ff] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              {tx.event?.title || 'Unknown Event'}
                              <ExternalLink size={12} className="opacity-40" />
                            </p>
                            <p className="text-xs text-white/40">{tx.event?.location || 'Online'}</p>
                          </div>
                        </div>
                      </td>

                      {/* IDs Column */}
                      <td className="py-4 px-6 font-mono text-[11px] text-white/60 space-y-1">
                        <div>
                          <span className="text-white/30 mr-1.5 select-none">PAYID:</span>
                          {tx.razorpayPaymentId || 'N/A'}
                        </div>
                        <div>
                          <span className="text-white/30 mr-1.5 select-none">ORDID:</span>
                          {tx.razorpayOrderId || 'N/A'}
                        </div>
                      </td>

                      {/* Amount Column */}
                      <td className="py-4 px-6 font-bold text-white/90">
                        ₹{tx.amount}
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          isSuccess
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : isPending
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {isSuccess ? <CheckCircle size={12} /> : isPending ? <AlertCircle size={12} /> : <XCircle size={12} />}
                          {tx.status}
                        </span>
                      </td>

                      {/* Date Column */}
                      <td className="py-4 px-6 text-white/60">
                        {formatDate(tx.createdAt)}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => tx.eventId && navigate(`/events/${tx.eventId}`)}
                          className="text-xs font-semibold text-[#8155ff] hover:text-[#6035f5] transition-colors"
                        >
                          View Event
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
