import React, { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Shield, Building2, Hash, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [infoForm, setInfoForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const passwordsMatch = passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword;
  const passwordMismatch = passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword;

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      setInfoLoading(true);
      const res = await api.put('/users/me', {
        name: infoForm.name,
        email: infoForm.email,
      });
      toast.success('Profile updated successfully!');
      if (updateUser) updateUser(res.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setInfoLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      setPwLoading(true);
      await api.put('/users/me', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">My Profile</h1>
        <p className="text-text-muted text-sm mt-1">Manage your account credentials and personal information.</p>
      </div>

      {/* Top Banner Card */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/80 to-primary/40" />
        <div className="px-8 pb-6 -mt-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-3xl border-4 border-surface shadow-lg shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {/* Info */}
            <div className="flex-1 pb-1">
              <h2 className="text-xl font-bold text-text leading-tight">{user?.name}</h2>
              <p className="text-sm text-text-muted">{user?.email}</p>
            </div>
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 pb-1">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                user?.role === 'admin'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-accent/20 text-accent border border-accent/30'
              }`}>
                {user?.role === 'admin' ? 'Administrator' : 'Department User'}
              </span>
              {user?.departmentName && (
                <span className="text-xs px-3 py-1 rounded-full bg-surface-hover text-text-muted border border-border flex items-center gap-1.5">
                  <Building2 size={12} /> {user.departmentName}
                </span>
              )}
              {user?.stationCode && (
                <span className="text-xs px-3 py-1 rounded-full bg-surface-hover text-text-muted border border-border flex items-center gap-1.5">
                  <Hash size={12} /> {user.stationCode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: Account Info ── */}
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface-hover/40">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-text">Account Information</h3>
              <p className="text-xs text-text-muted">Update your name and email address</p>
            </div>
          </div>
          <form onSubmit={handleUpdateInfo} className="p-6 flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text">Display Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2.5 bg-background text-text border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  value={infoForm.name}
                  onChange={e => setInfoForm({ ...infoForm, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  className="w-full pl-9 pr-3 py-2.5 bg-background text-text border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  value={infoForm.email}
                  onChange={e => setInfoForm({ ...infoForm, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={infoLoading}
              className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-semibold transition-colors disabled:opacity-60 shadow-sm"
            >
              <Save size={15} />
              {infoLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* ── Right: Change Password ── */}
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface-hover/40">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Lock size={16} className="text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-text">Change Password</h3>
              <p className="text-xs text-text-muted">Your current password is required</p>
            </div>
          </div>
          <form onSubmit={handleUpdatePassword} className="p-6 flex flex-col gap-5">
            {/* Current Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text">Current Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  className="w-full pl-9 pr-10 py-2.5 bg-background text-text border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
                <button type="button" onClick={() => setShowCurrentPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors">
                  {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text">New Password</label>
              <div className="relative">
                <Shield size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  className="w-full pl-9 pr-10 py-2.5 bg-background text-text border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowNewPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors">
                  {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text">Confirm New Password</label>
              <div className="relative">
                {passwordsMatch
                  ? <CheckCircle size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                  : <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                }
                <input
                  type="password"
                  className={`w-full pl-9 pr-3 py-2.5 bg-background text-text border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                    passwordMismatch
                      ? 'border-secondary focus:ring-secondary/40'
                      : passwordsMatch
                      ? 'border-green-500 focus:ring-green-500/40'
                      : 'border-border focus:ring-primary/50 focus:border-primary/50'
                  }`}
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  required
                />
              </div>
              {passwordMismatch && (
                <p className="text-secondary text-xs">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-green-600 dark:text-green-400 text-xs">Passwords match ✓</p>
              )}
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 text-sm font-semibold transition-colors disabled:opacity-60 shadow-sm"
            >
              <Shield size={15} />
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
