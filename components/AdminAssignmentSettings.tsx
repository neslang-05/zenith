import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserProfile } from '@/lib/firebase';

type User = { id: string; name?: string; email: string; role: string };

const AdminAssignmentSettings = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const list = await getAllUsers();
      setUsers(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(uid: string, newRole: string) {
    setUpdating(uid);
    setError(null);
    setSuccess(null);
    try {
      await updateUserProfile(uid, { role: newRole });
      setSuccess('Role updated.');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update role.');
    } finally {
      setUpdating('');
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Admin Assignment</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-2">Assign users to the admin page.</p>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{user.name || user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  {user.role !== 'admin' ? (
                    <button
                      onClick={() => handleRoleChange(user.id, 'admin')}
                      disabled={updating === user.id}
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 px-2 py-1 rounded-md"
                    >
                      {updating === user.id ? 'Promoting...' : 'Promote to Admin'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRoleChange(user.id, 'faculty')}
                      disabled={updating === user.id}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded-md"
                    >
                      {updating === user.id ? 'Demoting...' : 'Remove Admin'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAssignmentSettings; 