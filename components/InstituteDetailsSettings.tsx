import React, { useEffect, useState } from 'react';
import { DocumentData } from 'firebase/firestore';
import { getUserProfile, updateUserProfile, uploadProfileImage } from '@/lib/firebase';

// Simple Loading Spinner Component (moved here if it's only used by this component)
const LoadingSpinner = ({ size = 'h-5 w-5', color = 'border-indigo-500' }: { size?: string, color?: string }) => (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 ${color}`}></div>
);

interface InstituteDetailsSettingsProps {
    adminUid: string;
}

const InstituteDetailsSettings: React.FC<InstituteDetailsSettingsProps> = ({ adminUid }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [form, setForm] = useState({
        institutionName: '',
        address: '',
        contactNumber: '',
        photoURL: '',
    });
    const [profileLoaded, setProfileLoaded] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            setError(null);
            try {
                if (!adminUid) {
                    setError('Admin UID not found.');
                    setLoading(false);
                    return;
                }
                const profile = await getUserProfile(adminUid);
                if (!profile) throw new Error('Profile not found');
                setForm({
                    institutionName: profile.institutionName || '',
                    address: profile.address || '',
                    contactNumber: profile.contactNumber || '',
                    photoURL: profile.photoURL || '',
                });
                setLogoPreview(profile.photoURL || null);
                setProfileLoaded(true);
            } catch (err: any) {
                setError(err.message || 'Failed to load institute details.');
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [adminUid]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setLogoUploading(true);
        setError(null);
        setSuccess(null);
        try {
            if (!adminUid) throw new Error('Admin UID not found.');
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
            // Upload
            const url = await uploadProfileImage(adminUid, file);
            setForm(prev => ({ ...prev, photoURL: url }));
            setSuccess('Logo uploaded successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to upload logo.');
        } finally {
            setLogoUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            if (!adminUid) throw new Error('Admin UID not found.');
            await updateUserProfile(adminUid, {
                institutionName: form.institutionName,
                address: form.address,
                contactNumber: form.contactNumber,
                photoURL: form.photoURL,
            });
            setSuccess('Institute details updated successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to update details.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="py-8 text-center text-gray-500 dark:text-gray-300">Loading institute details...</div>;

    return (
        <form className="max-w-xl mx-auto space-y-6" onSubmit={handleSave}>
            <h3 className="text-xl font-semibold mb-2">Institute Details</h3>
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
            {success && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>}
            <div>
                <label className="block text-sm font-medium mb-1">Institute Name <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    name="institutionName"
                    value={form.institutionName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Contact Number</label>
                <input
                    type="text"
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleInputChange}
                    maxLength={15}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Institute Logo</label>
                <div className="flex items-center gap-4">
                    {logoPreview ? (
                        <img src={logoPreview} alt="Logo Preview" className="h-16 w-16 object-contain rounded bg-gray-100 dark:bg-gray-700 border" />
                    ) : (
                        <div className="h-16 w-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border rounded text-gray-400">No Logo</div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        disabled={logoUploading}
                        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {logoUploading && <span className="text-xs text-gray-500 ml-2">Uploading...</span>}
                </div>
            </div>
            <div>
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default InstituteDetailsSettings; 