# Pingly - Your Faculty Scheduling Assistant

This is a Next.js application built in Firebase Studio. It serves as a personal scheduling and management tool for faculty members.

## Getting Started

To run this application locally, you would typically use the following command:

```bash
npm run dev
```

This will start the development server, and you can access the app in your browser, usually at `http://localhost:9003`.

## Features

### 1. Dashboard
- Your landing page after logging in.
- Provides a quick overview of your daily schedule, including classes from your routine and any tasks you've scheduled for the day.
- Displays recent announcements from the administration.

### 2. Calendar & Task Management
- A full monthly calendar view.
- **Add Tasks**: Click the "Add Task" button to create new tasks. You can set a title, due date, priority, and description.
- **Schedule Tasks**: Optionally, you can assign a specific start and end time to a task, which will block out time on your schedule. Tasks without a specific time are considered "all-day" tasks.
- **Edit & Delete Tasks**: Click on any task in the calendar or the side panel to open a dialog where you can edit its details, mark it as complete, or delete it.

### 3. Class Routine
- Set up your recurring weekly teaching or faculty schedule.
- Events added here will appear every week on the corresponding day.
- This routine is used as the baseline for your availability.

### 4. Empty Slot Finder
- Automatically analyzes your **Class Routine** and your **scheduled tasks**.
- Displays a list of all available time slots during the week where you have no scheduled commitments.
- This is perfect for finding time to meet with students or colleagues.

### 5. Admin Panel
If your user account has been granted admin privileges, you will see an "Admin" section in the sidebar.

- **User Management**:
    - View a table of all registered users.
    - Change a user's role (e.g., 'Lecturer', 'HoD').
    - Grant or revoke admin access for any user.
- **Announcements**:
    - Create and send announcements.
    - You can target announcements to specific roles (e.g., only 'HoD' and 'dHoD').
    - Sent announcements will appear on the dashboards of all users who have the selected roles.

### 6. Settings
- **Nepali Calendar**: Enable or disable the integration of Nepali public holidays, which will appear on your calendar.
- **Profile Management**: Log out or manage your account details via the user profile menu at the bottom of the sidebar.

---

This README should provide a good overview of how to interact with the application you've built.