import React, { useEffect, useState } from 'react';
import { getAllAdmins, getAllUsers, updateUserProfile } from '@/lib/firebase';

type Admin = { id: string; name?: string; email: string; role: string };

const CollaboratorsSettings = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    setError(null);
    try {
      const list = await getAllAdmins();
      setAdmins(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load admins.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    setSuccess(null);
    try {
      // Find user by email
      const users = await getAllUsers();
      const user = users.find(u => u.email === newAdminEmail);
      if (!user) throw new Error('User not found.');
      await updateUserProfile(user.id, { role: 'admin' });
      setSuccess('Admin privileges granted.');
      setNewAdminEmail('');
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to add admin.');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveAdmin(uid: string) {
    setRemoving(uid);
    setError(null);
    setSuccess(null);
    try {
      await updateUserProfile(uid, { role: 'faculty' });
      setSuccess('Admin privileges removed.');
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to remove admin.');
    } finally {
      setRemoving('');
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Collaborators</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-2">Manage users with admin privileges.</p>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>}
      <form onSubmit={handleAddAdmin} className="flex gap-2 mb-4">
        <input
          type="email"
          placeholder="User email"
          value={newAdminEmail}
          onChange={e => setNewAdminEmail(e.target.value)}
          className="px-3 py-2 border rounded-md"
          required
        />
        <button type="submit" disabled={adding} className="bg-indigo-600 text-white px-4 py-2 rounded-md">
          {adding ? 'Adding...' : 'Add Admin'}
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {admins.map(admin => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{admin.name || admin.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{admin.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleRemoveAdmin(admin.id)}
                    disabled={removing === admin.id}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded-md"
                  >
                    {removing === admin.id ? 'Removing...' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollaboratorsSettings; 