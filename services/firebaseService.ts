
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHIRC4BOb1pz9dTP2D09VhdI69SHkhpU4",
  authDomain: "travel-pulse-67bb2.firebaseapp.com",
  projectId: "travel-pulse-67bb2",
  storageBucket: "travel-pulse-67bb2.firebasestorage.app",
  messagingSenderId: "292254850660",
  appId: "1:292254850660:web:fd1c13cb46ce820f0ec971",
  measurementId: "G-GZHPKD5NPE"
};

const TRIP_ID = "travel_pulse_default_trip";

const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  } catch (error) {
    console.warn("Firebase initialization failed, falling back to LocalStorage", error);
  }
}

const sanitizeData = (data: any): any => {
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeData);
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      sanitized[key] = sanitizeData(value);
    }
  }
  return sanitized;
};

export const saveTripData = async (data: any) => {
  if (!db || !isConfigured) {
    localStorage.setItem(TRIP_ID, JSON.stringify(data));
    return;
  }
  try {
    const sanitized = sanitizeData(data);
    const tripRef = doc(db, "trips", TRIP_ID);
    // Remove merge: true to ensure full state replacement
    await setDoc(tripRef, sanitized);
  } catch (error) {
    console.error("Error saving trip data to Firebase:", error);
    localStorage.setItem(TRIP_ID, JSON.stringify(data));
  }
};

export const loadTripData = async () => {
  const localData = localStorage.getItem(TRIP_ID);
  if (!db || !isConfigured) return localData ? JSON.parse(localData) : null;
  try {
    const tripRef = doc(db, "trips", TRIP_ID);
    const docSnap = await getDoc(tripRef);
    if (docSnap.exists()) return docSnap.data();
    return localData ? JSON.parse(localData) : null;
  } catch (error) {
    return localData ? JSON.parse(localData) : null;
  }
};

export const archiveTrip = async (archiveData: any) => {
  const id = `archive_${Date.now()}`;
  if (!db || !isConfigured) {
    const archives = JSON.parse(localStorage.getItem('trip_archives') || '[]');
    archives.push({ ...archiveData, id });
    localStorage.setItem('trip_archives', JSON.stringify(archives));
    return;
  }
  try {
    const sanitized = sanitizeData(archiveData);
    const archiveRef = doc(db, "archives", id);
    await setDoc(archiveRef, { ...sanitized, id });
  } catch (error) {
    console.error("Archive failed:", error);
  }
};

export const getArchives = async () => {
  if (!db || !isConfigured) {
    return JSON.parse(localStorage.getItem('trip_archives') || '[]');
  }
  try {
    const colRef = collection(db, "archives");
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    return [];
  }
};

export const deleteArchive = async (id: string) => {
  if (!db || !isConfigured) {
    const archives = JSON.parse(localStorage.getItem('trip_archives') || '[]');
    const filtered = archives.filter((a: any) => a.id !== id);
    localStorage.setItem('trip_archives', JSON.stringify(filtered));
    return;
  }
  try {
    const archiveRef = doc(db, "archives", id);
    await deleteDoc(archiveRef);
  } catch (error) {
    console.error("Delete failed:", error);
  }
};
