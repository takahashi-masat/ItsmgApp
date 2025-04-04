import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  collection,
  getDocs,
  writeBatch,
  where,
  addDoc,
  deleteDoc,
  orderBy
} from "firebase/firestore";
import { auth, db } from '../firebase';

// 認証コンテキストの作成
const AuthContext = createContext();

// 認証コンテキストを使用するためのカスタムフック
export const useAuth = () => {
  return useContext(AuthContext);
};

// 管理者のメールアドレス
const ADMIN_EMAILS = ['takahashi.masato@persol.co.jp', 'shunpei.mine@persol.co.jp', 'masat.takahashi@persol.co.jp'];

// 固定の管理者メールアドレス（編集不可）
const FIXED_ADMIN_EMAIL = 'masat.takahashi@persol.co.jp';

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [avatarColor, setAvatarColor] = useState('#1da1f2');
  const [avatarImage, setAvatarImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // ユーザープロフィールをFirestoreに保存
  const saveUserProfile = async (uid, profileData) => {
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error("プロフィール保存エラー:", error);
      throw error;
    }
  };

  // ユーザープロフィールをFirestoreから取得
  const fetchUserProfile = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsername(userData.username || '');
        setAvatarColor(userData.avatarColor || '#1da1f2');
        setAvatarImage(userData.avatarImage || '');
        return userData;
      } else {
        // ユーザードキュメントが存在しない場合はローカルストレージから移行
        const storedUsername = localStorage.getItem(`username_${uid}`);
        const storedColor = localStorage.getItem(`avatarColor_${uid}`);
        const storedImage = localStorage.getItem(`avatarImage_${uid}`);
        
        if (storedUsername) {
          setUsername(storedUsername);
          
          // Firestoreに保存
          await saveUserProfile(uid, {
            username: storedUsername,
            avatarColor: storedColor || '#1da1f2',
            avatarImage: storedImage || '',
            createdAt: serverTimestamp()
          });
          
          // 移行後はローカルストレージから削除（オプション）
          // localStorage.removeItem(`username_${uid}`);
          // localStorage.removeItem(`avatarColor_${uid}`);
          // localStorage.removeItem(`avatarImage_${uid}`);
          
          return {
            username: storedUsername,
            avatarColor: storedColor || '#1da1f2',
            avatarImage: storedImage || ''
          };
        }
        
        return null;
      }
    } catch (error) {
      console.error("プロフィール取得エラー:", error);
      throw error;
    }
  };

  // メールアドレスが登録可能かチェック
  const isEmailAllowed = async (email) => {
    try {
      // 管理者は常に登録可能
      if (ADMIN_EMAILS.includes(email)) {
        return true;
      }
      
      // allowedEmailsコレクションをチェック
      const q = query(
        collection(db, "allowedEmails"),
        where("email", "==", email)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("メールアドレスチェックエラー:", error);
      return false;
    }
  };

  // ユーザー登録関数
  const register = async (email, password, displayName) => {
    try {
      setError('');
      
      // メールアドレスが登録可能かチェック
      const allowed = await isEmailAllowed(email);
      if (!allowed) {
        setError('使用不可能なメールアドレスです。');
        throw new Error('使用不可能なメールアドレスです。');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Firestoreにユーザープロフィールを保存
      await saveUserProfile(userCredential.user.uid, {
        username: displayName,
        email: email,
        avatarColor: '#1da1f2',
        avatarImage: '',
        createdAt: serverTimestamp()
      });
      
      // ローカルステートを更新
      setUsername(displayName);
      setAvatarColor('#1da1f2');
      setAvatarImage('');
      
      return userCredential.user;
    } catch (error) {
      console.error("登録エラー:", error);
      // カスタムエラーメッセージがすでに設定されている場合は、デフォルトのエラーハンドリングをスキップ
      if (error.message === '使用不可能なメールアドレスです。') {
        throw error;
      }
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('このメールアドレスは既に使用されています');
          break;
        case 'auth/invalid-email':
          setError('無効なメールアドレスです');
          break;
        case 'auth/weak-password':
          setError('パスワードは6文字以上にしてください');
          break;
        default:
          setError('アカウント作成に失敗しました');
      }
      throw error;
    }
  };

  // ログイン関数
  const login = async (email, password) => {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 管理者かどうかをチェック
      setIsAdmin(ADMIN_EMAILS.includes(email));
      
      return userCredential.user;
    } catch (error) {
      console.error("ログインエラー:", error);
      switch (error.code) {
        case 'auth/invalid-email':
          setError('無効なメールアドレスです');
          break;
        case 'auth/user-disabled':
          setError('このアカウントは無効化されています');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('メールアドレスまたはパスワードが間違っています');
          break;
        default:
          setError('ログインに失敗しました');
      }
      throw error;
    }
  };

  // ログアウト関数
  const logout = async () => {
    try {
      setError('');
      await signOut(auth);
      setIsAdmin(false);
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
      setError('ログアウトに失敗しました');
      throw error;
    }
  };

  // ユーザー名更新関数
  const updateUsername = async (newUsername) => {
    if (!currentUser) {
      throw new Error('ユーザー名を更新するにはログインしてください');
    }
    
    if (!newUsername.trim()) {
      throw new Error('ユーザー名を入力してください');
    }
    
    try {
      // Firestoreのユーザープロフィールを更新
      await saveUserProfile(currentUser.uid, {
        username: newUsername
      });
      
      // 過去の投稿のユーザー名を一括更新
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", currentUser.uid)
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const batch = writeBatch(db);
      
      querySnapshot.forEach((postDoc) => {
        batch.update(postDoc.ref, { username: newUsername });
      });
      
      // バッチ処理を実行
      await batch.commit();
      
      // ローカルステートを更新
      setUsername(newUsername);
      return true;
    } catch (error) {
      console.error('ユーザー名の更新に失敗しました:', error);
      throw error;
    }
  };

  // アバターカラー更新関数
  const updateAvatarColor = async (newColor) => {
    if (!currentUser) {
      throw new Error('アバターカラーを更新するにはログインしてください');
    }
    
    try {
      // Firestoreのユーザープロフィールを更新
      await saveUserProfile(currentUser.uid, {
        avatarColor: newColor
      });
      
      // 過去の投稿のアバターカラーを一括更新
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", currentUser.uid)
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const batch = writeBatch(db);
      
      querySnapshot.forEach((postDoc) => {
        batch.update(postDoc.ref, { avatarColor: newColor });
      });
      
      // バッチ処理を実行
      await batch.commit();
      
      // ローカルステートを更新
      setAvatarColor(newColor);
      return true;
    } catch (error) {
      console.error('アバターカラーの更新に失敗しました:', error);
      throw error;
    }
  };

  // アバター画像更新関数
  const updateAvatarImage = async (newImage) => {
    if (!currentUser) {
      throw new Error('アバター画像を更新するにはログインしてください');
    }
    
    try {
      // Firestoreのユーザープロフィールを更新
      await saveUserProfile(currentUser.uid, {
        avatarImage: newImage || ''
      });
      
      // 過去の投稿のアバター画像を一括更新
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", currentUser.uid)
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const batch = writeBatch(db);
      
      querySnapshot.forEach((postDoc) => {
        batch.update(postDoc.ref, { avatarImage: newImage || '' });
      });
      
      // バッチ処理を実行
      await batch.commit();
      
      // ローカルステートを更新
      setAvatarImage(newImage || '');
      return true;
    } catch (error) {
      console.error('アバター画像の更新に失敗しました:', error);
      throw error;
    }
  };

  // 登録可能メールアドレスの追加
  const addAllowedEmail = async (email) => {
    if (!currentUser || !isAdmin) {
      throw new Error('権限がありません');
    }
    
    try {
      // 既に登録されているかチェック
      const q = query(
        collection(db, "allowedEmails"),
        where("email", "==", email)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error('このメールアドレスは既に登録されています');
      }
      
      // 新しいメールアドレスを追加
      await addDoc(collection(db, "allowedEmails"), {
        email: email,
        createdAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('メールアドレスの追加に失敗しました:', error);
      throw error;
    }
  };

  // 登録可能メールアドレスの削除
  const removeAllowedEmail = async (docId) => {
    if (!currentUser || !isAdmin) {
      throw new Error('権限がありません');
    }
    
    try {
      await deleteDoc(doc(db, "allowedEmails", docId));
      return true;
    } catch (error) {
      console.error('メールアドレスの削除に失敗しました:', error);
      throw error;
    }
  };

  // 登録可能メールアドレス一覧の取得
  const getAllowedEmails = async () => {
    if (!currentUser || !isAdmin) {
      throw new Error('権限がありません');
    }
    
    try {
      const q = query(
        collection(db, "allowedEmails"),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('メールアドレス一覧の取得に失敗しました:', error);
      throw error;
    }
  };

  // 全ユーザー一覧の取得（管理者用）
  const getAllUsers = async () => {
    if (!currentUser || !isAdmin) {
      throw new Error('権限がありません');
    }
    
    try {
      const q = query(
        collection(db, "users"),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('ユーザー一覧の取得に失敗しました:', error);
      throw error;
    }
  };

  // ユーザーの削除（管理者用）
  const deleteUser = async (userId) => {
    if (!currentUser || !isAdmin) {
      throw new Error('権限がありません');
    }
    
    try {
      // ユーザーの投稿を削除
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const batch = writeBatch(db);
      
      querySnapshot.forEach((postDoc) => {
        batch.delete(postDoc.ref);
      });
      
      await batch.commit();
      
      // ユーザープロフィールを削除
      await deleteDoc(doc(db, "users", userId));
      
      return true;
    } catch (error) {
      console.error('ユーザーの削除に失敗しました:', error);
      throw error;
    }
  };

  // 全投稿の削除（管理者用）
  const deleteAllPosts = async () => {
    if (!currentUser || !isAdmin) {
      throw new Error('権限がありません');
    }
    
    try {
      const q = query(collection(db, "posts"));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.forEach((postDoc) => {
        batch.delete(postDoc.ref);
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('全投稿の削除に失敗しました:', error);
      throw error;
    }
  };

  // 管理者のメールアドレスをFirestoreから取得
  const getAllAdminEmails = async () => {
    if (!currentUser || !isAdmin) {
      throw new Error('権限がありません');
    }
    
    try {
      const q = query(
        collection(db, "adminEmails"),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data().email);
    } catch (error) {
      console.error('管理者メールアドレス一覧の取得に失敗しました:', error);
      throw error;
    }
  };

  // 管理者メールアドレスを追加
  const addAdminEmail = async (email) => {
    if (!currentUser || !isAdmin) {
      throw new Error('権限がありません');
    }
    
    try {
      // 既に登録されているかチェック
      const q = query(
        collection(db, "adminEmails"),
        where("email", "==", email)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error('このメールアドレスは既に管理者として登録されています');
      }
      
      // 新しい管理者メールアドレスを追加
      await addDoc(collection(db, "adminEmails"), {
        email: email,
        createdAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('管理者メールアドレスの追加に失敗しました:', error);
      throw error;
    }
  };

  // 管理者メールアドレスを削除
  const removeAdminEmail = async (email) => {
    if (!currentUser || !isAdmin) {
      throw new Error('権限がありません');
    }
    
    // 固定の管理者メールアドレスは削除不可
    if (email === FIXED_ADMIN_EMAIL) {
      throw new Error('この管理者メールアドレスは削除できません');
    }
    
    try {
      // メールアドレスで検索
      const q = query(
        collection(db, "adminEmails"),
        where("email", "==", email)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error('このメールアドレスは管理者として登録されていません');
      }
      
      // ドキュメントを削除
      await deleteDoc(querySnapshot.docs[0].ref);
      return true;
    } catch (error) {
      console.error('管理者メールアドレスの削除に失敗しました:', error);
      throw error;
    }
  };

  // メールアドレスが管理者かどうかをチェック
  const isAdminEmail = async (email) => {
    try {
      const q = query(
        collection(db, "adminEmails"),
        where("email", "==", email)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('管理者チェックエラー:', error);
      return false;
    }
  };

  // ユーザーがログインしているかどうかを確認
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // 管理者権限の確認
        setIsAdmin(ADMIN_EMAILS.includes(user.email));
        
        // ユーザープロフィールを取得
        await fetchUserProfile(user.uid);
      } else {
        setCurrentUser(null);
        setUsername('');
        setAvatarColor('#1da1f2');
        setAvatarImage('');
        setIsAdmin(false);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  // コンテキストの値
  const value = {
    currentUser,
    username,
    avatarColor,
    avatarImage,
    loading,
    error,
    isAdmin,
    register,
    login,
    logout,
    updateUsername,
    updateAvatarColor,
    updateAvatarImage,
    fetchUserProfile,
    addAllowedEmail,
    removeAllowedEmail,
    getAllowedEmails,
    getAllUsers,
    deleteUser,
    deleteAllPosts,
    getAllAdminEmails,
    addAdminEmail,
    removeAdminEmail,
    isAdminEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 