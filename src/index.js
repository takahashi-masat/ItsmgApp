
// Start of Selection
// ファイル名: index.js
// 概要: このファイルはReactアプリケーションのエントリーポイントです。アプリケーションのルートコンポーネントをDOMにレンダリングします。
// 使用技術: React, ReactDOM, Firebase, Web Vitals

import React from 'react'; // Reactライブラリをインポートします。Reactはユーザーインターフェースを構築するためのライブラリです。
import ReactDOM from 'react-dom/client'; // ReactDOMはReactコンポーネントをDOMにレンダリングするためのライブラリです。
import './index.css'; // スタイルシートをインポートします。アプリケーションの見た目を整えるために使用します。
import App from './App'; // アプリケーションのメインコンポーネントであるAppをインポートします。
import reportWebVitals from './reportWebVitals'; // Web Vitalsのレポートを行うためのモジュールをインポートします。
import './firebase'; // Firebaseの設定をインポートします。Firebaseはバックエンドサービスを提供するプラットフォームです。

// Reactアプリケーションのルートを作成し、HTMLのroot要素にアタッチします。
const root = ReactDOM.createRoot(document.getElementById('root'));

// React.StrictModeは開発モードでのエラーチェックを強化するためのラッパーです。
root.render(
  <React.StrictMode>
    <App /> {/* Appコンポーネントをレンダリングします。 */}
  </React.StrictMode>
);

// 用語集
// - React: ユーザーインターフェースを構築するためのJavaScriptライブラリ。
// - ReactDOM: ReactコンポーネントをDOMにレンダリングするためのライブラリ。
// - DOM: Document Object Modelの略で、HTMLやXML文書をプログラムで操作するためのAPI。
// - Firebase: Googleが提供するクラウドベースのバックエンドサービス。
// - Web Vitals: ウェブページのパフォーマンスを測定するための指標。
// - コンポーネント: 再利用可能なUIの部品。
// - レンダリング: コンポーネントを画面に表示すること。

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
