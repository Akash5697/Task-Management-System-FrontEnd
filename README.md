Environment Variables
Create a .env file in the root directory.

.env
VITE_API_URL=http://localhost:4000

Installation & Setup
1. Clone Repository
git clone <your_repository_url>

2. Install Dependencies
npm install

3. Start Development Server
npm run dev

Default Development URL
http://localhost:5173

Backend Requirement
Make sure the backend server is running before starting the frontend.

Backend should run on:
http://localhost:4000
-------------------------------------------------------------
Important Note
-------------------------------------------------------------
By default, every newly registered user is assigned the employee role.
To access the Admin Dashboard for the first time, manually update a user's role from the database to admin.
Example in MongoDB:

role: "Admin"

Once a user is assigned the admin role, that user will gain access to the Admin Dashboard and all admin privileges.


FrontEnd Architecture Explanation
-----------------------------------------------
The frontend is a React + Vite app.
It uses a single-page app flow with role-based dashboards.
The structure is kept simple: UI components, service layer, constants, and shared styling.
Core Flow

FrontEnd/src/App.jsx:1
Main app controller
Handles login/register state
Stores auth token and user in localStorage
Routes users to the right dashboard based on role
Folders / Layers

FrontEnd/src/components/auth/*

Login/register UI
Shared auth tabs
Small reusable auth forms
FrontEnd/src/components/admin/AdminDashboard.jsx:1

Admin UI
Shows users, task stats, and all tasks
Supports create/update/delete user actions
FrontEnd/src/components/employee/EmployeeDashboard.jsx:1

Employee UI
Shows profile and assigned tasks
Lets employee update task status
FrontEnd/src/components/manager/ManagerDashboard.jsx:1

Manager UI
Creates tasks, assigns employees, updates tasks, deletes tasks
Includes search and task listing
FrontEnd/src/components/ui/ToastContainer.jsx:1

Lightweight toast notifications
FrontEnd/src/services/*.js

API wrapper layer
Keeps fetch calls out of components
Examples:
authService.js
adminService.js
employeeService.js
managerService.js
FrontEnd/src/constants/storageKeys.js:1

Central place for localStorage keys like token, user, theme
FrontEnd/src/App.css:1

Shared responsive styles
Theme styles
Dashboard/table/layout styles
Authentication Flow

User logs in or registers
Backend returns token and user
Frontend stores them in localStorage
On refresh, app checks session via /api/profile
Based on user.role, it renders:
Admin dashboard
Manager dashboard
Employee dashboard
or a basic authenticated view
Design Approach

Basic and reusable UI
Role-based rendering in one app shell
Small components instead of one giant page
Shared service functions for all API calls
Responsive layout with mobile-friendly breakpoints
Dark mode and toast notifications are handled globally
