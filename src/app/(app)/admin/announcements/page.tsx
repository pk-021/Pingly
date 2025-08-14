'use client';
import React from 'react';
import { useState } from 'react';
import { createAnnouncement } from '/src/lib/data-service';

const roles = ['HoD', 'dHoD', 'MSc Coordinator', 'Lecturer', 'Non-Teaching Staff'];

const ManageAnnouncementsPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleRoleChange = (role: string) => {
    setSelectedRoles((prevSelectedRoles) =>
      prevSelectedRoles.includes(role)
        ? prevSelectedRoles.filter((r) => r !== role)
        : [...prevSelectedRoles, role]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAnnouncement({ title, content, targetRoles: selectedRoles });
  };

  return (
    <div>
      <h1>Manage Announcements</h1>
      <div>
        <h2>Create New Announcement</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Title:</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="content">Content:</label>
            <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>
          <div>
            <p>Send to roles:</p>
            {roles.map((role) => (
              <label key={role}>
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleChange(role)}
                />
                {role}
              </label>
            ))}
          </div>
          <button type="submit">Send Announcement</button>
        </form>
      </div>
      {/* Placeholder for a list of existing announcements */}
      <div>
        <h2>Existing Announcements</h2>
        <p>List of announcements will go here.</p>
      </div>
    </div>
  );
};

export default ManageAnnouncementsPage;