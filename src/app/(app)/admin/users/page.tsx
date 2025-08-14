// src/app/(app)/admin/users/page.tsx

import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, updateUserIsAdmin } from '@/lib/data-service';
import { UserProfile } from '@/lib/types';

const UserManagementPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await getAllUsers();
      setUsers(usersList);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserProfile['role']) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAdminChange = async (userId: string, isAdmin: boolean) => {
    try {
      await updateUserIsAdmin(userId, isAdmin);
      setUsers(users.map(u => u.id === userId ? { ...u, isAdmin } : u));
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.displayName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserProfile['role'])}
                    className="p-2 border rounded-md"
                  >
                    <option value="HoD">HoD</option>
                    <option value="dHoD">dHoD</option>
                    <option value="MSc Coordinator">MSc Coordinator</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Non-Teaching Staff">Non-Teaching Staff</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={user.isAdmin}
                    onChange={(e) => handleAdminChange(user.id, e.target.checked)}
                    className="h-5 w-5"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
