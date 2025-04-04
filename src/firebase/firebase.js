import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebaseの設定情報 - 実際のプロジェクトの情報に置き換えてください
const firebaseConfig = {
  apiKey: "AIzaSyAEPsSWLPAhaIXWvk_1L_sboOwfvO3tV18",
  authDomain: "itsmgitsmg-takahashi.firebaseapp.com",
  projectId: "itsmgitsmg-takahashi",
  storageBucket: "itsmgitsmg-takahashi.firebasestorage.app",
  messagingSenderId: "40477784033",
  appId: "1:40477784033:web:be3adf6420a26887a044a0"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default app; 