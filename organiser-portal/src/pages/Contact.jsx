import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Mail, Phone, Clock, Headphones, Book, Calendar, 
  CreditCard, Shield, BarChart3, AlertCircle, ChevronDown, ArrowRight, X, Send 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const helpTopics = [
  {
    id: 'started',
    title: 'Getting Started',
    icon: <Book className="text-[#8155ff]" size={20} />,
    color: 'from-[#8155ff]/20 to-transparent',
    border: 'border-[#8155ff]/30',
    desc: 'Learn the basics of Fundo and how to manage event payments.',
    articles: [
      {
        q: "How to set up your Fundo organiser account",
        a: "To set up your Fundo organiser account, click 'Sign Up' in the top-right corner. Fill in your name, email, and password. Confirm your account by entering the OTP sent to your email. You are then ready to start creating events!"
      },
      {
        q: "Creating your first event",
        a: "Navigate to the Events page, click 'Create Event', fill out the event title, description, ticket price, registration limit, date, and upload a cover photo. After creation, the event is immediately live."
      },
      {
        q: "How to view payments in real-time",
        a: "Use the live dashboard or the event details page. Successful transactions will appear instantly as they are processed through Socket.io."
      }
    ]
  },
  {
    id: 'events',
    title: 'Events Management',
    icon: <Calendar className="text-[#10b981]" size={20} />,
    color: 'from-[#10b981]/20 to-transparent',
    border: 'border-[#10b981]/30',
    desc: 'Create and update events, manage invite codes.',
    articles: [
      {
        q: "What is the difference between Public and Private events?",
        a: "Public events are visible to everyone on the Student Portal. Private events are hidden and can only be joined via a direct link containing the private invite code."
      },
      {
        q: "How do I edit or delete an event?",
        a: "Go to your Event Detail Page, click 'Edit Event' to modify details, or click 'Delete Event' to remove it. Note: deleting an event deletes all associated registrations."
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Payouts',
    icon: <CreditCard className="text-[#3b82f6]" size={20} />,
    color: 'from-[#3b82f6]/20 to-transparent',
    border: 'border-[#3b82f6]/30',
    desc: 'Understand payment processing, transaction records, and cashouts.',
    articles: [
      {
        q: "How does Fundo handle payments?",
        a: "Fundo processes payments using Razorpay. Once a participant pays, the status is updated to SUCCESS, and the funds are credited to your organiser balance."
      },
      {
        q: "How long do payouts take?",
        a: "Payouts are automatically batched and transferred to your department/club account within 3-5 business days after the event completes."
      }
    ]
  },
  {
    id: 'security',
    title: 'Account & Security',
    icon: <Shield className="text-[#f59e0b]" size={20} />,
    color: 'from-[#f59e0b]/20 to-transparent',
    border: 'border-[#f59e0b]/30',
    desc: 'Manage your credentials, roles, and safety settings.',
    articles: [
      {
        q: "Securing your organiser account",
        a: "Always use a strong password with uppercase letters, numbers, and special symbols. Ensure your verified email matches your college registration."
      }
    ]
  }
];

const initialFaqs = [
  {
    q: 'How do I create a new event?',
    a: "Click 'Create Event' in the navigation bar or dashboard. Provide details like name, date, cost, type, description, and cover image, then submit."
  },
  {
    q: 'How does real-time transaction tracking work?',
    a: "Fundo connects via WebSockets (Socket.io) to the backend. When a student registers, the server sends a confirmation event, and your page updates instantly without manual reloading."
  },
  {
    q: 'How do I export registrations to CSV?',
    a: "On the Event Detail Page or the global Transactions page, click the 'Export CSV' button to download a spreadsheet containing names, emails, transaction IDs, and timestamps."
  }
];

export default function Contact() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
  const [activeArticleIndex, setActiveArticleIndex] = useState(null);

  const [supportName, setSupportName] = useState(user?.name || '');
  const [supportEmail, setSupportEmail] = useState(user?.email || '');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);

  const allFaqsList = useMemo(() => {
    return initialFaqs;
  }, []);

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportName || !supportEmail || !supportSubject || !supportMessage) {
      addToast('Please fill out all support ticket fields.', 'error');
      return;
    }

    setSubmittingSupport(true);
    setTimeout(() => {
      addToast('Support ticket submitted! We will respond within 24 hours.', 'success');
      setSupportSubject('');
      setSupportMessage('');
      setSubmittingSupport(false);
      setIsSupportModalOpen(false);
    }, 1200);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-12 min-h-screen relative font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Help & Support</h1>
          <p className="text-white/60 text-sm">We're here to help! Find answers or get in touch with our support team.</p>
        </div>
        <button 
          onClick={() => setIsSupportModalOpen(true)}
          className="bg-[#8155ff]/20 text-[#8155ff] border border-[#8155ff]/30 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#8155ff]/30 transition-all cursor-pointer w-fit"
        >
          <Headphones size={16} /> Contact Support
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-[#1c133a] to-[#0e0a1f] border border-white/10 rounded-[32px] p-8 md:p-12 mb-10 overflow-visible">
        <div className="absolute top-0 right-0 w-[600px] h-full bg-[#8155ff]/10 blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-xl">
          <p className="text-white/80 font-medium mb-2">Hi {user?.name || 'there'}! 👋</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How can we help you today?</h2>
          <p className="text-white/60 text-sm mb-2">Browse our documentation category list or contact our live channels directly.</p>
        </div>

        {/* Headphone Shape Illustration */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 hidden md:block">
          <div className="relative w-full h-full animate-[bounce_4s_infinite]">
            <div className="absolute top-4 left-4 w-40 h-40 border-[16px] border-[#8155ff] rounded-t-full rounded-b-[40px] border-b-transparent drop-shadow-[0_0_30px_rgba(129,85,255,0.4)]"></div>
            <div className="absolute bottom-4 left-0 w-12 h-20 bg-gradient-to-b from-[#8155ff] to-[#4520b8] rounded-2xl shadow-xl"></div>
            <div className="absolute bottom-4 right-0 w-12 h-20 bg-gradient-to-b from-[#8155ff] to-[#4520b8] rounded-2xl shadow-xl"></div>
            <div className="absolute bottom-10 right-12 w-24 h-4 bg-[#8155ff] rounded-full rotate-45 transform origin-right"></div>
            <div className="absolute bottom-6 right-[100px] w-6 h-6 bg-black rounded-full border-2 border-[#8155ff]"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Topics and FAQs */}
        <div className="lg:col-span-2 space-y-10">
          
          <div className="space-y-10">
            {/* Browse Help Topics */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Browse Help Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {helpTopics.map((topic, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setSelectedTopic(topic);
                      setActiveArticleIndex(null);
                    }}
                    className="bg-[#120c2b]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:bg-[#1a1033] transition-colors cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex gap-4 mb-4">
                      <div className={`w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br ${topic.color} border ${topic.border} flex items-center justify-center`}>
                        {topic.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-[#8155ff] transition-colors">{topic.title}</h4>
                        <p className="text-white/50 text-xs leading-relaxed">{topic.desc}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-3">
                      <span className="text-white/40 text-[11px] font-medium">{topic.articles.length} Articles</span>
                      <ArrowRight size={14} className="text-white/40 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs Accordion */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Frequently Asked Questions</h3>
              </div>
              
              <div className="bg-[#120c2b]/60 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {allFaqsList.map((faq, i) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <div key={i} className="divide-y divide-white/5">
                      <div 
                        onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                        className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <span className="text-white/80 text-sm font-medium pr-4">{faq.q}</span>
                        <ChevronDown size={16} className={`text-white/40 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-400' : ''}`} />
                      </div>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-black/20"
                          >
                            <p className="px-5 py-4 text-xs text-white/60 leading-relaxed font-sans">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div>
          <div className="bg-gradient-to-b from-[#1c133a] to-[#0e0a1f] border border-white/10 rounded-[24px] p-8 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-2">Still need help?</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              Can't find the answer you're looking for? Our support team is ready to assist you.
            </p>
            
            <button 
              onClick={() => setIsSupportModalOpen(true)}
              className="w-full bg-[#8155ff] hover:bg-[#6035f5] text-white px-6 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(129,85,255,0.2)] mb-8 cursor-pointer"
            >
              <Headphones size={18} /> Contact Support
            </button>
            
            <div className="space-y-6">
              <a href="tel:+918943602873" className="flex items-start gap-4 group">
                <div className="bg-white/5 p-2.5 rounded-xl text-[#8155ff] border border-white/5 mt-0.5 group-hover:bg-[#8155ff]/20 transition-colors">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs font-medium mb-1">Phone Number</p>
                  <p className="text-white text-sm font-medium group-hover:text-[#8155ff] transition-colors">+91 8943602873</p>
                </div>
              </a>
              
              <a href="mailto:fundoooooo12@gmail.com" className="flex items-start gap-4 group">
                <div className="bg-white/5 p-2.5 rounded-xl text-[#8155ff] border border-white/5 mt-0.5 group-hover:bg-[#8155ff]/20 transition-colors">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs font-medium mb-1">Email / Live Chat Support</p>
                  <span className="text-white text-sm font-medium group-hover:text-[#8155ff] transition-colors break-all">fundoooooo12@gmail.com</span>
                </div>
              </a>
              
              <div className="flex items-start gap-4">
                <div className="bg-white/5 p-2.5 rounded-xl text-[#8155ff] border border-white/5 mt-0.5">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs font-medium mb-1">Operating Hours</p>
                  <p className="text-white text-sm font-medium">All days 9 AM - 10 PM</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>

      {/* Help Article Modal */}
      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTopic(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0e0a1f] border border-white/10 rounded-[32px] w-full max-w-2xl overflow-hidden relative shadow-[0_24px_50px_rgba(0,0,0,0.8)] max-h-[85vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                    {selectedTopic.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedTopic.title}</h3>
                    <p className="text-white/40 text-xs">Help Articles & Documentation</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTopic(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-grow divide-y divide-white/5">
                {selectedTopic.articles.map((art, index) => {
                  const isOpen = activeArticleIndex === index;
                  return (
                    <div key={index} className={`${index > 0 ? 'pt-4' : ''}`}>
                      <button 
                        onClick={() => setActiveArticleIndex(isOpen ? null : index)}
                        className="w-full flex justify-between items-center text-left hover:text-brand-400 text-white transition-colors py-2 cursor-pointer"
                      >
                        <span className="text-sm font-semibold pr-4">{art.q}</span>
                        <ChevronDown size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180 text-brand-400' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="mt-3 text-xs text-white/60 leading-relaxed font-sans bg-white/5 p-4 rounded-xl border border-white/5">
                              {art.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Support Ticket Modal */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSupportModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0e0a1f] border border-white/10 rounded-[32px] w-full max-w-md overflow-hidden relative shadow-[0_24px_50px_rgba(0,0,0,0.8)]"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <Headphones className="text-brand-400" size={20} />
                  <div>
                    <h3 className="text-base font-bold text-white">Create Support Ticket</h3>
                    <p className="text-white/40 text-[10px]">Submit your inquiry to our system</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSupportModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSupportSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Your Name</label>
                  <input 
                    type="text" 
                    value={supportName}
                    onChange={(e) => setSupportName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Email Address</label>
                  <input 
                    type="email" 
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Subject</label>
                  <input 
                    type="text" 
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    required
                    placeholder="How can we help?"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/50">Describe your request</label>
                  <textarea 
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="Type details about your issue..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-brand-500 transition-colors resize-none font-sans"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submittingSupport}
                  className="w-full bg-[#8155ff] hover:bg-[#6035f5] disabled:opacity-50 text-white py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  <Send size={14} /> {submittingSupport ? 'Submitting ticket...' : 'Submit Request'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
