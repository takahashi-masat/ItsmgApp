// ファイル名: Register.js
// 概要: このファイルは、ユーザーが新規アカウントを作成するためのフォームを提供します。
//       プロジェクト全体の中で、ユーザー登録のインターフェースを提供する役割を持ちます。
// 使用技術: React, CSS
// 実行タイミング: ユーザーが新規登録ページを開いている間常に起動

import React, { useState } from 'react'; // ReactライブラリとuseStateフックをインポートします。useStateは状態管理に使用します。
import { useAuth } from '../../contexts/AuthContext'; // 認証コンテキストを使用するためのフックをインポートします。
import '../../styles/auth.css'; // 認証関連のスタイルシートをインポートします。

// Registerコンポーネントを定義します。onToggleFormはフォームを切り替えるための関数です。
const Register = ({ onToggleForm }) => {
  // 各種状態を定義します。useStateを使用して初期値を設定します。
  const [email, setEmail] = useState(''); // メールアドレスの状態を管理します。
  const [password, setPassword] = useState(''); // パスワードの状態を管理します。
  const [username, setUsername] = useState(''); // ユーザー名の状態を管理します。
  const [loading, setLoading] = useState(false); // ローディング状態を管理します。
  const [validationError, setValidationError] = useState(''); // バリデーションエラーのメッセージを管理します。
  const { register, error } = useAuth(); // 認証コンテキストからregister関数とエラーメッセージを取得します。

  // フォーム送信時の処理を定義します。
  const handleSubmit = async (e) => {
    e.preventDefault(); // フォームのデフォルトの送信動作を防ぎます。
    
    // 入力が全て揃っているか確認します。
    if (!email || !password || !username) {
      alert('すべての項目を入力してください'); // 入力が不足している場合はアラートを表示します。
      return;
    }
    
    try {
      setLoading(true); // ローディング状態をtrueに設定します。
      setValidationError(''); // バリデーションエラーをクリアします。
      await register(email, password, username); // register関数を呼び出してユーザーを登録します。
      setEmail(''); // メールアドレスの入力をクリアします。
      setPassword(''); // パスワードの入力をクリアします。
      setUsername(''); // ユーザー名の入力をクリアします。
    } catch (error) {
      console.error('登録エラー:', error); // エラーが発生した場合はコンソールにエラーメッセージを表示します。
    } finally {
      setLoading(false); // 処理が完了したらローディング状態をfalseに設定します。
    }
  };

  // コンポーネントのレンダリング部分です。
  return (
    <div className="auth-form-container"> {/* 認証フォーム全体を囲むコンテナです。 */}
      <h2>アカウント作成</h2> {/* フォームのタイトルを表示します。 */}
      
      <form onSubmit={handleSubmit} className="auth-form"> {/* フォームの送信時にhandleSubmitを呼び出します。 */}
        <div className="form-group"> {/* ユーザー名の入力フィールドを囲むグループです。 */}
          <label htmlFor="username">ユーザー名</label> {/* ユーザー名のラベルを表示します。 */}
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // ユーザー名の入力が変更されたときに状態を更新します。
            placeholder="ユーザー名を入力"
            required
          />
        </div>
        
        <div className="form-group"> {/* メールアドレスの入力フィールドを囲むグループです。 */}
          <label htmlFor="email">メールアドレス</label> {/* メールアドレスのラベルを表示します。 */}
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value); // メールアドレスの入力が変更されたときに状態を更新します。
              setValidationError(''); // バリデーションエラーをクリアします。
            }}
            placeholder="メールアドレスを入力"
            required
          />
        </div>
        
        <div className="form-group"> {/* パスワードの入力フィールドを囲むグループです。 */}
          <label htmlFor="password">パスワード</label> {/* パスワードのラベルを表示します。 */}
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // パスワードの入力が変更されたときに状態を更新します。
            placeholder="パスワードを入力（6文字以上）"
            required
            minLength="6"
          />
        </div>
        
        {validationError && <p className="auth-error">{validationError}</p>} {/* バリデーションエラーがある場合に表示します。 */}
        {error && <p className="auth-error">{error}</p>} {/* 認証エラーがある場合に表示します。 */}
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading} // ローディング中はボタンを無効にします。
        >
          {loading ? '作成中...' : 'アカウント作成'} {/* ローディング中かどうかでボタンのテキストを切り替えます。 */}
        </button>
      </form>
      
      <p className="auth-toggle"> {/* フォームを切り替えるためのテキストを表示します。 */}
        既にアカウントをお持ちですか？{' '}
        <button
          type="button"
          className="toggle-button"
          onClick={onToggleForm} // ボタンがクリックされたときにフォームを切り替えます。
        >
          ログイン
        </button>
      </p>
    </div>
  );
};

export default Register; // Registerコンポーネントをエクスポートします。

// 用語集:
// - React: JavaScriptライブラリの一つで、ユーザーインターフェースを構築するために使用されます。
// - useState: Reactのフックの一つで、関数コンポーネント内で状態を管理するために使用されます。
// - フック: Reactの機能で、関数コンポーネントで状態やライフサイクルを扱うために使用されます。
// - コンポーネント: ReactにおけるUIの構成要素で、再利用可能な部品として機能します。
// - CSS: カスケーディングスタイルシートの略で、HTML要素の見た目を装飾するために使用されます。
// - コンテキスト: Reactでグローバルな状態を管理するための仕組み。
// - エクスポート: 他のファイルで使用できるようにするための操作。
// - バリデーション: 入力データが正しいかどうかを確認するプロセス。
// - ローディング: データの読み込み中に表示するインジケーター。
// - アラート: ユーザーにメッセージを表示するためのポップアップウィンドウ。
// - エラー: プログラムの実行中に発生する問題。