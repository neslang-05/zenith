"use client";

import React, { useState, useEffect } from 'react';
import StudentLayout from '../StudentLayout';
import { Bell, Lock, User, Moon, Sun, Globe, ChevronRight, Shield, Eye, EyeOff } from 'lucide-react';
import { auth, updateUserProfile, getUserProfile } from '@/lib/firebase';
import { DocumentData } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, children }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-600 mb-6">{description}</p>
    {children}
  </div>
);

interface ToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, label }) => (
  <div className="flex items-center justify-between">
    {label && <span className="text-sm text-gray-700">{label}</span>}
    <button
      type="button"
      className={`${
        enabled ? 'bg-indigo-600' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
      onClick={() => onChange(!enabled)}
    >
      <span
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);

const StudentSettingsPage = () => {
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [language, setLanguage] = useState('english');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserUid(user.uid);
      } else {
        setCurrentUserUid(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUserUid) {
        setLoading(true);
        try {
          const profile = await getUserProfile(currentUserUid);
          setProfileData(profile);
          // Initialize settings from profile if available
          if (profile?.settings) {
            setDarkMode(profile.settings.darkMode ?? false);
            setEmailNotifications(profile.settings.emailNotifications ?? true);
            setPushNotifications(profile.settings.pushNotifications ?? true);
            setSmsNotifications(profile.settings.smsNotifications ?? false);
            setLanguage(profile.settings.language ?? 'english');
            setTwoFactorAuth(profile.settings.twoFactorAuth ?? false);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [currentUserUid]);

  const handleSaveSettings = async () => {
    if (!currentUserUid) return;

    const settings = {
      darkMode,
      emailNotifications,
      pushNotifications,
      smsNotifications,
      language,
      twoFactorAuth,
    };

    try {
      await updateUserProfile(currentUserUid, { settings });
      // Show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <SettingsSection
          title="Account Settings"
          description="Manage your account security and personal preferences"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Profile Information</p>
                  <p className="text-sm text-gray-500">Update your personal information</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Lock className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Password</p>
                  <p className="text-sm text-gray-500">Change your password</p>
                </div>
              </div>
              <button 
                className="flex items-center text-sm text-indigo-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Shield className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
              </div>
              <Toggle enabled={twoFactorAuth} onChange={setTwoFactorAuth} />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Appearance"
          description="Customize how Zenith looks on your device"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  {darkMode ? (
                    <Moon className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <Sun className="h-5 w-5 text-indigo-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">Dark Mode</p>
                  <p className="text-sm text-gray-500">Toggle dark mode on or off</p>
                </div>
              </div>
              <Toggle enabled={darkMode} onChange={setDarkMode} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Globe className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Language</p>
                  <p className="text-sm text-gray-500">Choose your preferred language</p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
              </select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Notifications"
          description="Choose how you want to receive notifications"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Bell className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
              </div>
              <Toggle enabled={emailNotifications} onChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Bell className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive push notifications</p>
                </div>
              </div>
              <Toggle enabled={pushNotifications} onChange={setPushNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Bell className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
              </div>
              <Toggle enabled={smsNotifications} onChange={setSmsNotifications} />
            </div>
          </div>
        </SettingsSection>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentSettingsPage;