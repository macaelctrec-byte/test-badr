// ===============================================================
// إعداد وتهيئة فايربيس (Firebase Initialization & Exports)
// ===============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    signOut,
    setPersistence,
    browserSessionPersistence 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs,
    onSnapshot, 
    query,
    where,
    Timestamp,
    deleteDoc, 
    doc,        
    updateDoc,
    setDoc,
    getDoc,
    increment,
    orderBy,
    limit,
    enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBfslkMwWAmFXLPJ_aJZgSA7-59AhoOdUY",
    authDomain: "macaelctrec-f7795.firebaseapp.com",
    projectId: "macaelctrec-f7795",
    storageBucket: "macaelctrec-f7795.firebasestorage.app",
    messagingSenderId: "915102271751",
    appId: "1:915102271751:web:38cf552556f3cc5be15da2",
    measurementId: "G-231CS0RBZD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// البريد الإلكتروني للمسؤول الوحيد
export const ADMIN_EMAIL = "macaelctrec@gmail.com";

// ضبط الجلسة لتستمر عبر التبويبات النشطة
setPersistence(auth, browserSessionPersistence).catch(() => {});

// تفعيل التخزين المؤقت المحلي (IndexedDB Offline Persistence) لتحميل البيانات فوراً
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Firestore offline persistence: multiple tabs open.');
    } else if (err.code === 'unimplemented') {
        console.warn('Firestore offline persistence is not supported in this browser.');
    }
});

export {
    app,
    auth,
    db,
    provider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    query,
    where,
    Timestamp,
    deleteDoc,
    doc,
    updateDoc,
    setDoc,
    getDoc,
    increment,
    orderBy,
    limit
};
