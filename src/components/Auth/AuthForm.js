// ファイル名: AuthForm.js
// 概要: このファイルは、ユーザーがログインまたは新規登録を行うためのフォームを切り替えるコンポーネントを提供します。
//       プロジェクト全体の中で、ユーザー認証のインターフェースを提供する役割を持ちます。
// 使用技術: React, CSS
// 実行タイミング: 認証ページを開いている間常に起動

import React, { useState } from 'react'; // ReactライブラリとuseStateフックをインポートします。useStateは状態管理に使用します。
import Login from './Login'; // ログインフォームコンポーネントをインポートします。
import Register from './Register'; // 新規登録フォームコンポーネントをインポートします。
import '../../styles/auth.css'; // 認証関連のスタイルシートをインポートします。

// AuthFormコンポーネントを定義し、エクスポートします。
export default function AuthForm() {
  // isRegisteringという状態を定義し、初期値をfalseに設定します。falseの場合はログインフォームを表示します。
  const [isRegistering, setIsRegistering] = useState(false);

  // フォームを切り替える関数を定義します。現在のisRegisteringの値を反転させます。
  const toggleForm = () => {
    setIsRegistering(!isRegistering);
  };

  // コンポーネントのレンダリング部分です。isRegisteringの値に応じて、ログインフォームまたは新規登録フォームを表示します。
  return (
    <div className="auth-container"> {/* 認証フォーム全体を囲むコンテナです。 */}
      {isRegistering ? (
        <Register onToggleForm={toggleForm} /> // isRegisteringがtrueの場合、新規登録フォームを表示します。
      ) : (
        <Login onToggleForm={toggleForm} /> // isRegisteringがfalseの場合、ログインフォームを表示します。
      )}
    </div>
  );
}

// 用語集:
// - React: JavaScriptライブラリの一つで、ユーザーインターフェースを構築するために使用されます。
// - useState: Reactのフックの一つで、関数コンポーネント内で状態を管理するために使用されます。
// - コンポーネント: ReactにおけるUIの構成要素で、再利用可能な部品として機能します。
// - フック: Reactの機能で、関数コンポーネントで状態やライフサイクルを扱うために使用されます。
// - CSS: カスケーディングスタイルシートの略で、HTML要素の見た目を装飾するために使用されます。