import React, { useState } from 'react';
import { useTasks } from '../../contexts/TasksContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/task.css';

const TaskList = () => {
  const { tasks, loading, error, toggleTaskCompletion, isTaskCompleted, formatDueDate, deleteTask } = useTasks();
  const { isAdmin } = useAuth();
  const [showCompleted, setShowCompleted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  if (loading) {
    return <div className="task-list-loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="task-list-error">{error}</div>;
  }

  // 完了/未完了でタスクをフィルタリング
  const filteredTasks = showCompleted 
    ? tasks 
    : tasks.filter(task => !isTaskCompleted(task.id));

  // タスクの完了状態を切り替える
  const handleToggleCompletion = async (taskId) => {
    try {
      const currentStatus = isTaskCompleted(taskId);
      await toggleTaskCompletion(taskId, !currentStatus);
    } catch (error) {
      console.error('タスク状態の更新に失敗しました:', error);
    }
  };

  // タスクを削除する（管理者のみ）
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setConfirmDelete(null);
    } catch (error) {
      console.error('タスクの削除に失敗しました:', error);
    }
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h3>タスク一覧</h3>
        <div className="task-filter">
          <label>
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={() => setShowCompleted(!showCompleted)}
            />
            完了済みを表示
          </label>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="no-tasks">
          {showCompleted 
            ? 'タスクがありません' 
            : '未完了のタスクはありません'}
        </div>
      ) : (
        <ul className="task-list">
          {filteredTasks.map(task => (
            <li key={task.id} className={`task-item ${isTaskCompleted(task.id) ? 'completed' : ''}`}>
              <div className="task-checkbox">
                <input
                  type="checkbox"
                  checked={isTaskCompleted(task.id)}
                  onChange={() => handleToggleCompletion(task.id)}
                  id={`task-${task.id}`}
                />
                <label htmlFor={`task-${task.id}`}></label>
              </div>
              
              <div className="task-content">
                <div className="task-title">{task.title}</div>
                <div className={`task-due-date ${getDueDateClass(task.dueDate)}`}>
                  {formatDueDate(task.dueDate)}
                </div>
              </div>
              
              {isAdmin && (
                <div className="task-actions">
                  {confirmDelete === task.id ? (
                    <div className="task-confirm-delete">
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="task-confirm-yes"
                      >
                        削除
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(null)}
                        className="task-confirm-no"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDelete(task.id)}
                      className="task-delete-button"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// 期限に応じたクラス名を返す
const getDueDateClass = (dueDate) => {
  const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  if (days < 0) {
    return 'overdue';
  } else if (days === 0) {
    return 'due-today';
  } else if (days <= 3) {
    return 'due-soon';
  } else {
    return '';
  }
};

export default TaskList; 