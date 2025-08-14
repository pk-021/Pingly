
'use client';
import React from 'react';
import { CreateAnnouncementForm } from '@/components/admin/create-announcement-form';

const ManageAnnouncementsPage: React.FC = () => {

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-headline text-primary mb-6">Manage Announcements</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <CreateAnnouncementForm />
        </div>
        <div className="lg:col-span-2">
            {/* Placeholder for a list of existing announcements */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Existing Announcements</h2>
                <p className="text-muted-foreground">The list of previously sent announcements will appear here.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAnnouncementsPage;
