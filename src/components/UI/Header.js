import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/ui.css';

const Header = () => {
  const { currentUser, username, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const goToHome = () => {
    navigate('/');
  };

  const goToAdmin = () => {
    navigate('/admin');
  };

  return (
    <header className="app-header">
      <h1 onClick={goToHome} className="app-title-link">ITSMG週報アプリ</h1>
      {currentUser && (
        <div className="header-user-info">
          <span className="header-username">@{username}</span>
          {isAdmin && (
            <button onClick={goToAdmin} className="admin-nav-button">
              管理者画面
            </button>
          )}
          <button onClick={goToProfile} className="profile-button">
            プロフィール
          </button>
          <button onClick={handleLogout} className="logout-button">
            ログアウト
          </button>
        </div>
      )}
    </header>
  );
};

export default Header; 