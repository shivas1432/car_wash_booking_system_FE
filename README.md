# Car Wash Booking App – Frontend

Still under Maintenance..................

## 🔷 Tech Stack

- React 18
- React Router DOM v6
- Firebase (Google OAuth)
- Axios
- Socket.io-client
- Date-fns
- Node-fetch
- Babel (optional chaining support)

## ✨ Features

- 🧾 User Registration & Login
- 🔒 Token expiration & auto-logout
- 🔐 Google OAuth Login
- 📅 Book a Car Wash
- 🗓 View Bookings
- 🧑 Profile Page + Picture Upload
- 🎁 Offers & Opening Times
- 📊 Admin Dashboard
- 🔐 Protected Routes (RBAC)

## 📁 Folder Structure

/public  
/src  
/components  
/context  
/css  
App.js  
index.js  
.gitignore  
package.json  
README.md  

## 🧪 Available Scripts

In the project directory, run:

```bash
npm install
npm start
Runs the app in development mode:  
Open http://localhost:3000 to view it in the browser.

🔐 Environment Setup  
No environment variables are required for basic development.  
For production OAuth and Firebase, configure them via Firebase Console.

🌐 Routes Overview

| Route            | Access  | Description           |
|------------------|---------|-----------------------|
| `/`              | Public  | Landing page          |
| `/login`         | Public  | Login form            |
| `/register`      | Public  | Register form         |
| `/homepage`      | Public  | Call to action page   |
| `/profile`       | Private | User profile          |
| `/booking`       | Private | Book a car wash       |
| `/my-bookings`   | Private | View user bookings    |
| `/offers`        | Public  | View ongoing offers   |
| `/opening-times` | Public  | Check timings         |
| `/admin`         | Admin   | Admin dashboard       |



📌 Note  
Compatible with backend at http://localhost:5000  
Ensure CORS and cookie credentials are set properly.
