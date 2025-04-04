import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PostForm from '../Post/PostForm';
import PostList from '../Post/PostList';
import TaskList from '../Task/TaskList';

const Home = () => {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();

  return (
    <div className="home">
      <div className="page-header">
        <h2 className="page-title">最新の投稿</h2>
        <div className="nav-buttons">
          <Link to="/last-week" className="nav-button">
            先週の投稿を見る
          </Link>
          <Link to="/mario" className="nav-button">
            マリオゲームで遊ぶ
          </Link>
        </div>
      </div>
      
      {/* モバイル用タスクリスト（ヘッダーとコンテンツの間に表示） */}
      <div className="mobile-task-list">
        <TaskList />
      </div>
      
      <PostForm />
      <PostList />
    </div>
  );
};

export default Home; 