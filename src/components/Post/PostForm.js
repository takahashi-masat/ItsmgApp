import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../contexts/PostsContext';
import '../../styles/post.css';

const PostForm = () => {
  const [content, setContent] = useState('');
  const { currentUser } = useAuth();
  const { addPost } = usePosts();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('投稿するにはログインしてください');
      return;
    }
    
    if (content.trim() === '') {
      alert('投稿内容を入力してください');
      return;
    }
    
    try {
      const success = await addPost(content);
      if (success) {
        setContent('');
      }
    } catch (error) {
      console.error("投稿の追加中にエラーが発生しました:", error);
      alert('投稿に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <section className="post-form-container">
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="いまどうしてる？"
            className="post-form-content"
            rows="3"
            required
          ></textarea>
        </div>
        
        <div className="post-form-actions">
          <button type="submit" className="tweet-button">ツイート</button>
        </div>
      </form>
    </section>
  );
};

export default PostForm; 