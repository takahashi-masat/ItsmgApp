import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  updateEmail, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from 'firebase/auth';
import { auth } from '../../firebase';
import '../../styles/auth.css';

const ProfileEdit = () => {
  const { 
    currentUser, 
    username, 
    avatarColor: currentAvatarColor, 
    avatarImage: currentAvatarImage, 
    updateUsername, 
    updateAvatarColor, 
    updateAvatarImage 
  } = useAuth();
  const [displayName, setDisplayName] = useState(username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showReauth, setShowReauth] = useState(false);
  const [avatarColor, setAvatarColor] = useState(currentAvatarColor || '#1da1f2');
  const [avatarImage, setAvatarImage] = useState(currentAvatarImage || '');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
    
    // AuthContextから取得したプロフィール情報を設定
    setDisplayName(username || '');
    setAvatarColor(currentAvatarColor || '#1da1f2');
    setAvatarImage(currentAvatarImage || '');
  }, [currentUser, navigate, username, currentAvatarColor, currentAvatarImage]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // ファイルサイズチェック (2MB以下)
    if (file.size > 2 * 1024 * 1024) {
      setError('画像サイズは2MB以下にしてください');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 再認証を行う関数
  const reauthenticate = async () => {
    if (!currentPassword) {
      setError('現在のパスワードを入力してください');
      return false;
    }

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      return true;
    } catch (error) {
      console.error('再認証エラー:', error);
      if (error.code === 'auth/wrong-password') {
        setError('現在のパスワードが間違っています');
      } else {
        setError('再認証に失敗しました: ' + error.message);
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      return setError('パスワードが一致しません');
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      // メールアドレスまたはパスワードを変更する場合は再認証が必要
      const needsReauth = (email !== currentUser.email || password) && !showReauth;
      if (needsReauth) {
        setShowReauth(true);
        setLoading(false);
        return;
      }
      
      // 再認証が必要な場合は実行
      if (showReauth) {
        const reauthed = await reauthenticate();
        if (!reauthed) {
          setLoading(false);
          return;
        }
        // 再認証成功
        setShowReauth(false);
      }
      
      // ユーザー名の更新
      if (displayName !== username) {
        await updateUsername(displayName);
      }
      
      // アバターカラーの更新
      if (avatarColor !== currentAvatarColor) {
        await updateAvatarColor(avatarColor);
      }
      
      // アバター画像の更新
      if (avatarImage !== currentAvatarImage) {
        await updateAvatarImage(avatarImage);
      }
      
      // メールアドレスの更新
      if (email !== currentUser.email) {
        await updateEmail(auth.currentUser, email);
      }
      
      // パスワードの更新
      if (password) {
        await updatePassword(auth.currentUser, password);
      }
      
      setMessage('プロフィールが更新されました');
      setLoading(false);
      setCurrentPassword('');
      
      // 3秒後にホーム画面に遷移
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      setError('プロフィールの更新に失敗しました: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">プロフィール編集</h2>
      
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-success">{message}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        {showReauth ? (
          <div className="reauth-container">
            <p className="reauth-message">セキュリティのため、現在のパスワードを入力してください</p>
            <div className="form-group">
              <label htmlFor="currentPassword">現在のパスワード</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="reauth-buttons">
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowReauth(false);
                  setCurrentPassword('');
                  // パスワード変更をキャンセルした場合は入力をクリア
                  setPassword('');
                  setConfirmPassword('');
                  // メールアドレス変更をキャンセルした場合は元に戻す
                  setEmail(currentUser.email);
                }}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="auth-button"
                disabled={loading || !currentPassword}
              >
                {loading ? '認証中...' : '認証する'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="avatar-preview" style={{ backgroundColor: avatarColor }}>
              {avatarImage ? (
                <img 
                  src={avatarImage} 
                  alt="ユーザーアイコン" 
                  className="avatar-image" 
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="avatarImage">プロフィール画像</label>
              <input
                type="file"
                id="avatarImage"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
                ref={fileInputRef}
              />
              {avatarImage && (
                <button 
                  type="button" 
                  onClick={handleRemoveImage}
                  className="remove-image-button"
                >
                  画像を削除
                </button>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="avatarColor">アイコンカラー（画像がない場合）</label>
              <input
                type="color"
                id="avatarColor"
                value={avatarColor}
                onChange={(e) => setAvatarColor(e.target.value)}
                className="color-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="displayName">ユーザー名</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">新しいパスワード（変更する場合のみ）</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="変更しない場合は空欄"
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">パスワード（確認）</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="変更しない場合は空欄"
              />
            </div>
            
            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? '更新中...' : '更新する'}
            </button>
          </>
        )}
      </form>
      
      {!showReauth && (
        <button
          onClick={() => navigate('/')}
          className="auth-link-button"
        >
          ホームに戻る
        </button>
      )}
    </div>
  );
};

export default ProfileEdit; 