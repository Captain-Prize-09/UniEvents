# UniEvents — Trinity University Event Management System

> **"Building on the Rock"** — Official event management platform for Trinity University, Yaba.

---

## Scan to Open in Expo Go

Scan the QR code below with the **Expo Go** app on your Android phone, then enter the server IP when prompted.

<p align="center">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=exp%3A%2F%2F172.20.10.2%3A8081&bgcolor=ffffff&color=1B2A6B&margin=10" alt="Expo Go QR Code" width="220"/>
</p>

> **Note:** This QR code connects to the local development server. To use it, make sure your phone and PC are on the same Wi-Fi network, then run `npx expo start --clear` on the project.

---

## About

UniEvents is a **React Native** mobile app built with **Expo Go** and **Firebase** that lets Trinity University students, event organizers, and administrators manage campus events from one platform.

---

## Features

### 🎓 Students
- Browse all approved campus events with search & category filters
- Register/unregister for events in one tap
- View your registered events
- Leave star ratings and feedback after events
- In-app notifications

### 📋 Event Organizers
- Create and submit event proposals for admin review
- Edit and re-submit rejected events
- View real-time registration lists with student details
- View student feedback and average ratings per event
- Manage personal profile

### 🛡️ Administrators
- Review pending event proposals
- Approve or reject events with notes
- Dashboard with live event stats and registration counts
- Separate secure admin portal

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo SDK 54) |
| Backend | Firebase (Auth + Firestore) |
| Navigation | React Navigation v7 (Stack + Bottom Tabs) |
| State | React Context API |
| Date/Time Picker | `@react-native-community/datetimepicker` |
| Persistence | AsyncStorage |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo Go app installed on your Android phone

### Run Locally

```bash
# Clone the repo
git clone https://github.com/that-melani-hacker/UniEvents.git
cd UniEvents

# Install dependencies
npm install

# Start the development server
npx expo start --clear
```

Scan the QR code that appears in your terminal with the **Expo Go** app.

---

## User Roles

| Role | Access |
|------|--------|
| Student | Browse events, register, feedback, notifications |
| Organizer | Create/manage events, view registrations & feedback |
| Admin | Approve/reject events, view system-wide stats |

Admins sign in through the **Administrator Portal** link (bottom of the login screen). Admin accounts must be created directly in Firebase Authentication and have `role: "admin"` in Firestore.

---

## Project Structure

```
src/
├── config/         # Firebase setup + constants
├── contexts/       # AuthContext (user, role, profile)
├── navigation/     # Stack & tab navigators per role
├── screens/
│   ├── admin/      # Dashboard, PendingEvents, EventReview
│   ├── auth/       # Login, SignUp, ForgotPassword, AdminLogin
│   ├── onboarding/ # First-launch onboarding slides
│   ├── organizer/  # Dashboard, CreateEvent, EditEvent, Registrations, Feedback, Profile
│   └── student/    # EventFeed, EventDetail, MyRegistrations, Notifications, Profile, Feedback
└── services/       # authService, eventService, notificationService
```

---

<p align="center">
  Made with ❤️ for Trinity University · UniEvents v1.0
</p>
