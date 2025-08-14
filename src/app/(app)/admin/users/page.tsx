
// src/app/(app)/admin/users/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { getAllUsers } from '@/lib/data-service';
import type { UserProfile } from '@/lib/types';
import { UsersTable } from '@/components/admin/users-table';

const UserManagementPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const usersList = await getAllUsers();
      setUsers(usersList);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline text-primary mb-6">User Management</h1>
      <UsersTable users={users} onUserUpdate={handleUserUpdate} isLoading={isLoading} />
    </div>
  );
};

export default UserManagementPage;
