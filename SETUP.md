# Trinity University EMS — Setup Guide

## 1. Place Firebase Config Files

| File | Destination |
|------|-------------|
| `google-services.json` | `TrinityEMS/android/app/google-services.json` |
| `GoogleService-Info.plist` | `TrinityEMS/ios/GoogleService-Info.plist` |

> For Expo managed workflow, you can also place them at the **project root**  
> (`TrinityEMS/google-services.json` and `TrinityEMS/GoogleService-Info.plist`).  
> The `app.json` already has the `googleServicesFile` paths configured for both.

---

## 2. Firestore Indexes Required

In the Firebase Console → Firestore → Indexes, create the following **composite indexes**:

| Collection | Fields | Order |
|------------|--------|-------|
| `events` | `status` ASC, `createdAt` DESC | Ascending / Descending |
| `events` | `organizerUid` ASC, `createdAt` DESC | Ascending / Descending |
| `registrations` | `studentUid` ASC | Ascending |
| `notifications` | `uid` ASC, `createdAt` DESC | Ascending / Descending |

---

## 3. Upload Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

Or paste the contents of `firestore.rules` directly in the Firebase Console.

---

## 4. Create the First Admin User

1. Sign up normally through the app as any role.
2. In the Firebase Console → Firestore → `users` collection, find the document for your UID.
3. Manually change the `role` field to `"admin"`.
4. Sign out and sign back in — the app will route you to the Admin dashboard.

---

## 5. Running the App

```bash
cd TrinityEMS
npm start          # Expo Go (no native Firebase modules)
npm run android    # Android emulator / device (requires native build)
```

> **Important:** `@react-native-firebase` requires a **native build**.  
> Use `expo run:android` or `eas build` — Expo Go alone will not work.

```bash
npx expo run:android
```

---

## 6. FCM Push Notifications (Server-Side)

When an admin approves/rejects an event, the app writes a notification document  
to `notifications/{id}`. To send a real push notification to the device, call the  
**Firebase Admin SDK** from a Cloud Function:

```js
// Cloud Function trigger on events/{eventId} status change
exports.onEventStatusChange = functions.firestore
  .document('events/{eventId}')
  .onUpdate(async (change) => {
    const after = change.after.data();
    const before = change.before.data();
    if (before.status === after.status) return;

    const organizerDoc = await admin.firestore()
      .collection('users').doc(after.organizerUid).get();
    const fcmToken = organizerDoc.data()?.fcmToken;
    if (!fcmToken) return;

    return admin.messaging().send({
      token: fcmToken,
      notification: {
        title: after.status === 'approved'
          ? `Event Approved: ${after.title}`
          : `Event Rejected: ${after.title}`,
        body: after.adminNote || 'Check the app for details.',
      },
    });
  });
```

---

## Project Structure

```
TrinityEMS/
├── App.js                        ← Entry point
├── app.json                      ← Expo + Firebase plugin config
├── firestore.rules               ← Security rules
├── google-services.json          ← ← PLACE HERE (Android)
├── GoogleService-Info.plist      ← ← PLACE HERE (iOS)
└── src/
    ├── config/
    │   └── firebase.js           ← Service exports + constants
    ├── contexts/
    │   └── AuthContext.js        ← Auth state + role provider
    ├── hooks/
    │   └── useFCM.js             ← FCM permission + message handler
    ├── navigation/
    │   ├── AppNavigator.js       ← Role router
    │   ├── AuthNavigator.js
    │   ├── StudentNavigator.js
    │   ├── OrganizerNavigator.js
    │   └── AdminNavigator.js
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.js
    │   │   ├── SignUpScreen.js
    │   │   └── ForgotPasswordScreen.js
    │   ├── student/
    │   │   ├── EventFeedScreen.js       ← Real-time feed + search/filter
    │   │   ├── EventDetailScreen.js     ← Registration toggle
    │   │   ├── MyRegistrationsScreen.js
    │   │   └── FeedbackScreen.js        ← Star rating + comment
    │   ├── organizer/
    │   │   ├── OrganizerDashboardScreen.js
    │   │   ├── CreateEventScreen.js     ← Image upload → Storage
    │   │   └── EditEventScreen.js
    │   └── admin/
    │       ├── AdminDashboardScreen.js  ← Stats overview
    │       ├── PendingEventsScreen.js   ← Filter by status
    │       └── EventReviewScreen.js     ← Approve / Reject + notify
    └── services/
        ├── authService.js        ← signIn / signUp / signOut / FCM token
        ├── eventService.js       ← CRUD + real-time listeners
        └── notificationService.js← FCM setup + Firestore notifications
```
