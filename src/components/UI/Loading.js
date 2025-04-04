import React from 'react';
import '../../styles/ui.css';

export default function Loading() {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>読み込み中...</p>
    </div>
  );
} 