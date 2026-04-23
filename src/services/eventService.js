import {
  collection, doc, addDoc, updateDoc, getDoc,
  onSnapshot, query, where, serverTimestamp,
  increment, writeBatch,
} from 'firebase/firestore';
import { db, COLLECTIONS, EVENT_STATUS } from '../config/firebase';

// ─── Events ───────────────────────────────────────────────────────────────────

export async function createEvent(organizerUid, eventData) {
  const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
    ...eventData,
    organizerUid,
    imageUrl: null,
    status: EVENT_STATUS.PENDING,
    registrationCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateEvent(eventId, updates) {
  await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
    ...updates,
    status: EVENT_STATUS.PENDING,
    updatedAt: serverTimestamp(),
  });
}

export async function setEventStatus(eventId, status, adminNote = '') {
  await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
    status,
    adminNote,
    updatedAt: serverTimestamp(),
  });
}

export async function getEvent(eventId) {
  const snap = await getDoc(doc(db, COLLECTIONS.EVENTS, eventId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

const sortByDate = (docs) =>
  docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

export function listenApprovedEvents(callback) {
  const q = query(
    collection(db, COLLECTIONS.EVENTS),
    where('status', '==', EVENT_STATUS.APPROVED),
  );
  return onSnapshot(q, (snap) => {
    callback(sortByDate(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  });
}

export function listenOrganizerEvents(organizerUid, callback) {
  const q = query(
    collection(db, COLLECTIONS.EVENTS),
    where('organizerUid', '==', organizerUid),
  );
  return onSnapshot(q, (snap) => {
    callback(sortByDate(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  });
}

export function listenAllEvents(callback) {
  return onSnapshot(collection(db, COLLECTIONS.EVENTS), (snap) => {
    callback(sortByDate(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  });
}

// ─── Registrations ────────────────────────────────────────────────────────────

export async function registerForEvent(studentUid, eventId) {
  const regRef = doc(db, COLLECTIONS.REGISTRATIONS, `${studentUid}_${eventId}`);
  const existing = await getDoc(regRef);
  if (existing.exists()) throw new Error('Already registered for this event.');

  const batch = writeBatch(db);
  batch.set(regRef, { studentUid, eventId, registeredAt: serverTimestamp() });
  batch.update(doc(db, COLLECTIONS.EVENTS, eventId), {
    registrationCount: increment(1),
  });
  await batch.commit();
}

export async function cancelRegistration(studentUid, eventId) {
  const regRef = doc(db, COLLECTIONS.REGISTRATIONS, `${studentUid}_${eventId}`);
  const batch = writeBatch(db);
  batch.delete(regRef);
  batch.update(doc(db, COLLECTIONS.EVENTS, eventId), {
    registrationCount: increment(-1),
  });
  await batch.commit();
}

export async function isRegistered(studentUid, eventId) {
  const snap = await getDoc(doc(db, COLLECTIONS.REGISTRATIONS, `${studentUid}_${eventId}`));
  return snap.exists();
}

export function listenStudentRegistrations(studentUid, callback) {
  const q = query(
    collection(db, COLLECTIONS.REGISTRATIONS),
    where('studentUid', '==', studentUid),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ─── Event Registrations (for organizer view) ─────────────────────────────────

export function listenEventRegistrations(eventId, callback) {
  const q = query(
    collection(db, COLLECTIONS.REGISTRATIONS),
    where('eventId', '==', eventId),
  );
  return onSnapshot(q, async (snap) => {
    const regs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Fetch student names
    const enriched = await Promise.all(
      regs.map(async (reg) => {
        const userSnap = await getDoc(doc(db, 'users', reg.studentUid));
        const userData = userSnap.exists() ? userSnap.data() : {};
        return {
          ...reg,
          studentName: userData.displayName ?? 'Unknown',
          studentEmail: userData.email ?? '',
          department: userData.department ?? '',
          matricNumber: userData.matricNumber ?? '',
        };
      }),
    );
    callback(enriched);
  });
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function submitFeedback(studentUid, eventId, rating, comment) {
  await addDoc(collection(db, COLLECTIONS.FEEDBACK), {
    studentUid,
    eventId,
    rating,
    comment,
    submittedAt: serverTimestamp(),
  });
}

export function listenEventFeedback(eventId, callback) {
  const q = query(
    collection(db, COLLECTIONS.FEEDBACK),
    where('eventId', '==', eventId),
  );
  return onSnapshot(q, async (snap) => {
    const feedbacks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const enriched = await Promise.all(
      feedbacks.map(async (fb) => {
        const userSnap = await getDoc(doc(db, 'users', fb.studentUid));
        const name = userSnap.exists() ? userSnap.data().displayName : 'Anonymous';
        return { ...fb, studentName: name };
      }),
    );
    callback(enriched.sort((a, b) => (b.submittedAt?.seconds ?? 0) - (a.submittedAt?.seconds ?? 0)));
  });
}

