
// Start of Selection
// ファイル名: App.js
// 概要: このファイルはReactアプリケーションのメインコンポーネントを定義し、ルーティングを管理します。
//       認証状態に応じたページの表示制御を行い、ユーザーインターフェースの基本構造を提供します。
// 使用技術: React, React Router, Firebase
// 実行タイミング: webアプリにアクセスしたタイミングで一度だけ起動 (高橋さんの修正ああああ)

import React from 'react'; // Reactライブラリをインポートします。ユーザーインターフェースを構築するために使用します。
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'; // React Routerを使用してルーティングを管理します。
import { AuthProvider, useAuth } from './contexts/AuthContext'; // 認証情報を管理するコンテキストをインポートします。
import { PostsProvider } from './contexts/PostsContext'; // 投稿情報を管理するコンテキストをインポートします。
import { TasksProvider } from './contexts/TasksContext'; // タスク情報を管理するコンテキストをインポートします。
import Header from './components/UI/Header'; // ヘッダーコンポーネントをインポートします。
import AuthForm from './components/Auth/AuthForm'; // 認証フォームコンポーネントをインポートします。
import TaskList from './components/Task/TaskList'; // タスクリストコンポーネントをインポートします。
import TaskPage from './components/Pages/TaskPage'; // タスクページコンポーネントをインポートします。
import Loading from './components/UI/Loading'; // ローディングコンポーネントをインポートします。
import ProfileEdit from './components/Auth/ProfileEdit'; // プロフィール編集コンポーネントをインポートします。
import LastWeekPage from './components/Pages/LastWeekPage'; // 先週のページコンポーネントをインポートします。
import MarioGame from './components/Pages/MarioGame'; // マリオゲームコンポーネントをインポートします。
import AdminPage from './components/Pages/AdminPage'; // 管理者ページコンポーネントをインポートします。
import Home from './components/Pages/Home'; // ホームページコンポーネントをインポートします。
import WeeklyReportProgress from './components/WeeklyReportProgress'; // 週次レポート進捗コンポーネントをインポートします。
import './styles/app.css'; // アプリ全体のスタイルシートをインポートします。
import './styles/admin.css'; // 管理者ページ用のスタイルシートをインポートします。
import './styles/task.css'; // タスクページ用のスタイルシートをインポートします。

// 認証済みユーザー用のルートを定義します。
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth(); // 現在のユーザー情報とローディング状態を取得します。
  
  if (loading) { // ローディング中であればローディングコンポーネントを表示します。
    return <Loading />;
  }
  
  return currentUser ? children : <Navigate to="/login" />; // 認証済みであれば子コンポーネントを表示し、未認証であればログインページにリダイレクトします。
};

// 未認証ユーザー用のルートを定義します。
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth(); // 現在のユーザー情報とローディング状態を取得します。
  
  if (loading) { // ローディング中であればローディングコンポーネントを表示します。
    return <Loading />;
  }
  
  return !currentUser ? children : <Navigate to="/" />; // 未認証であれば子コンポーネントを表示し、認証済みであればホームページにリダイレクトします。
};

// ヘッダーを条件付きで表示するコンポーネントを定義します。
const AppContent = () => {
  const location = useLocation(); // 現在のURLの場所を取得します。
  const { currentUser, isAdmin } = useAuth(); // 現在のユーザー情報と管理者権限を取得します。
  
  // ログイン画面ではヘッダーを表示しない
  // 修正: ログイン画面かつログインしていない場合はヘッダーを非表示
  const showHeader = currentUser !== null; // ユーザーがログインしている場合にヘッダーを表示します。
  
  return (
    <div className="app">
      {showHeader && <Header />} {/* ヘッダーを表示します。 */}
      
      <div className="app-content-wrapper">
        <div className="main-content">
          <Routes> {/* ルートを定義します。 */}
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Home /> {/* ホームページを表示します。 */}
                </PrivateRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <AuthForm /> {/* 認証フォームを表示します。 */}
                </PublicRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute>
                  <AdminPage /> {/* 管理者ページを表示します。 */}
                </PrivateRoute>
              } 
            />
            <Route 
              path="/last-week" 
              element={
                <PrivateRoute>
                  <LastWeekPage /> {/* 先週のページを表示します。 */}
                </PrivateRoute>
              } 
            />
            <Route 
              path="/mario" 
              element={
                <PrivateRoute>
                  <MarioGame /> {/* マリオゲームを表示します。 */}
                </PrivateRoute>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <PrivateRoute>
                  <TaskPage /> {/* タスクページを表示します。 */}
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <div className="container">
                    <ProfileEdit /> {/* プロフィール編集ページを表示します。 */}
                  </div>
                </PrivateRoute>
              } 
            />
            <Route 
              path="*" 
              element={<Navigate to="/" />} // 未定義のルートにアクセスした場合はホームページにリダイレクトします。
            />
          </Routes>
        </div>
        
        {/* PC用サイドバータスクリスト */}
        {currentUser && location.pathname === '/' && ( // ユーザーがログインしていてホームページにいる場合にサイドバーを表示します。
          <div className="sidebar-task-list">
            <div className="task-sidebar-container">
              <TaskList /> {/* タスクリストを表示します。 */}
            </div>
            {isAdmin && ( // 管理者であれば週次レポート進捗を表示します。
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

// アプリケーションのメインコンポーネントを定義します。
function App() {
  return (
    <Router basename="/"> {/* ルーターを設定します。 */}
      <AuthProvider> {/* 認証コンテキストを提供します。 */}
        <PostsProvider> {/* 投稿コンテキストを提供します。 */}
          <TasksProvider> {/* タスクコンテキストを提供します。 */}
            <AppContent /> {/* アプリケーションのコンテンツを表示します。 */}
          </TasksProvider>
        </PostsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; // Appコンポーネントをエクスポートします。

// 用語集
// - React: ユーザーインターフェースを構築するためのJavaScriptライブラリ。
// - Router: URLのルーティングを管理するためのコンポーネント。
// - Route: 特定のURLパスに対して表示するコンポーネントを定義するためのコンポーネント。
// - Navigate: 指定されたパスにリダイレクトするためのコンポーネント。
// - useLocation: 現在のURLの場所を取得するためのフック。
// - AuthProvider: 認証情報を管理するためのコンテキストプロバイダー。
// - useAuth: 認証情報を取得するためのカスタムフック。
// - コンテキスト: Reactでグローバルな状態を管理するための仕組み。
// - コンポーネント: 再利用可能なUIの部品。
// - ローディング: データの読み込み中に表示するインジケーター。
// - リダイレクト: ユーザーを別のページに移動させること。
// - フック: Reactの機能を利用するための関数。
// - スタイルシート: アプリケーションの見た目を整えるためのファイル。
// - エクスポート: 他のファイルで使用できるようにするための操作。