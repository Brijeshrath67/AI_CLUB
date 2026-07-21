import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BookOpen, AlertCircle, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <Shield className="text-[#8155ff]" size={20} />,
      title: "1. Acceptance of Terms",
      content: "Welcome to ML Hive. By accessing, browsing, or using our ticketing and event organization platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
    },
    {
      icon: <FileText className="text-[#10b981]" size={20} />,
      title: "2. Account Registration & Security",
      content: "To register for events, you must create a verified user profile. You agree to provide accurate, current, and complete registration information, which is secured via our One-Time Password (OTP) verification system. You are fully responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
    },
    {
      icon: <CheckCircle2 className="text-[#3b82f6]" size={20} />,
      title: "3. Ticket Bookings & Payments",
      content: "All payments and registrations for tickets on ML Hive are processed securely via the Razorpay checkout gateway. Since ML Hive is running in developer demonstration mode, you can safely use simulated test checkout cards and UPI options to process dummy registrations without actual financial liability."
    },
    {
      icon: <RefreshCw className="text-[#f59e0b]" size={20} />,
      title: "4. Cancellation & Refund Policies",
      content: "Refund and ticket cancellation policies are determined solely by the event organizer. ML Hive acts as a mediator to process refund transactions. For support, transaction details, or refund requests, please contact our support desk directly at fundoooooo12@gmail.com."
    },
    {
      icon: <AlertCircle className="text-[#ef4444]" size={20} />,
      title: "5. Prohibited Conduct",
      content: "You agree not to bypass, disable, or interfere with security-related features of the platform, including reverse-engineering checkout pages or using automated scraping tools to acquire tickets. Violations may result in immediate suspension of your ML Hive profile."
    },
    {
      icon: <BookOpen className="text-[#d946ef]" size={20} />,
      title: "6. Limitation of Liability",
      content: "ML Hive is provided on an 'as is' and 'as available' basis. We disclaim all warranties, express or implied. Under no circumstances shall ML Hive or its developers be liable for direct, indirect, incidental, or consequential damages resulting from transaction failures, event cancellations, or service interruptions."
    }
  ];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-16 min-h-screen relative">
      {/* Dynamic Glowing background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm font-sans">Last updated: June 5, 2026</p>
      </div>

      {/* Content Container */}
      <div className="bg-black/40 backdrop-blur-2xl border border-white/5 border-l-purple-500/20 border-t-purple-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-[2rem] overflow-hidden p-8 md:p-12 space-y-10">
        
        <p className="text-white/70 text-sm leading-relaxed font-sans">
          These Terms of Service govern your relationship with ML Hive (referred to as "us", "we", or "our") concerning our web portal, event registration services, and simulated transaction checkouts. Please read this documentation carefully before continuing to use our application.
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

        <div className="border-t border-white/5 pt-8 text-center md:text-left flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div>
            <h4 className="text-white font-semibold text-sm mb-1">Have questions about these terms?</h4>
            <p className="text-white/40 text-xs font-sans">Our support desk is here to provide clarification.</p>
          </div>
          <button 
            onClick={() => navigate('/contact')}
            className="bg-[#8155ff]/20 text-[#8155ff] border border-[#8155ff]/30 px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#8155ff]/30 transition-all cursor-pointer inline-flex items-center gap-2 justify-center"
          >
            Contact Help Desk
          </button>
        </div>

      </div>
    </div>
  );
}
