import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth.css';

const Register = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { register, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      alert('すべての項目を入力してください');
      return;
    }
    
    try {
      setLoading(true);
      setValidationError('');
      await register(email, password, username);
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (error) {
      console.error('登録エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>アカウント作成</h2>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">ユーザー名</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名を入力"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setValidationError('');
            }}
            placeholder="メールアドレスを入力"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力（6文字以上）"
            required
            minLength="6"
          />
        </div>
        
        {validationError && <p className="auth-error">{validationError}</p>}
        {error && <p className="auth-error">{error}</p>}
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? '作成中...' : 'アカウント作成'}
        </button>
      </form>
      
      <p className="auth-toggle">
        既にアカウントをお持ちですか？{' '}
        <button
          type="button"
          className="toggle-button"
          onClick={onToggleForm}
        >
          ログイン
        </button>
      </p>
    </div>
  );
};

export default Register; 