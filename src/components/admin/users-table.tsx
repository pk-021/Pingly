
'use client';
import React from 'react';
import type { UserProfile } from '@/lib/types';
import { updateUserRole, updateUserIsAdmin } from '@/lib/data-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';

interface UsersTableProps {
    users: UserProfile[];
    onUserUpdate: (user: UserProfile) => void;
    isLoading: boolean;
}

export function UsersTable({ users, onUserUpdate, isLoading }: UsersTableProps) {

    const handleRoleChange = async (userId: string, newRole: UserProfile['role']) => {
        try {
            await updateUserRole(userId, newRole);
            const updatedUser = users.find(u => u.id === userId);
            if (updatedUser) {
                onUserUpdate({ ...updatedUser, role: newRole });
            }
        } catch (error: any) {
            alert(error.message); // Simple error handling for now
        }
    };

    const handleAdminChange = async (userId: string, isAdmin: boolean) => {
        try {
            await updateUserIsAdmin(userId, isAdmin);
            const updatedUser = users.find(u => u.id === userId);
            if (updatedUser) {
                onUserUpdate({ ...updatedUser, isAdmin });
            }
        } catch (error: any) {
            alert(error.message);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="w-1/4"><Skeleton className="h-5 w-full" /></div>
                                <div className="w-1/4"><Skeleton className="h-5 w-full" /></div>
                                <div className="w-1/4"><Skeleton className="h-5 w-full" /></div>
                                <div className="w-1/4 flex justify-center"><Skeleton className="h-5 w-5" /></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-center">Admin</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.displayName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Select
                                        value={user.role}
                                        onValueChange={(value) => handleRoleChange(user.id, value as UserProfile['role'])}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HoD">HoD</SelectItem>
                                            <SelectItem value="dHoD">dHoD</SelectItem>
                                            <SelectItem value="MSc Coordinator">MSc Coordinator</SelectItem>
                                            <SelectItem value="Lecturer">Lecturer</SelectItem>
                                            <SelectItem value="Non-Teaching Staff">Non-Teaching Staff</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Checkbox
                                        checked={user.isAdmin}
                                        onCheckedChange={(checked) => handleAdminChange(user.id, !!checked)}
                                        className="h-5 w-5"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
