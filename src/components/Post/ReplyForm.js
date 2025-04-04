import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../contexts/PostsContext';
import '../../styles/post.css';

const ReplyForm = ({ postId, onCancel, onSuccess }) => {
  const [content, setContent] = useState('');
  const { currentUser } = useAuth();
  const { addReply } = usePosts();
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    if (!currentUser) {
      alert('返信するにはログインしてください');
      return;
    }
    
    if (content.trim() === '') {
      alert('返信内容を入力してください');
      return;
    }
    
    try {
      const success = await addReply(postId, content);
      if (success) {
        setContent('');
        if (onSuccess) {
          onSuccess();
        }
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } catch (error) {
      console.error("返信の追加中にエラーが発生しました:", error);
      alert('返信に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="reply-form">
      <div className="form-group">
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="返信を入力..."
          className="reply-form-content"
          rows="2"
        ></textarea>
      </div>
      
      <div className="reply-form-buttons">
        <button 
          className="reply-cancel-button"
          onClick={onCancel}
        >
          キャンセル
        </button>
        
        <button 
          className="reply-submit-button"
          onClick={handleSubmit}
          disabled={!content.trim()}
        >
          返信
        </button>
      </div>
    </div>
  );
};

export default ReplyForm; 