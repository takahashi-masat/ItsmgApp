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
  where,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

// タスクコンテキストの作成
const TasksContext = createContext();

// タスクコンテキストを使用するためのカスタムフック
export const useTasks = () => {
  return useContext(TasksContext);
};

// タスクプロバイダーコンポーネント
export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, isAdmin } = useAuth();

  // タスクを取得する
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setUserTasks([]);
      setLoading(false);
      return;
    }

    let unsubscribeTasksListener = null;
    let unsubscribeUserTasksListener = null;

    const fetchTasks = async () => {
      try {
        // 全タスクを取得
        const q = query(
          collection(db, "tasks"), 
          orderBy("dueDate", "asc")
        );
        
        unsubscribeTasksListener = onSnapshot(q, (querySnapshot) => {
          const taskList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            dueDate: doc.data().dueDate?.toDate() || new Date()
          }));
          
          setTasks(taskList);
          setLoading(false);
        });
        
        // ユーザー固有のタスク状態を取得
        const userTasksQuery = query(
          collection(db, "userTasks"),
          where("userId", "==", currentUser.uid)
        );
        
        unsubscribeUserTasksListener = onSnapshot(userTasksQuery, (querySnapshot) => {
          const userTaskList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setUserTasks(userTaskList);
        });
        
      } catch (error) {
        console.error("タスクの取得中にエラーが発生しました:", error);
        setError("タスクの取得に失敗しました。");
        setLoading(false);
      }
    };
    
    fetchTasks();
    
    return () => {
      if (unsubscribeTasksListener) unsubscribeTasksListener();
      if (unsubscribeUserTasksListener) unsubscribeUserTasksListener();
    };
  }, [currentUser]);

  // 新しいタスクを追加する（管理者のみ）
  const addTask = async (title, dueDate) => {
    if (!currentUser) {
      throw new Error('タスクを追加するにはログインしてください');
    }
    
    if (!isAdmin) {
      throw new Error('タスクを追加する権限がありません');
    }
    
    if (!title.trim()) {
      throw new Error('タスク名を入力してください');
    }
    
    if (!dueDate) {
      throw new Error('期限を設定してください');
    }
    
    try {
      await addDoc(collection(db, "tasks"), {
        title: title,
        dueDate: dueDate,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid
      });
      
      return true;
    } catch (error) {
      console.error("タスクの追加中にエラーが発生しました:", error);
      throw new Error('タスクの追加に失敗しました。もう一度お試しください。');
    }
  };

  // タスクを削除する（管理者のみ）
  const deleteTask = async (taskId) => {
    if (!currentUser) {
      throw new Error('タスクを削除するにはログインしてください');
    }
    
    if (!isAdmin) {
      throw new Error('タスクを削除する権限がありません');
    }
    
    try {
      // タスクを削除
      await deleteDoc(doc(db, "tasks", taskId));
      
      // 関連するユーザータスク状態も削除
      const userTasksQuery = query(
        collection(db, "userTasks"),
        where("taskId", "==", taskId)
      );
      
      const userTasksSnapshot = await getDocs(userTasksQuery);
      const deletePromises = userTasksSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      return true;
    } catch (error) {
      console.error("タスクの削除中にエラーが発生しました:", error);
      throw new Error('タスクの削除に失敗しました。もう一度お試しください。');
    }
  };

  // タスクの完了状態を切り替える
  const toggleTaskCompletion = async (taskId, completed) => {
    if (!currentUser) {
      throw new Error('タスクを更新するにはログインしてください');
    }
    
    try {
      // ユーザー固有のタスク状態のドキュメントID
      const userTaskId = `${currentUser.uid}_${taskId}`;
      const userTaskRef = doc(db, "userTasks", userTaskId);
      
      // ドキュメントが存在するか確認
      const userTaskDoc = await getDoc(userTaskRef);
      
      if (userTaskDoc.exists()) {
        // 既存のドキュメントを更新
        await updateDoc(userTaskRef, {
          completed: completed
        });
      } else {
        // 新しいドキュメントを作成
        await setDoc(userTaskRef, {
          userId: currentUser.uid,
          taskId: taskId,
          completed: completed,
          updatedAt: serverTimestamp()
        });
      }
      
      return true;
    } catch (error) {
      console.error("タスク状態の更新中にエラーが発生しました:", error);
      throw new Error('タスク状態の更新に失敗しました。もう一度お試しください。');
    }
  };

  // タスクの完了状態を取得
  const isTaskCompleted = (taskId) => {
    const userTask = userTasks.find(ut => ut.taskId === taskId);
    return userTask ? userTask.completed : false;
  };

  // 期限までの日数を計算
  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    // 時間部分をリセットして日付のみで比較
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // 期限表示のフォーマット
  const formatDueDate = (dueDate) => {
    const days = getDaysUntilDue(dueDate);
    
    if (days < 0) {
      return `${Math.abs(days)}日経過`;
    } else if (days === 0) {
      return '今日まで';
    } else {
      return `あと${days}日`;
    }
  };

  // コンテキストの値
  const value = {
    tasks,
    loading,
    error,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    isTaskCompleted,
    formatDueDate,
    getDaysUntilDue
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

export default TasksContext; 