"use client";

import React, { useState, useEffect } from 'react';
import StudentLayout from '../StudentLayout';
import { Mail, Phone, Calendar, Building, Users, MapPin, Pencil, X, Check, Camera } from 'lucide-react';
import { auth, getUserProfile, updateUserProfile, uploadProfileImage } from '@/lib/firebase';
import { DocumentData } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';

interface ProfileFieldProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  isEditing: boolean;
  onEdit?: (value: string) => void;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, icon, isEditing, onEdit }) => (
  <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
    <div className="p-2 bg-indigo-100 rounded-lg">
      {icon}
    </div>
    <div className="flex-grow">
      <p className="text-sm text-gray-500">{label}</p>
      {isEditing && onEdit ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onEdit(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      ) : (
        <p className="text-gray-800">{value}</p>
      )}
    </div>
  </div>
);

const StudentProfilePage = () => {
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<DocumentData | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
          setEditedProfile(profile);
          setProfileImage(profile?.photoURL || null);
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [currentUserUid]);

  const handleEdit = (field: string, value: string) => {
    if (editedProfile) {
      setEditedProfile({ ...editedProfile, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!currentUserUid || !editedProfile) return;
    setSaving(true);
    try {
      await updateUserProfile(currentUserUid, editedProfile);
      setProfileData(editedProfile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUserUid) return;

    try {
      const photoURL = await uploadProfileImage(currentUserUid, file);
      setProfileImage(photoURL);
      if (editedProfile) {
        setEditedProfile({ ...editedProfile, photoURL });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
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

  const profile = isEditing ? editedProfile : profileData;

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedProfile(profileData);
                }}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-semibold text-gray-400">
                    {profile?.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white cursor-pointer hover:bg-indigo-700">
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-800">{profile?.name || 'Student Name'}</h2>
            <p className="text-gray-500">{profile?.studentId || 'Student ID'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileField
            label="Email"
            value={profile?.email || ''}
            icon={<Mail className="h-5 w-5 text-indigo-600" />}
            isEditing={false}
          />
          <ProfileField
            label="Phone"
            value={profile?.phoneNumber || ''}
            icon={<Phone className="h-5 w-5 text-indigo-600" />}
            isEditing={isEditing}
            onEdit={(value) => handleEdit('phoneNumber', value)}
          />
          <ProfileField
            label="Date of Birth"
            value={profile?.dateOfBirth || ''}
            icon={<Calendar className="h-5 w-5 text-indigo-600" />}
            isEditing={isEditing}
            onEdit={(value) => handleEdit('dateOfBirth', value)}
          />
          <ProfileField
            label="Gender"
            value={profile?.gender || ''}
            icon={<Users className="h-5 w-5 text-indigo-600" />}
            isEditing={isEditing}
            onEdit={(value) => handleEdit('gender', value)}
          />
          <ProfileField
            label="Institution"
            value={profile?.institutionName || ''}
            icon={<Building className="h-5 w-5 text-indigo-600" />}
            isEditing={isEditing}
            onEdit={(value) => handleEdit('institutionName', value)}
          />
          <ProfileField
            label="Address"
            value={profile?.address || ''}
            icon={<MapPin className="h-5 w-5 text-indigo-600" />}
            isEditing={isEditing}
            onEdit={(value) => handleEdit('address', value)}
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Bio</h3>
          {isEditing ? (
            <textarea
              value={profile?.bio || ''}
              onChange={(e) => handleEdit('bio', e.target.value)}
              className="w-full h-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{profile?.bio || 'No bio available.'}</p>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfilePage; 