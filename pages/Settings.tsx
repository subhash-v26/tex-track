import React, { useState, useEffect } from 'react';
import { useData } from '../services/DataService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { Lock, LogOut, User as UserIcon, Pencil, Check, X, ChevronLeft, Sparkles, Trash2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, logout, updateUser, loadDemoData, clearAllData, isDemoMode } = useData();
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Sync profile form when editing starts
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email
      });
    }
  }, [user, isEditingProfile]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && profileForm.name && profileForm.email) {
      updateUser({
        ...user,
        name: profileForm.name,
        email: profileForm.email
      });
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
        alert("New passwords do not match");
        return;
    }
    alert('Password changed successfully (Simulated)');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
      </div>

      {/* Profile Section */}
      <Card 
        title="Admin Profile" 
        action={
          !isEditingProfile && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )
        }
      >
        {isEditingProfile ? (
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                value={profileForm.name}
                onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                required
              />
              <Input 
                label="Email Address" 
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIsEditingProfile(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
                {user?.name.charAt(0) || <UserIcon />}
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">{user?.name}</h3>
              <p className="text-slate-500">{user?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-2">
                {user?.role}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Password Change */}
      <Card title="Security">
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
           <Input 
             label="Current Password" 
             type="password" 
             value={passwordData.current}
             onChange={e => setPasswordData({...passwordData, current: e.target.value})}
           />
           <Input 
             label="New Password" 
             type="password" 
             value={passwordData.new}
             onChange={e => setPasswordData({...passwordData, new: e.target.value})}
           />
           <Input 
             label="Confirm New Password" 
             type="password" 
             value={passwordData.confirm}
             onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
           />
           <div className="pt-2">
             <Button type="submit">
               <Lock className="w-4 h-4 mr-2" />
               Update Password
             </Button>
           </div>
        </form>
      </Card>

        {/* Factory Data Management */}
        <Card title="Data & Demo Environment">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-slate-900">Demo Factory Data</h4>
                  {isDemoMode && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Populate products, workforce, and 14 days of realistic manufacturing runs to test charts, piece-rate wages, and stock inventory.
                </p>
              </div>
              <Button 
                type="button" 
                onClick={() => {
                  loadDemoData();
                  alert("Demo factory dataset loaded successfully!");
                }}
                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isDemoMode ? "Reload Demo Data" : "Load Demo Data"}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Reset Local Database Cache</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Clear all local logs, products, and offline records to start with a blank factory workspace.
                </p>
              </div>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => {
                  if (confirm("Are you sure you want to clear all factory logs and products?")) {
                    clearAllData();
                    alert("All data cleared successfully.");
                  }
                }}
                className="shrink-0 text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Local Data
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-100 bg-red-50/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-red-700">Sign Out</h3>
              <p className="text-red-500/80 text-sm">End your current session safely.</p>
            </div>
            <Button variant="danger" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </Card>
      </div>
    );
};