import React from 'react';
import { usePosts } from '../../contexts/PostsContext';
import PostItem from './PostItem';
import Loading from '../UI/Loading';
import '../../styles/post.css';

const PostList = () => {
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
        <p>投稿がありません。最初の投稿をしてみましょう！</p>
      </div>
    );
  }

  return (
    <section className="post-list">
      <div className="posts-list">
        {posts.map(post => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default PostList; 