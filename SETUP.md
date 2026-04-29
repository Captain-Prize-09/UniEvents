# Trinity University EMS — Setup Guide

This project is built with **Expo (SDK 54)** and **Firebase**.

## 1. Prerequisites

- **Node.js** (v20 or newer recommended)
- **Expo Go** app on your mobile device (latest version from Play Store/App Store)
- **Firebase Project** with Firestore and Authentication enabled.

## 2. Configuration Files

Ensure the following files are in the project root:

| File                       | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| `google-services.json`     | Firebase configuration for Android            |
| `GoogleService-Info.plist` | Firebase configuration for iOS                |
| `src/config/firebase.js`   | Web SDK configuration (API keys, project IDs) |

> **Note:** These files are already configured for the current Firebase project (`trinityems-1c506`).

## 3. Installation

If you are transferring this project to a new system:

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Start the development server
npx expo start --tunnel
```

## 4. Firestore Setup (In Firebase Console)

### Security Rules

Copy the contents of `firestore.rules` and paste them into the **Rules** tab of your Firestore Database in the Firebase Console.

### Required Indexes

Create the following **composite indexes** in the Firebase Console (Firestore -> Indexes):

| Collection      | Fields                               | Order                  |
| --------------- | ------------------------------------ | ---------------------- |
| `events`        | `status` ASC, `createdAt` DESC       | Ascending / Descending |
| `events`        | `organizerUid` ASC, `createdAt` DESC | Ascending / Descending |
| `notifications` | `uid` ASC, `createdAt` DESC          | Ascending / Descending |

## 5. Authentication

Enable **Email/Password** sign-in in the Firebase Console (Authentication -> Sign-in method).

## 6. Creating the First Admin User

1. Sign up normally through the app.
2. In the Firebase Console -> Firestore -> `users` collection, find your document.
3. Manually change the `role` field to `"admin"`.
4. Sign out and sign back in to access the Admin Dashboard.

## 7. Running the App

- Use `npx expo start --tunnel` to run via Expo Go.
- Use `npm run android` only if you have the Android SDK and a native environment set up.
