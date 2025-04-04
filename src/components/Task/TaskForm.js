import React, { useState } from 'react';
import { useTasks } from '../../contexts/TasksContext';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../styles/task.css';

const TaskForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { tasks, setTasks } = useTasks();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const newTask = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate ? new Date(dueDate) : null,
        completed: false,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        createdBy: currentUser.displayName || currentUser.email,
      };

      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      const taskWithId = { ...newTask, id: docRef.id };
      
      setTasks([...tasks, taskWithId]);
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (error) {
      console.error('タスクの追加中にエラーが発生しました:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タスクのタイトル"
          required
        />
      </div>
      <div className="form-group">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="タスクの説明（任意）"
        />
      </div>
      <div className="form-group">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '追加中...' : 'タスクを追加'}
      </button>
    </form>
  );
};

export default TaskForm; 