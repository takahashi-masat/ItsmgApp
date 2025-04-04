import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../contexts/PostsContext';
import ReplyForm from './ReplyForm';
import '../../styles/post.css';

const PostItem = ({ post }) => {
  const [replyingTo, setReplyingTo] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const { currentUser, isAdmin } = useAuth();
  const { likePost, deletePost, timeAgo } = usePosts();

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

  const handleLike = async () => {
    if (!currentUser) {
      alert('いいねするにはログインしてください');
      return;
    }
    
    try {
      await likePost(post.id);
    } catch (error) {
      console.error("いいねの追加中にエラーが発生しました:", error);
      // エラーメッセージに応じて表示を変える
      if (error.message === 'この投稿には既にいいねしています') {
        alert('この投稿には既にいいねしています');
      } else {
        alert('いいねに失敗しました。もう一度お試しください。');
      }
    }
  };

  const handleDelete = async () => {
    if (!currentUser) {
      alert('削除するにはログインしてください');
      return;
    }
    
    // 自分の投稿または管理者の場合は削除可能
    if (currentUser.uid !== post.userId && !isAdmin) {
      alert('自分の投稿のみ削除できます');
      return;
    }
    
    if (window.confirm('この投稿を削除してもよろしいですか？')) {
      try {
        await deletePost(post.id);
      } catch (error) {
        console.error("投稿の削除中にエラーが発生しました:", error);
        alert('削除に失敗しました。もう一度お試しください。');
      }
    }
  };

  const showReplyForm = () => {
    if (!currentUser) {
      alert('返信するにはログインしてください');
      return;
    }
    
    setReplyingTo(true);
    // 返信フォームを表示したら自動的に返信も表示する
    if (!showReplies && post.replies.length > 0) {
      setShowReplies(true);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleReplySuccess = () => {
    // 返信が成功したら返信フォームを閉じる
    setReplyingTo(false);
    
    // 返信が成功したら返信を表示する
    if (!showReplies) {
      setShowReplies(true);
    }
  };

  // 返信数が変わったら自動的に返信を表示する
  useEffect(() => {
    if (post.replies && post.replies.length > 0 && replyingTo) {
      setShowReplies(true);
    }
  }, [post.replies, replyingTo]);

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
            className="action-button reply-button"
            onClick={showReplyForm}
          >
            <i className="icon-reply"></i>
            <span>{post.replies.length > 0 ? post.replies.length : ''}</span>
          </button>
          
          <button 
            className="action-button like-button"
            onClick={handleLike}
          >
            <i className="icon-heart"></i>
            <span>{post.likes > 0 ? post.likes : ''}</span>
          </button>
          
          {currentUser && (post.userId === currentUser.uid || isAdmin) && (
            <button 
              className="action-button post-delete-button"
              onClick={handleDelete}
            >
              <i className="icon-delete"></i>
            </button>
          )}
        </div>
        
        {replyingTo && (
          <ReplyForm 
            postId={post.id} 
            onCancel={() => setReplyingTo(false)} 
            onSuccess={handleReplySuccess}
          />
        )}
        
        {post.replies.length > 0 && !showReplies && (
          <button 
            className="show-replies-button"
            onClick={toggleReplies}
          >
            {`${post.replies.length}件の返信を表示`}
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
                        className="action-button like-button"
                        onClick={async () => {
                          try {
                            await likePost(reply.id);
                          } catch (error) {
                            // エラーメッセージに応じて表示を変える
                            if (error.message === 'この投稿には既にいいねしています') {
                              alert('この返信には既にいいねしています');
                            } else {
                              alert('いいねに失敗しました。もう一度お試しください。');
                            }
                          }
                        }}
                      >
                        <i className="icon-heart"></i>
                        <span>{reply.likes > 0 ? reply.likes : ''}</span>
                      </button>
                      
                      {currentUser && (reply.userId === currentUser.uid || isAdmin) && (
                        <button 
                          className="action-button post-delete-button"
                          onClick={() => deletePost(reply.id)}
                        >
                          <i className="icon-delete"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {showReplies && (
              <button 
                className="show-replies-button"
                onClick={toggleReplies}
              >
                返信を隠す
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostItem; 