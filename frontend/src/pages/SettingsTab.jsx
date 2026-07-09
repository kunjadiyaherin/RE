import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, LogOut, Sun, Moon, Database } from 'lucide-react';
import { apiService } from '../apiService';

export default function SettingsTab({ onLogout, currentUser, theme, toggleTheme }) {
  const [profile, setProfile] = useState(currentUser || null);
  const [loading, setLoading] = useState(!currentUser);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user = await apiService.getMe();
        setProfile(user);
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    }
    if (!currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div class="flex items-center justify-center h-[50vh]">
        <p class="text-brand-muted text-sm font-semibold">Retrieving secure user metadata...</p>
      </div>
    );
  }

  const userRole = profile?.role || 'investor';
  const registrationDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A';

  return (
    <div class="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-brand-text">Account Settings & Profile</h1>
        <p class="text-sm text-brand-muted">Manage your theme preferences, view security credentials, and check database record synchronization state.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Card */}
        <div class="glass-panel p-6 rounded-lg md:col-span-2 space-y-6">
          <div class="flex items-center gap-4 pb-4 border-b border-brand-border/60">
            <div class="w-14 h-14 rounded-full bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-xl font-bold text-brand-accent">
              {(profile?.username || 'G').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 class="text-lg font-bold text-brand-text">{profile?.username || 'Guest Analyst'}</h3>
              <span class="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-accent/10 text-brand-accent border border-brand-accent/20 rounded mt-1">
                Role: {userRole}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="flex items-center gap-3 p-3.5 bg-brand-bg/40 border border-brand-border/30 rounded">
              <Mail class="w-5 h-5 text-brand-muted shrink-0" />
              <div>
                <span class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider">Email Address</span>
                <span class="text-xs text-brand-text font-semibold break-all">{profile?.email || 'guest@propertyintel.com'}</span>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3.5 bg-brand-bg/40 border border-brand-border/30 rounded">
              <Shield class="w-5 h-5 text-brand-muted shrink-0" />
              <div>
                <span class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider">Security State</span>
                <span class="text-xs text-brand-success font-bold flex items-center gap-1 mt-0.5">
                  Verified Node Access
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3.5 bg-brand-bg/40 border border-brand-border/30 rounded">
              <Calendar class="w-5 h-5 text-brand-muted shrink-0" />
              <div>
                <span class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider">Registration Date</span>
                <span class="text-xs text-brand-text font-semibold">{registrationDate}</span>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3.5 bg-brand-bg/40 border border-brand-border/30 rounded">
              <Database class="w-5 h-5 text-brand-muted shrink-0" />
              <div>
                <span class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider">Active Workspace</span>
                <span class="text-xs text-brand-text font-semibold font-mono">NODE-01 / ACTIVE</span>
              </div>
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <button
              onClick={onLogout}
              class="flex items-center gap-2 px-4 py-2 bg-brand-danger/10 border border-brand-danger/30 hover:bg-brand-danger/20 text-brand-danger text-xs font-bold rounded transition-colors"
            >
              <LogOut class="w-4 h-4" />
              <span>Log Out Securely</span>
            </button>
          </div>
        </div>

        {/* Preferences / Theme Options */}
        <div class="glass-panel p-6 rounded-lg space-y-6">
          <h3 class="text-xs font-bold uppercase tracking-wider text-brand-text border-b border-brand-border/60 pb-3">System Preferences</h3>
          
          <div class="space-y-4">
            <div>
              <span class="block text-[10px] text-brand-muted uppercase font-bold tracking-wider mb-2">Display Theme</span>
              <div class="grid grid-cols-2 gap-2">
                <button
                  onClick={() => theme !== 'light' && toggleTheme()}
                  class={`flex flex-col items-center justify-center p-4 border rounded gap-2 transition-all ${
                    theme === 'light'
                      ? 'bg-brand-accent/5 border-brand-accent text-brand-accent font-bold'
                      : 'bg-brand-bg/20 border-brand-border text-brand-muted hover:text-brand-text'
                  }`}
                >
                  <Sun class="w-5 h-5" />
                  <span class="text-xs">Light Mode</span>
                </button>
                
                <button
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  class={`flex flex-col items-center justify-center p-4 border rounded gap-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-brand-accent/5 border-brand-accent text-brand-accent font-bold'
                      : 'bg-brand-bg/20 border-brand-border text-brand-muted hover:text-brand-text'
                  }`}
                >
                  <Moon class="w-5 h-5" />
                  <span class="text-xs">Dark Mode</span>
                </button>
              </div>
            </div>

            <div class="pt-4 border-t border-brand-border/40 text-[10px] text-brand-muted leading-relaxed space-y-1.5">
              <p>• Themes affect dashboard tables, maps, charts, and verification sheets.</p>
              <p>• Preferences are persisted locally in the client storage.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
