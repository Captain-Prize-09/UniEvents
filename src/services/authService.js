import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, COLLECTIONS, ROLES } from '../config/firebase';

export async function signUp(email, password, displayName, role = ROLES.STUDENT) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  await updateProfile(user, { displayName });

  // Create Firestore profile immediately — no email verification required
  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
    uid: user.uid,
    email,
    displayName,
    role,
    photoURL: null,
    department: '',
    matricNumber: '',
    createdAt: serverTimestamp(),
    fcmToken: null,
  });

  return user;
}

export async function signIn(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function updateUserProfile(uid, updates) {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), updates);
}

export async function saveFCMToken(uid, token) {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), { fcmToken: token });
}
