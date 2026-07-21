import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Mail, Clock, HelpCircle, AlertTriangle } from 'lucide-react';

export default function RefundPolicy() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <CreditCard className="text-[#8155ff]" size={20} />,
      title: "1. Staging & Sandbox Transactions",
      content: "All ticketing checkouts processed on Fundo utilize Razorpay developer API testing tokens. Because these checkouts operate in a sandbox environment, no real-world financial transactions take place, and no real currency is collected. Simulated refunds follow similar dry-run staging sequences."
    },
    {
      icon: <Clock className="text-[#10b981]" size={20} />,
      title: "2. Cancellation Timelines",
      content: "Users can request ticket cancellations up to 48 hours prior to the event's scheduled start time. Cancellations requested less than 48 hours before an event starts are subject to the individual organizer's discretion and may not be eligible for refund processing."
    },
    {
      icon: <Mail className="text-[#3b82f6]" size={20} />,
      title: "3. Initiating a Refund Request",
      content: "To initiate a refund request, navigate to the 'Transactions' page under your profile, copy the relevant Transaction ID, and email our support desk at fundoooooo12@gmail.com. Please include your registered email address and the reason for your refund request."
    },
    {
      icon: <ShieldCheck className="text-[#f59e0b]" size={20} />,
      title: "4. Processing Timelines",
      content: "Once approved, refund transactions are simulated and processed instantly. However, standard banking channels may take between 5 to 7 business days to reflect simulated reversals in sandbox accounts depending on the test gateway configured."
    },
    {
      icon: <AlertTriangle className="text-[#ef4444]" size={20} />,
      title: "5. Event Cancellations & Postponements",
      content: "If an event organizer cancels or postpones an event, registered participants will be automatically issued full refunds for the corresponding transactions. Fundo will notify all affected ticket holders via email."
    }
  ];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-16 min-h-screen relative">
      {/* Dynamic Glowing backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-3xl font-bold text-white mb-2">Refund Policy</h1>
        <p className="text-white/40 text-sm font-sans">Last updated: June 5, 2026</p>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="bg-black/40 backdrop-blur-2xl border border-white/5 border-l-purple-500/20 border-t-purple-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-[2rem] p-8 md:p-12 space-y-10">
        
        <p className="text-white/70 text-sm leading-relaxed font-sans">
          This Refund Policy outlines the cancellation rules, processing timelines, and support actions for all ticket transactions and registrations handled via the Fundo platform.
        </p>

        <div className="space-y-8">
          {sections.map((sec, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                {sec.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-base">{sec.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed font-sans">{sec.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Support Card */}
        <div className="border-t border-white/5 pt-8 text-center md:text-left flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div>
            <h4 className="text-white font-semibold text-sm mb-1">Have any questions about this policy?</h4>
            <p className="text-white/40 text-xs font-sans">Read our Help Center or contact our billing specialists directly.</p>
          </div>
          <button 
            onClick={() => navigate('/contact')}
            className="bg-[#8155ff]/20 text-[#8155ff] border border-[#8155ff]/30 px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#8155ff]/30 transition-all cursor-pointer inline-flex items-center gap-2 justify-center"
          >
            Contact Support
          </button>
        </div>

      </div>
    </div>
  );
}
