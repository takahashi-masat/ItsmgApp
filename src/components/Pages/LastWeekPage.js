import React from 'react';
import { Link } from 'react-router-dom';
import LastWeekPostList from '../Post/LastWeekPostList';
import '../../styles/app.css';

const LastWeekPage = () => {
  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">先週の投稿</h2>
        <Link to="/" className="nav-button">
          現在の投稿に戻る
        </Link>
      </div>
      <div className="page-description">
        <p>これは先週の投稿のアーカイブです。閲覧のみ可能で、編集はできません。</p>
      </div>
      <LastWeekPostList />
    </div>
  );
};

export default LastWeekPage; 