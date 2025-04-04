import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PostsProvider } from './contexts/PostsContext';
import { TasksProvider } from './contexts/TasksContext';
import Header from './components/UI/Header';
import AuthForm from './components/Auth/AuthForm';
import PostList from './components/Post/PostList';
import PostForm from './components/Post/PostForm';
import TaskList from './components/Task/TaskList';
import TaskPage from './components/Pages/TaskPage';
import Loading from './components/UI/Loading';
import ProfileEdit from './components/Auth/ProfileEdit';
import LastWeekPage from './components/Pages/LastWeekPage';
import MarioGame from './components/Pages/MarioGame';
import AdminPage from './components/Pages/AdminPage';
import Home from './components/Pages/Home';
import WeeklyReportProgress from './components/WeeklyReportProgress';
import './styles/app.css';
import './styles/admin.css';
import './styles/task.css';

// 認証済みユーザー用のルート
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

// 未認証ユーザー用のルート
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  return !currentUser ? children : <Navigate to="/" />;
};

// 管理者用のルート
const AdminRoute = ({ children }) => {
  const { currentUser, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  // 管理者でない場合はホームにリダイレクト
  return currentUser && isAdmin ? children : <Navigate to="/" />;
};

// ログインページコンポーネント
const Login = () => {
  return (
    <div className="container">
      <h1 className="app-title">ITSMG週報アプリ</h1>
      <AuthForm />
    </div>
  );
};

// ヘッダーを条件付きで表示するコンポーネント
const AppContent = () => {
  const location = useLocation();
  const { currentUser, isAdmin } = useAuth();
  
  // ログイン画面ではヘッダーを表示しない
  // 修正: ログイン画面かつログインしていない場合はヘッダーを非表示
  const showHeader = currentUser !== null;
  
  return (
    <div className="app">
      {showHeader && <Header />}
      
      <div className="app-content-wrapper">
        <div className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <AuthForm />
                </PublicRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute>
                  <AdminPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/last-week" 
              element={
                <PrivateRoute>
                  <LastWeekPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mario" 
              element={
                <PrivateRoute>
                  <MarioGame />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <PrivateRoute>
                  <TaskPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <div className="container">
                    <ProfileEdit />
                  </div>
                </PrivateRoute>
              } 
            />
            <Route 
              path="*" 
              element={<Navigate to="/" />} 
            />
          </Routes>
        </div>
        
        {/* PC用サイドバータスクリスト */}
        {currentUser && location.pathname === '/' && (
          <div className="sidebar-task-list">
            <div className="task-sidebar-container">
              <TaskList />
            </div>
            {isAdmin && (
              <div className="weekly-sidebar-container">
                <WeeklyReportProgress />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router basename="/">
      <AuthProvider>
        <PostsProvider>
          <TasksProvider>
            <AppContent />
          </TasksProvider>
        </PostsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;