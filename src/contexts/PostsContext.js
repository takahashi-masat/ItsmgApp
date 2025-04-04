import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  where,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

// 投稿コンテキストの作成
const PostsContext = createContext();

// 投稿コンテキストを使用するためのカスタムフック
export const usePosts = () => {
  return useContext(PostsContext);
};

// 投稿プロバイダーコンポーネント
export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, username, isAdmin } = useAuth();

  // 投稿を取得する
  useEffect(() => {
    if (!currentUser) {
      setPosts([]);
      setLoading(false);
      return;
    }

    let unsubscribeListener = null;

    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, "posts"), 
          where("isReply", "==", false),
          orderBy("createdAt", "desc")
        );
        
        unsubscribeListener = onSnapshot(q, async (querySnapshot) => {
          const postList = [];
          
          for (const docSnapshot of querySnapshot.docs) {
            const postData = {
              id: docSnapshot.id,
              ...docSnapshot.data(),
              createdAt: docSnapshot.data().createdAt?.toDate() || new Date(),
              replies: []
            };
            
            const repliesQuery = query(
              collection(db, "posts"),
              where("replyToId", "==", docSnapshot.id),
              orderBy("createdAt", "asc")
            );
            
            const repliesSnapshot = await getDocs(repliesQuery);
            postData.replies = repliesSnapshot.docs.map(replyDoc => ({
              id: replyDoc.id,
              ...replyDoc.data(),
              createdAt: replyDoc.data().createdAt?.toDate() || new Date()
            }));
            
            postList.push(postData);
          }
          
          setPosts(postList);
          setLoading(false);
        });
        
      } catch (error) {
        console.error("投稿の取得中にエラーが発生しました:", error);
        setError("投稿の取得に失敗しました。");
        setLoading(false);
      }
    };
    
    fetchPosts();
    
    return () => {
      if (unsubscribeListener) unsubscribeListener();
    };
  }, [currentUser]);

  // 新しい投稿を追加する
  const addPost = async (content) => {
    if (!currentUser) {
      throw new Error('投稿するにはログインしてください');
    }
    
    if (!content.trim()) {
      throw new Error('投稿内容を入力してください');
    }
    
    try {
      // Firestoreからユーザープロフィール情報を取得
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      let avatarColor = '#1da1f2';
      let avatarImage = '';
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        avatarColor = userData.avatarColor || '#1da1f2';
        avatarImage = userData.avatarImage || '';
      }
      
      await addDoc(collection(db, "posts"), {
        userId: currentUser.uid,
        username: username,
        content: content,
        createdAt: serverTimestamp(),
        likes: 0,
        isReply: false,
        replyToId: null,
        avatarColor: avatarColor,
        avatarImage: avatarImage
      });
      
      return true;
    } catch (error) {
      console.error("投稿の追加中にエラーが発生しました:", error);
      throw new Error('投稿に失敗しました。もう一度お試しください。');
    }
  };

  // 返信を追加する
  const addReply = async (postId, content) => {
    if (!currentUser) {
      throw new Error('返信するにはログインしてください');
    }
    
    if (!content.trim()) {
      throw new Error('返信内容を入力してください');
    }
    
    try {
      // Firestoreからユーザープロフィール情報を取得
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      let avatarColor = '#1da1f2';
      let avatarImage = '';
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        avatarColor = userData.avatarColor || '#1da1f2';
        avatarImage = userData.avatarImage || '';
      }
      
      // 返信を追加
      const replyDocRef = await addDoc(collection(db, "posts"), {
        userId: currentUser.uid,
        username: username,
        content: content,
        createdAt: serverTimestamp(),
        likes: 0,
        isReply: true,
        replyToId: postId,
        avatarColor: avatarColor,
        avatarImage: avatarImage
      });
      
      // 即座に表示するために、postsステートを更新
      const newReply = {
        id: replyDocRef.id,
        userId: currentUser.uid,
        username: username,
        content: content,
        createdAt: new Date(),
        likes: 0,
        isReply: true,
        replyToId: postId,
        avatarColor: avatarColor,
        avatarImage: avatarImage
      };
      
      // 該当する投稿を見つけて返信を追加
      setPosts(prevPosts => {
        return prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              replies: [...post.replies, newReply]
            };
          }
          return post;
        });
      });
      
      return true;
    } catch (error) {
      console.error("返信の追加中にエラーが発生しました:", error);
      throw new Error('返信に失敗しました。もう一度お試しください。');
    }
  };

  // いいねを追加する
  const likePost = async (postId) => {
    if (!currentUser) {
      throw new Error('いいねするにはログインしてください');
    }
    
    try {
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('投稿が見つかりません');
      }
      
      // likedByフィールドの取得（未定義の場合は空配列）
      const likedBy = postDoc.data().likedBy || [];
      
      // 既にいいねしている場合は何もしない
      if (likedBy.includes(currentUser.uid)) {
        throw new Error('この投稿には既にいいねしています');
      }
      
      // いいねを追加し、いいねしたユーザーIDを記録
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: [...likedBy, currentUser.uid]
      });
      
      return true;
    } catch (error) {
      console.error("いいねの追加中にエラーが発生しました:", error);
      throw error;
    }
  };

  // 投稿を削除する
  const deletePost = async (postId) => {
    if (!currentUser) {
      throw new Error('権限がありません');
    }
    
    try {
      // 投稿とその返信を削除
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('投稿が見つかりません');
      }
      
      // 自分の投稿か管理者でない場合は削除不可
      if (postDoc.data().userId !== currentUser.uid && !isAdmin) {
        throw new Error('この投稿を削除する権限がありません');
      }
      
      // 返信を削除
      const repliesQuery = query(
        collection(db, "posts"),
        where("replyToId", "==", postId)
      );
      
      const repliesSnapshot = await getDocs(repliesQuery);
      const batch = writeBatch(db);
      
      repliesSnapshot.forEach((replyDoc) => {
        batch.delete(replyDoc.ref);
      });
      
      // 投稿自体を削除
      batch.delete(postRef);
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('投稿の削除に失敗しました:', error);
      throw error;
    }
  };

  // 時間を「〜前」の形式で表示する
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval}年前`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}ヶ月前`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}日前`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}時間前`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}分前`;
    
    return `${Math.floor(seconds)}秒前`;
  };

  // コンテキストの値
  const value = {
    posts,
    loading,
    error,
    addPost,
    deletePost,
    addReply,
    likePost,
    timeAgo
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}; 