import React from 'react';
import { usePosts } from '../../contexts/PostsContext';
import LastWeekPostItem from './LastWeekPostItem';
import Loading from '../UI/Loading';
import '../../styles/post.css';

const LastWeekPostList = () => {
  const { posts, loading, error } = usePosts();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="post-list-error">
        <p className="error-message">エラーが発生しました: {error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="post-list-empty">
        <p>先週の投稿はありません。</p>
      </div>
    );
  }

  return (
    <section className="post-list">
      <div className="posts-list">
        {posts.map(post => (
          <LastWeekPostItem key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default LastWeekPostList; 