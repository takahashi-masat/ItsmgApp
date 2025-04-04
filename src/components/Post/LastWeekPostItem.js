import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../contexts/PostsContext';
import '../../styles/post.css';

const LastWeekPostItem = ({ post }) => {
  const [showReplies, setShowReplies] = useState(false);
  const { currentUser } = useAuth();
  const { timeAgo } = usePosts();

  // Firestoreから直接アバターカラーを取得するか、ローカルストレージから取得
  const getAvatarColor = (userId, defaultColor = '#1da1f2') => {
    // 投稿にavatarColorが含まれている場合はそれを使用
    if (post.avatarColor) {
      return post.avatarColor;
    }
    
    // ローカルストレージから取得
    const storedColor = localStorage.getItem(`avatarColor_${userId}`);
    return storedColor || defaultColor;
  };

  // アバター画像を取得
  const getAvatarImage = (userId) => {
    // 投稿にavatarImageが含まれている場合はそれを使用
    if (post.avatarImage) {
      return post.avatarImage;
    }
    
    // ローカルストレージから取得
    return localStorage.getItem(`avatarImage_${userId}`);
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar" style={{ backgroundColor: getAvatarColor(post.userId) }}>
          {getAvatarImage(post.userId) ? (
            <img 
              src={getAvatarImage(post.userId)} 
              alt="ユーザーアイコン" 
              className="avatar-image" 
            />
          ) : (
            post.username.charAt(0).toUpperCase()
          )}
        </div>
        
        <div className="post-user-info">
          <span className="post-username">@{post.username}</span>
          <span className="post-time">{timeAgo(post.createdAt)}</span>
        </div>
      </div>
      
      <div className="post-content">
        <p className="post-text">{post.content}</p>
        
        <div className="post-actions">
          <button 
            className="action-button reply-button disabled"
            disabled
          >
            <i className="icon-reply"></i>
            <span>{post.replies.length > 0 ? post.replies.length : ''}</span>
          </button>
          
          <button 
            className="action-button like-button disabled"
            disabled
          >
            <i className="icon-heart"></i>
            <span>{post.likes > 0 ? post.likes : ''}</span>
          </button>
        </div>
        
        {post.replies.length > 0 && (
          <button 
            className="show-replies-button"
            onClick={toggleReplies}
          >
            {showReplies ? '返信を隠す' : `${post.replies.length}件の返信を表示`}
          </button>
        )}
        
        {showReplies && post.replies.length > 0 && (
          <div className="replies-container">
            {post.replies.map(reply => {
              const replyAvatarImage = reply.avatarImage || localStorage.getItem(`avatarImage_${reply.userId}`);
              
              return (
                <div key={reply.id} className="reply-card">
                  <div className="reply-header">
                    <div className="post-avatar reply-avatar" style={{ backgroundColor: reply.avatarColor || getAvatarColor(reply.userId) }}>
                      {replyAvatarImage ? (
                        <img 
                          src={replyAvatarImage} 
                          alt="ユーザーアイコン" 
                          className="avatar-image" 
                        />
                      ) : (
                        reply.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    
                    <div className="post-user-info">
                      <span className="post-username">@{reply.username}</span>
                      <span className="post-time">{timeAgo(reply.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="reply-content">
                    <p className="post-text">{reply.content}</p>
                    
                    <div className="post-actions">
                      <button 
                        className="action-button like-button disabled"
                        disabled
                      >
                        <i className="icon-heart"></i>
                        <span>{reply.likes > 0 ? reply.likes : ''}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LastWeekPostItem; 