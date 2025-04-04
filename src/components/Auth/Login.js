import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth.css';

const Login = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('メールアドレスとパスワードを入力してください');
      return;
    }
    
    try {
      setLoading(true);
      await login(email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('ログインエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>ログイン</h2>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="パスワードを入力"
            required
          />
        </div>
        
        {error && <p className="auth-error">{error}</p>}
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      
      <p className="auth-toggle">
        アカウントをお持ちでないですか？{' '}
        <button
          type="button"
          className="toggle-button"
          onClick={onToggleForm}
        >
          アカウント作成
        </button>
      </p>
    </div>
  );
};

export default Login; 