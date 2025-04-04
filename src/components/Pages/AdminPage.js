import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TasksContext';
import '../../styles/admin.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const AdminPage = () => {
  const { 
    currentUser, 
    isAdmin, 
    logout,
    getAllowedEmails, 
    addAllowedEmail, 
    removeAllowedEmail,
    getAllUsers,
    deleteUser,
    deleteAllPosts,
    getAllAdminEmails,
    addAdminEmail,
    removeAdminEmail
  } = useAuth();
  const { addTask, tasks, loading: tasksLoading, deleteTask } = useTasks();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('allowed-emails');
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // タスク追加用の状態
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskError, setTaskError] = useState('');
  const [taskSuccess, setTaskSuccess] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  
  // 固定の管理者メールアドレス
  const FIXED_ADMIN_EMAIL = 'masat.takahashi@persol.co.jp';
  
  // 管理者権限チェック
  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/');
    }
  }, [currentUser, isAdmin, navigate]);
  
  // 登録可能メールアドレス一覧を取得
  const fetchAllowedEmails = async () => {
    try {
      setLoading(true);
      setError('');
      const emails = await getAllowedEmails();
      setAllowedEmails(emails);
    } catch (error) {
      console.error('メールアドレス一覧の取得に失敗しました:', error);
      setError('メールアドレス一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // ユーザー一覧を取得
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);
      const usersData = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('ユーザー一覧の取得に失敗しました:', error);
      setError('ユーザー一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // 管理者一覧を取得
  const fetchAdminEmails = async () => {
    try {
      setLoading(true);
      setError('');
      const adminEmailsRef = collection(db, 'adminEmails');
      const adminEmailsSnap = await getDocs(adminEmailsRef);
      const adminEmailsData = adminEmailsSnap.docs.map(doc => doc.data().email);
      setAdminEmails(adminEmailsData);
    } catch (error) {
      console.error('管理者一覧の取得に失敗しました:', error);
      setError('管理者一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // タブ切り替え時にデータを取得
  useEffect(() => {
    if (activeTab === 'allowed-emails') {
      fetchAllowedEmails();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'admins') {
      fetchAdminEmails();
    }
  }, [activeTab]);
  
  // 登録可能メールアドレスを追加
  const handleAddEmail = async (e) => {
    e.preventDefault();
    
    if (!newEmail.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await addAllowedEmail(newEmail);
      setSuccessMessage('会員登録可能メールアドレスを追加しました');
      setNewEmail('');
      fetchAllowedEmails();
    } catch (error) {
      console.error('メールアドレスの追加に失敗しました:', error);
      setError(error.message || 'メールアドレスの追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // 登録可能メールアドレスを削除
  const handleRemoveEmail = async (id) => {
    if (!window.confirm('このメールアドレスを削除してもよろしいですか？')) {
      return;
    }
    try {
      setLoading(true);
      setError('');
      await removeAllowedEmail(id);
      setSuccessMessage('会員登録可能メールアドレスを削除しました');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAllowedEmails();
    } catch (error) {
      console.error('メールアドレスの削除に失敗しました:', error);
      setError('メールアドレスの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // ユーザーを削除
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('このユーザーを削除してもよろしいですか？\n関連する投稿も全て削除されます。')) {
      return;
    }
    try {
      setLoading(true);
      setError('');
      await deleteUser(userId);
      setSuccessMessage('ユーザーを削除しました');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
    } catch (error) {
      console.error('ユーザーの削除に失敗しました:', error);
      setError('ユーザーの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // 全投稿を削除
  const handleDeleteAllPosts = async () => {
    if (!window.confirm('全ての投稿を削除してもよろしいですか？\nこの操作は取り消せません。')) {
      return;
    }
    try {
      setLoading(true);
      setError('');
      await deleteAllPosts();
      setSuccessMessage('全ての投稿を削除しました');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('全投稿の削除に失敗しました:', error);
      setError('全投稿の削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // 管理者メールアドレスを追加
  const handleAddAdminEmail = async (e) => {
    e.preventDefault();
    
    if (!newAdminEmail.trim()) {
      setError('管理者メールアドレスを入力してください');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await addAdminEmail(newAdminEmail);
      setNewAdminEmail('');
      setSuccessMessage('管理者メールアドレスを追加しました');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAdminEmails();
    } catch (error) {
      console.error('管理者メールアドレスの追加に失敗しました:', error);
      setError(error.message || '管理者メールアドレスの追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // 管理者メールアドレスを削除
  const handleRemoveAdminEmail = async (email) => {
    if (!window.confirm('この管理者メールアドレスを削除してもよろしいですか？')) {
      return;
    }
    try {
      setLoading(true);
      setError('');
      await removeAdminEmail(email);
      setSuccessMessage('管理者メールアドレスを削除しました');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAdminEmails();
    } catch (error) {
      console.error('管理者メールアドレスの削除に失敗しました:', error);
      setError('管理者メールアドレスの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // ログアウト処理
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
      setError('ログアウトに失敗しました');
    }
  };
  
  // 成功メッセージをクリア
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // 新しいタスクを追加する
  const handleAddTask = async (e) => {
    e.preventDefault();
    setTaskError('');
    setTaskSuccess('');
    
    if (!taskTitle.trim()) {
      setTaskError('タスク名を入力してください');
      return;
    }
    
    if (!taskDueDate) {
      setTaskError('期限を設定してください');
      return;
    }
    
    setTaskSubmitting(true);
    
    try {
      const dueDate = new Date(taskDueDate);
      await addTask(taskTitle, dueDate);
      
      setTaskSuccess('タスクが正常に追加されました');
      setTaskTitle('');
      setTaskDueDate('');
    } catch (error) {
      setTaskError(error.message);
    } finally {
      setTaskSubmitting(false);
    }
  };
  
  // タスクを削除する
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('このタスクを削除してもよろしいですか？')) {
      try {
        await deleteTask(taskId);
        setTaskSuccess('タスクが正常に削除されました');
      } catch (error) {
        setTaskError(error.message);
      }
    }
  };
  
  // タブの内容を表示する
  const renderContent = () => {
    switch (activeTab) {
      case 'allowed-emails':
        return (
          <div className="admin-content">
            <h2>会員登録可能メールアドレス管理</h2>
            <form onSubmit={handleAddEmail} className="admin-form">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? '追加中...' : '追加'}
              </button>
            </form>
            {loading && <div className="admin-loading"><div className="spinner"></div></div>}
            <div className="admin-list">
              {allowedEmails.length === 0 && !loading ? (
                <div className="admin-empty-state">登録可能なメールアドレスがありません</div>
              ) : (
                allowedEmails.map((email) => (
                  <div key={email.id} className="admin-item">
                    <span>{email.email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email.id)}
                      disabled={loading}
                    >
                      削除
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="admin-content">
            <h2>ユーザー管理</h2>
            {loading && <div className="admin-loading"><div className="spinner"></div></div>}
            <div className="admin-list">
              {users.length === 0 && !loading ? (
                <div className="admin-empty-state">ユーザーが登録されていません</div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="admin-item">
                    <div>
                      <strong>{user.username || '未設定'}</strong>
                      <span>{user.email}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={loading}
                    >
                      削除
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'posts':
        return (
          <div className="admin-content">
            <h2>投稿管理</h2>
            <div className="admin-action-panel">
              <p>全ての投稿を一括で削除することができます。この操作は取り消せませんのでご注意ください。</p>
              <button
                onClick={handleDeleteAllPosts}
                disabled={loading}
              >
                {loading ? '削除中...' : '全ての投稿を削除'}
              </button>
            </div>
          </div>
        );
      case 'admins':
        return (
          <div className="admin-content">
            <h2>管理者メールアドレス管理</h2>
            <form onSubmit={handleAddAdminEmail} className="admin-form">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="管理者メールアドレスを入力"
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? '追加中...' : '追加'}
              </button>
            </form>
            {loading && <div className="admin-loading"><div className="spinner"></div></div>}
            <div className="admin-list">
              {adminEmails.length === 0 && !loading ? (
                <div className="admin-empty-state">管理者メールアドレスが登録されていません</div>
              ) : (
                adminEmails.map((email) => (
                  <div key={email} className="admin-item">
                    <span>{email}</span>
                    {email !== FIXED_ADMIN_EMAIL ? (
                      <button
                        onClick={() => handleRemoveAdminEmail(email)}
                        disabled={loading}
                      >
                        削除
                      </button>
                    ) : (
                      <span className="fixed-admin-badge">固定管理者</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div className="admin-content">
            <h2>タスク管理</h2>
            
            <div className="admin-section">
              <h3>新しいタスクを追加</h3>
              {taskError && <div className="error-message">{taskError}</div>}
              {taskSuccess && <div className="success-message">{taskSuccess}</div>}
              
              <form onSubmit={handleAddTask} className="admin-form">
                <div className="form-group">
                  <label htmlFor="taskTitle">タスク名</label>
                  <input 
                    type="text" 
                    id="taskTitle"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="タスク名を入力"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="taskDueDate">期限</label>
                  <input 
                    type="date" 
                    id="taskDueDate"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={taskSubmitting}
                  className="primary-button"
                >
                  {taskSubmitting ? '追加中...' : 'タスクを追加'}
                </button>
              </form>
            </div>
            
            <div className="admin-section">
              <h3>現在のタスク一覧</h3>
              
              {tasksLoading ? (
                <div className="admin-loading"><div className="spinner"></div></div>
              ) : tasks.length === 0 ? (
                <div className="admin-empty-state">登録されたタスクはありません</div>
              ) : (
                <div className="admin-list">
                  {tasks.map((task) => (
                    <div key={task.id} className="admin-item">
                      <div className="admin-item-info">
                        <strong>{task.title}</strong>
                        <span className="task-due-date">期限: {task.dueDate.toLocaleDateString()}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="delete-button"
                      >
                        <FaTrash /> 削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="admin-page">
      {!isAdmin ? (
        <div className="admin-not-authorized">
          <h1>管理者権限がありません</h1>
          <p>このページにアクセスするには管理者権限が必要です。</p>
          <button onClick={() => navigate('/')}>ホームに戻る</button>
        </div>
      ) : (
        <div className="admin-container">
          <div className="admin-sidebar">
            <h1>管理者ページ</h1>
            <div className="admin-menu">
              <button
                className={activeTab === 'allowed-emails' ? 'active' : ''}
                onClick={() => setActiveTab('allowed-emails')}
              >
                会員登録可能メールアドレス
              </button>
              <button
                className={activeTab === 'users' ? 'active' : ''}
                onClick={() => setActiveTab('users')}
              >
                ユーザー管理
              </button>
              <button
                className={activeTab === 'tasks' ? 'active' : ''}
                onClick={() => setActiveTab('tasks')}
              >
                タスク管理
              </button>
              <button
                className={activeTab === 'posts' ? 'active' : ''}
                onClick={() => setActiveTab('posts')}
              >
                投稿管理
              </button>
              <button
                className={activeTab === 'admins' ? 'active' : ''}
                onClick={() => setActiveTab('admins')}
              >
                管理者一覧
              </button>
              <button
                onClick={() => navigate('/')}
                className="back-button"
              >
                ホームに戻る
              </button>
            </div>
          </div>
          <div className="admin-main-content">
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 