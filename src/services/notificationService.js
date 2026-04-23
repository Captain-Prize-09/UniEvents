import {
  collection, addDoc, query, where,
  onSnapshot, updateDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';

export async function storeNotification(uid, title, body, data = {}) {
  await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    uid, title, body, data, read: false,
    createdAt: serverTimestamp(),
  });
}

export function listenNotifications(uid, callback) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('uid', '==', uid),
  );
  return onSnapshot(q, (snap) => {
    const sorted = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      .slice(0, 50);
    callback(sorted);
  });
}

export async function markNotificationRead(notifId) {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notifId), { read: true });
}
