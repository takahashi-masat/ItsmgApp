import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/mario.css';

const MarioGame = () => {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const keysRef = useRef({
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
  });

  // モバイルデバイスの検出
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // ゲームの初期化と実行
  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // キャンバスのサイズ設定
    canvas.width = 800;
    canvas.height = 400;
    
    // ゲーム内のオブジェクト
    const mario = {
      x: 50,
      y: 300,
      width: 30,
      height: 40,
      speed: 5,
      jumpForce: 12,
      velocityY: 0,
      isJumping: false,
      direction: 'right',
      frame: 0,
      frameCount: 0,
    };
    
    const blocks = [
      { x: 0, y: 340, width: 800, height: 60 }, // 地面
      { x: 200, y: 260, width: 50, height: 30 }, // ブロック1
      { x: 300, y: 260, width: 50, height: 30 }, // ブロック2
      { x: 400, y: 200, width: 50, height: 30 }, // ブロック3
      { x: 500, y: 260, width: 50, height: 30 }, // ブロック4
      { x: 600, y: 260, width: 50, height: 30 }, // ブロック5
    ];
    
    const coins = [
      { x: 220, y: 220, width: 20, height: 20, collected: false },
      { x: 320, y: 220, width: 20, height: 20, collected: false },
      { x: 420, y: 160, width: 20, height: 20, collected: false },
      { x: 520, y: 220, width: 20, height: 20, collected: false },
      { x: 620, y: 220, width: 20, height: 20, collected: false },
    ];
    
    const enemies = [
      { x: 300, y: 300, width: 30, height: 30, speed: 2, direction: -1 },
      { x: 500, y: 300, width: 30, height: 30, speed: 2, direction: -1 },
    ];
    
    // キー入力の状態
    const keys = keysRef.current;
    
    // キー入力のイベントリスナー
    const handleKeyDown = (e) => {
      if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        // ブラウザのデフォルト動作を防止
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e) => {
      if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        // ブラウザのデフォルト動作を防止
        e.preventDefault();
      }
    };
    
    // ゲームがアクティブな間はページスクロールを無効化
    const preventScroll = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    
    // イベントリスナーの登録
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', preventScroll);
    
    // ゲームループ
    const gameLoop = () => {
      // 画面クリア
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 背景描画
      ctx.fillStyle = '#6B8CFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // マリオの移動
      if (keys.ArrowLeft) {
        mario.x -= mario.speed;
        mario.direction = 'left';
        mario.frameCount++;
      }
      if (keys.ArrowRight) {
        mario.x += mario.speed;
        mario.direction = 'right';
        mario.frameCount++;
      }
      if (keys.ArrowUp && !mario.isJumping) {
        mario.velocityY = -mario.jumpForce;
        mario.isJumping = true;
      }
      
      // アニメーションフレーム更新
      if (mario.frameCount > 5) {
        mario.frame = (mario.frame + 1) % 3;
        mario.frameCount = 0;
      }
      
      // 重力の適用
      mario.velocityY += 0.5;
      mario.y += mario.velocityY;
      
      // 画面端の制限
      if (mario.x < 0) mario.x = 0;
      if (mario.x > canvas.width - mario.width) mario.x = canvas.width - mario.width;
      
      // ブロックとの衝突判定
      mario.isJumping = true;
      for (const block of blocks) {
        if (
          mario.x < block.x + block.width &&
          mario.x + mario.width > block.x &&
          mario.y < block.y + block.height &&
          mario.y + mario.height > block.y
        ) {
          // 上からの衝突
          if (mario.velocityY > 0 && mario.y + mario.height - mario.velocityY <= block.y) {
            mario.y = block.y - mario.height;
            mario.velocityY = 0;
            mario.isJumping = false;
          }
          // 下からの衝突
          else if (mario.velocityY < 0 && mario.y - mario.velocityY >= block.y + block.height) {
            mario.y = block.y + block.height;
            mario.velocityY = 0;
          }
          // 左からの衝突
          else if (mario.x + mario.width - mario.speed <= block.x) {
            mario.x = block.x - mario.width;
          }
          // 右からの衝突
          else if (mario.x + mario.speed >= block.x + block.width) {
            mario.x = block.x + block.width;
          }
        }
      }
      
      // コインの収集
      for (const coin of coins) {
        if (!coin.collected &&
          mario.x < coin.x + coin.width &&
          mario.x + mario.width > coin.x &&
          mario.y < coin.y + coin.height &&
          mario.y + mario.height > coin.y
        ) {
          coin.collected = true;
          setScore(prevScore => prevScore + 100);
        }
      }
      
      // 敵の移動と衝突判定
      for (const enemy of enemies) {
        enemy.x += enemy.speed * enemy.direction;
        
        // 敵の方向転換
        for (const block of blocks) {
          if (
            enemy.x <= 0 ||
            enemy.x + enemy.width >= canvas.width ||
            (enemy.x < block.x + block.width &&
            enemy.x + enemy.width > block.x &&
            enemy.y + enemy.height === block.y &&
            (enemy.x + enemy.width === block.x || enemy.x === block.x + block.width))
          ) {
            enemy.direction *= -1;
            break;
          }
        }
        
        // マリオとの衝突
        if (
          mario.x < enemy.x + enemy.width &&
          mario.x + mario.width > enemy.x &&
          mario.y < enemy.y + enemy.height &&
          mario.y + mario.height > enemy.y
        ) {
          // 上からの踏みつけ
          if (mario.velocityY > 0 && mario.y + mario.height - mario.velocityY <= enemy.y) {
            enemy.y = 1000; // 画面外に移動
            mario.velocityY = -8; // 跳ね返り
            setScore(prevScore => prevScore + 200);
          } else {
            // ダメージ
            setLives(prevLives => {
              if (prevLives <= 1) {
                setGameOver(true);
                return 0;
              }
              // マリオを初期位置に戻す
              mario.x = 50;
              mario.y = 300;
              mario.velocityY = 0;
              return prevLives - 1;
            });
          }
        }
      }
      
      // ブロックの描画
      ctx.fillStyle = '#8B4513';
      for (const block of blocks) {
        if (block.y === 340) {
          // 地面
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(block.x, block.y, block.width, block.height);
          
          // 地面の上の草
          ctx.fillStyle = '#00AA00';
          ctx.fillRect(block.x, block.y, block.width, 10);
        } else {
          // 通常ブロック
          ctx.fillStyle = '#D2691E';
          ctx.fillRect(block.x, block.y, block.width, block.height);
          
          // ブロックの模様
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(block.x + 5, block.y + 5, block.width - 10, block.height - 10);
        }
      }
      
      // コインの描画
      ctx.fillStyle = '#FFD700';
      for (const coin of coins) {
        if (!coin.collected) {
          ctx.beginPath();
          ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // 敵の描画
      ctx.fillStyle = '#8B0000';
      for (const enemy of enemies) {
        if (enemy.y < 500) { // 画面内にいる敵のみ描画
          ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
          
          // 目
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(enemy.x + (enemy.direction > 0 ? 5 : 20), enemy.y + 5, 5, 5);
          ctx.fillStyle = '#8B0000';
        }
      }
      
      // マリオの描画
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(mario.x, mario.y, mario.width, mario.height * 0.6);
      
      // マリオの顔
      ctx.fillStyle = '#FFA07A';
      ctx.fillRect(mario.x + (mario.direction === 'right' ? 5 : 0), mario.y - 10, mario.width - 5, 10);
      
      // マリオの帽子
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(mario.x + (mario.direction === 'right' ? 0 : -5), mario.y - 15, mario.width + 5, 5);
      
      // マリオの目
      ctx.fillStyle = '#000000';
      ctx.fillRect(mario.x + (mario.direction === 'right' ? 20 : 5), mario.y - 8, 3, 3);
      
      // マリオの服
      ctx.fillStyle = '#0000FF';
      ctx.fillRect(mario.x, mario.y + mario.height * 0.6, mario.width, mario.height * 0.4);
      
      // スコアとライフの表示
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Arial';
      ctx.fillText(`スコア: ${score}`, 20, 30);
      ctx.fillText(`ライフ: ${lives}`, 20, 60);
      
      // ゲームオーバー判定
      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '20px Arial';
        ctx.fillText('リトライするにはページを再読み込みしてください', canvas.width / 2, canvas.height / 2 + 40);
        
        return; // ゲームループを停止
      }
      
      // 次のフレームを要求
      requestAnimationFrame(gameLoop);
    };
    
    // ゲームスタート
    gameLoop();
    
    // クリーンアップ
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', preventScroll);
    };
  }, [gameStarted, gameOver]);

  // ゲームコンテナにフォーカスを当てる関数
  const focusGame = () => {
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
  };

  // モバイル用コントロールのハンドラー
  const handleMobileControl = (key, isPressed) => {
    keysRef.current[key] = isPressed;
  };

  return (
    <div className="container mario-container">
      <div className="page-header">
        <h2 className="page-title">スーパーマリオ ミニゲーム</h2>
        <Link to="/" className="nav-button">
          掲示板に戻る
        </Link>
      </div>
      
      <div className="page-description">
        <p>矢印キーで操作: ← → で移動、↑ でジャンプ。コインを集めて敵を踏みつけよう！</p>
        {isMobile && gameStarted && <p>モバイルの場合は画面下部のボタンで操作できます。</p>}
      </div>
      
      {!gameStarted ? (
        <div className="mario-start-screen">
          <h2>スーパーマリオ ミニゲーム</h2>
          <p>矢印キーで操作します</p>
          <div className="keyboard-controls">
            <span className="key">←</span>
            <span className="key">→</span>
            <span className="key">↑</span>
          </div>
          <p>移動とジャンプでコインを集めよう！</p>
          <button 
            className="mario-start-button" 
            onClick={() => {
              setGameStarted(true);
              // ゲーム開始時にフォーカスを当てる
              setTimeout(focusGame, 100);
            }}
          >
            ゲームスタート
          </button>
        </div>
      ) : (
        <>
          <div className="mario-game-container" onClick={focusGame}>
            <canvas 
              ref={canvasRef} 
              className="mario-canvas" 
              tabIndex="0" 
            />
          </div>
          
          {isMobile && (
            <div className="mobile-controls">
              <div 
                className="control-button"
                onTouchStart={() => handleMobileControl('ArrowLeft', true)}
                onTouchEnd={() => handleMobileControl('ArrowLeft', false)}
                onMouseDown={() => handleMobileControl('ArrowLeft', true)}
                onMouseUp={() => handleMobileControl('ArrowLeft', false)}
                onMouseLeave={() => handleMobileControl('ArrowLeft', false)}
              >
                ←
              </div>
              <div 
                className="control-button"
                onTouchStart={() => handleMobileControl('ArrowUp', true)}
                onTouchEnd={() => handleMobileControl('ArrowUp', false)}
                onMouseDown={() => handleMobileControl('ArrowUp', true)}
                onMouseUp={() => handleMobileControl('ArrowUp', false)}
                onMouseLeave={() => handleMobileControl('ArrowUp', false)}
              >
                ↑
              </div>
              <div 
                className="control-button"
                onTouchStart={() => handleMobileControl('ArrowRight', true)}
                onTouchEnd={() => handleMobileControl('ArrowRight', false)}
                onMouseDown={() => handleMobileControl('ArrowRight', true)}
                onMouseUp={() => handleMobileControl('ArrowRight', false)}
                onMouseLeave={() => handleMobileControl('ArrowRight', false)}
              >
                →
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MarioGame; 