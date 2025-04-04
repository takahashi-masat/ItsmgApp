import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TaskList from '../Task/TaskList';
import '../../styles/task.css';

const TaskPage = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="task-page-container">
      <div className="page-header">
        <h2 className="page-title">タスク一覧</h2>
        <Link to="/" className="nav-button">
          ホームに戻る
        </Link>
      </div>
      
      <div className="task-page-content">
        {isAdmin && (
          <div className="task-admin-message">
            <p>タスクの追加・管理は管理者画面から行えます。</p>
            <Link to="/admin" className="nav-button">
              管理者画面へ
            </Link>
          </div>
        )}
        <TaskList />
      </div>
    </div>
  );
};

export default TaskPage; 