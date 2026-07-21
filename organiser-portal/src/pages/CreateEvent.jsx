import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, Users, DollarSign, Upload, ArrowLeft, Key, Globe, FileImage, Sparkles, Brain, Plus, Trash2 } from 'lucide-react';

export default function CreateEvent() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('PUBLIC');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [isHackathon, setIsHackathon] = useState(false);
  const [minTeamSize, setMinTeamSize] = useState('');
  const [maxTeamSize, setMaxTeamSize] = useState('');
  const [problemStatements, setProblemStatements] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addProblemStatement = () => {
    setProblemStatements([...problemStatements, { title: '', description: '' }]);
  };

  const removeProblemStatement = (index) => {
    setProblemStatements(problemStatements.filter((_, i) => i !== index));
  };

  const updateProblemStatement = (index, field, value) => {
    const updated = [...problemStatements];
    updated[index][field] = value;
    setProblemStatements(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !price || !capacity || !date || !location) {
      addToast('Please fill in all fields.', 'error');
      return;
    }

    if (isHackathon) {
      const validPS = problemStatements.filter(ps => ps.title.trim() && ps.description.trim());
      if (validPS.length === 0) {
        addToast('Add at least 1 problem statement.', 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('capacity', capacity);
      formData.append('date', date);
      formData.append('location', location);
      formData.append('type', type);
      formData.append('isHackathon', isHackathon);
      if (isHackathon) {
        formData.append('minTeamSize', minTeamSize || '1');
        formData.append('maxTeamSize', maxTeamSize || '5');
        const validPS = problemStatements.filter(ps => ps.title.trim() && ps.description.trim());
        formData.append('problemStatements', JSON.stringify(validPS));
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        addToast('Event created successfully!', 'success');
        navigate('/events');
      } else {
        addToast(data.error || 'Failed to create event', 'error');
      }
    } catch (err) {
      console.error('Create event error:', err);
      addToast('Network error. Failed to create event.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white px-6 md:px-12 py-10 font-sans">
      <div className="max-w-[750px] mx-auto space-y-8">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/events')}
            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Create New Event</h1>
            <p className="text-xs text-white/50">Setup pricing, capacity, and private invite keys.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8155ff]/5 blur-[80px] rounded-full pointer-events-none" />
          
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-white/55">Event Banner Image</label>
            <div className="relative border-2 border-dashed border-white/10 hover:border-[#8155ff]/50 rounded-2xl p-6 transition-all flex flex-col items-center justify-center min-h-[160px] bg-black/35 overflow-hidden group">
              {imagePreview ? (
                <>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full cursor-pointer hover:scale-105 transition-all">
                      Change Image
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-white/50">
                    <Upload size={18} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold">Click to upload cover photo</p>
                    <p className="text-[10px] text-white/30 font-medium">Supports JPG, PNG or WEBP (Max 5MB)</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/55">Event Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual College Tech Fest"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#8155ff] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/55">Event Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write detailed event highlights, rules, and guidelines..."
                required
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#8155ff] transition-colors resize-none font-sans"
              />
            </div>
          </div>

          {/* Pricing, Capacity, and Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/55">Ticket Price (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/40">Rs.</span>
                <input 
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0 (Free)"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-[#8155ff] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/55">Total Capacity</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                <input 
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="100"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white outline-none focus:border-[#8155ff] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/55">Event Privacy</label>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-1.5 rounded-xl h-[42px]">
                <button
                  type="button"
                  onClick={() => setType('PUBLIC')}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold py-1.5 rounded-lg transition-all cursor-pointer ${
                    type === 'PUBLIC' 
                      ? 'bg-[#8155ff] text-white' 
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <Globe size={11} /> Public
                </button>
                <button
                  type="button"
                  onClick={() => setType('PRIVATE')}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold py-1.5 rounded-lg transition-all cursor-pointer ${
                    type === 'PRIVATE' 
                      ? 'bg-[#f59e0b] text-white' 
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <Key size={11} /> Private
                </button>
              </div>
            </div>
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/55">Date & Time</label>
              <input 
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#8155ff] transition-colors font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/55">Location / Venue</label>
              <input 
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Seminar Hall B, Campus"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#8155ff] transition-colors"
              />
            </div>
          </div>

          {/* Hackathon Toggle */}
          <div className="border-t border-white/[0.04] pt-6">
            <button
              type="button"
              onClick={() => setIsHackathon(!isHackathon)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                isHackathon
                  ? 'bg-purple-500/10 border-purple-500/30'
                  : 'bg-black/20 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Brain size={18} className={isHackathon ? 'text-purple-400' : 'text-white/40'} />
                <div className="text-left">
                  <p className="text-xs font-bold text-white">Hackathon Event</p>
                  <p className="text-[10px] text-white/40">Enable team registration with problem statements</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full transition-all ${isHackathon ? 'bg-purple-500' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-0.5 ${isHackathon ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>

          {/* Hackathon Options */}
          {isHackathon && (
            <div className="space-y-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/55">Min Team Size</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={minTeamSize}
                    onChange={(e) => setMinTeamSize(e.target.value)}
                    placeholder="1"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/55">Max Team Size</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(e.target.value)}
                    placeholder="5"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Problem Statements */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/55">Problem Statements</label>
                  <button
                    type="button"
                    onClick={addProblemStatement}
                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>

                {problemStatements.length === 0 && (
                  <p className="text-[10px] text-white/30 text-center py-4">No problem statements added yet. Click "Add" to create one.</p>
                )}

                {problemStatements.map((ps, i) => (
                  <div key={i} className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">PS {i + 1}</span>
                      <button type="button" onClick={() => removeProblemStatement(i)} className="text-red-400/60 hover:text-red-400 cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={ps.title}
                      onChange={(e) => updateProblemStatement(i, 'title', e.target.value)}
                      placeholder="Problem title"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-purple-500 transition-colors"
                    />
                    <textarea
                      value={ps.description}
                      onChange={(e) => updateProblemStatement(i, 'description', e.target.value)}
                      placeholder="Problem description..."
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-white/[0.04] justify-end">
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="px-6 py-3 rounded-2xl text-xs font-bold border border-white/10 hover:bg-white/[0.03] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-[#8155ff] to-[#6035f5] hover:opacity-90 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-purple-500/20"
            >
              {submitting ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
