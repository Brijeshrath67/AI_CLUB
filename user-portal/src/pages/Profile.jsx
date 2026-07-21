import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getToken } from '../api/tokens.js';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  KeyRound, 
  LogOut, 
  Trash2, 
  Save, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Camera
} from 'lucide-react';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Profile data from state/fetching
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'student',
    is_verified: user?.is_verified || false,
    avatar: user?.avatar || '',
    created_at: user?.created_at || '',
  });

  // Edit fields state
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size should be less than 5MB.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.profile) {
        addToast('Avatar updated successfully!', 'success');
        setProfileData(prev => ({ ...prev, avatar: data.profile.avatar }));
        setAvatarError(false);
        
        // Also update the global auth context user state if present
        if (user) {
          setUser(prev => ({ ...prev, avatar: data.profile.avatar }));
        }
      } else {
        addToast(data.error || 'Failed to upload avatar.', 'error');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      addToast('Network error uploading avatar.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Fetch full profile info on mount (in case context has basic info)
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.success && data.profile) {
          setProfileData(data.profile);
          setNameInput(data.profile.name || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!nameInput.trim()) {
      addToast('Name field cannot be empty.', 'error');
      return;
    }

    if (password) {
      if (password.length < 6) {
        addToast('Password must be at least 6 characters long.', 'error');
        return;
      }
      if (password !== confirmPassword) {
        addToast('Passwords do not match.', 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = getToken();
      const body = { name: nameInput.trim() };
      if (password) body.password = password;

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addToast('Profile updated successfully!', 'success');
        setProfileData(data.profile);
        setPassword('');
        setConfirmPassword('');
        // If updating current user context is desired, we can rely on reload or just state
        if (user) {
          setUser(prev => ({ ...prev, name: data.profile.name }));
        }
      } else {
        addToast(data.error || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      addToast('Network error updating profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete my account') {
      addToast('Please type the confirmation text exactly.', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addToast('Your account has been deleted.', 'success');
        setShowDeleteModal(false);
        // Triggers cleanup and redirects to login
        logout();
      } else {
        addToast(data.error || 'Failed to delete account.', 'error');
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      addToast('Network error during account deletion.', 'error');
      setIsDeleting(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen px-6 py-28 relative bg-[#050508] overflow-hidden flex justify-center">
      {/* Background blur effects */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[180px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="w-full max-w-5xl flex flex-col gap-8">
        {/* Back Link / Breadcrumb */}
        <div>
          <button 
            onClick={() => navigate('/')} 
            className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Home &nbsp;/&nbsp; <span className="text-white/80">Account & Settings</span>
          </button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Quick Profile Card */}
          <div className="lg:col-span-1 bg-black/40 backdrop-blur-2xl border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Interactive Avatar Container */}
              <div className="relative group mb-3">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8155ff] to-[#6035f5] text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-purple-500/20 border border-white/10 select-none overflow-hidden relative">
                  {uploadingAvatar ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-white/80" />
                  ) : profileData.avatar && !avatarError ? (
                    <img 
                      src={profileData.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'
                  )}
                  
                  {/* Hover overlay */}
                  <label 
                    htmlFor="avatar-input"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer gap-1"
                  >
                    <Camera size={18} className="text-white" />
                    <span className="text-[9px] font-semibold text-white/90">Change</span>
                  </label>
                </div>
                
                <input 
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </div>

              {/* Explicit button to change profile picture */}
              <label 
                htmlFor="avatar-input" 
                className="text-xs text-[#a855f7] hover:text-white font-semibold cursor-pointer transition-colors bg-[#8155ff]/10 hover:bg-[#8155ff] px-3.5 py-1.5 rounded-full mb-3 flex items-center gap-1.5 active:scale-95 duration-200 border border-[#8155ff]/20"
              >
                <Camera size={12} />
                Change Photo
              </label>
              
              <h2 className="text-xl font-semibold text-white truncate max-w-full">
                {profileData.name || 'User'}
              </h2>
              
              <div className="mt-2 flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-3 py-1 rounded-full text-xs text-white/70">
                <Shield size={12} className="text-purple-400" />
                <span className="capitalize font-medium">{profileData.role}</span>
              </div>

              {/* Profile Details List */}
              <div className="w-full mt-8 space-y-4 text-left border-t border-white/[0.06] pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/60">
                    <Mail size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Email Address</p>
                    <p className="text-sm text-white/80 truncate">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/60">
                    <Calendar size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Joined Date</p>
                    <p className="text-sm text-white/80">{formatDate(profileData.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/60">
                    {profileData.is_verified ? (
                      <CheckCircle size={14} className="text-emerald-400" />
                    ) : (
                      <XCircle size={14} className="text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Account Status</p>
                    <p className="text-sm text-white/80 font-medium">
                      {profileData.is_verified ? 'Verified Account' : 'Unverified Account'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Logout button at bottom of profile card */}
              <button 
                onClick={logout}
                className="w-full mt-8 h-11 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-white/90 hover:text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={15} />
                Sign Out
              </button>

            </div>
          </div>

          {/* Right: Update Settings Profile details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Update Info Card */}
            <div className="bg-black/40 backdrop-blur-2xl border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-3xl p-6 md:p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-transparent pointer-events-none" />
              
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <User size={18} className="text-[#8155ff]" />
                Update Profile Settings
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                {/* Name field */}
                <div className="space-y-2">
                  <label htmlFor="display-name" className="text-xs font-semibold text-white/70">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      id="display-name"
                      type="text"
                      className="w-full pl-10 pr-4 h-12 rounded-xl bg-black/25 border border-white/5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/70 focus:bg-black/45 transition-all text-sm"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Your Display Name"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="new-password" className="text-xs font-semibold text-white/70">New Password (Optional)</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        id="new-password"
                        type="password"
                        className="w-full pl-10 pr-4 h-12 rounded-xl bg-black/25 border border-white/5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/70 focus:bg-black/45 transition-all text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-xs font-semibold text-white/70">Confirm New Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        id="confirm-password"
                        type="password"
                        className="w-full pl-10 pr-4 h-12 rounded-xl bg-black/25 border border-white/5 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/70 focus:bg-black/45 transition-all text-sm"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={submitting || loading}
                    className="h-11 px-6 bg-gradient-to-r from-[#8155ff] to-[#6035f5] text-white rounded-xl font-semibold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-purple-500/15 border border-white/10 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Danger Zone Card */}
            <div className="bg-[#1c0c14]/30 backdrop-blur-2xl border border-red-500/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-3xl p-6 md:p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.01] to-transparent pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Danger Zone
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed max-w-md">
                    Once you delete your account, there is no going back. All of your transactions, tickets, and history will be permanently wiped.
                  </p>
                </div>
                
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="h-11 px-5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Trash2 size={15} />
                  Delete Account
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0f090d] border border-red-500/20 rounded-[2rem] p-8 shadow-[0_0_50px_0_rgba(239,68,68,0.15)] relative overflow-hidden animate-in fade-in duration-200">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-amber-500" />
            
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-400" />
              Are you absolutely sure?
            </h3>
            
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              This action cannot be undone. To confirm, please type <span className="text-red-400 font-semibold font-mono select-all">delete my account</span> in the input below:
            </p>

            <input
              type="text"
              className="w-full px-4 h-12 rounded-xl bg-black/40 border border-red-500/20 focus:border-red-500 focus:outline-none text-white placeholder:text-white/20 transition-all text-sm font-mono mb-6"
              placeholder="type the phrase here"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={isDeleting}
            />

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
                className="h-11 px-5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText.toLowerCase() !== 'delete my account'}
                className="h-11 px-5 bg-red-600 hover:bg-red-700 text-white border border-red-500/10 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
