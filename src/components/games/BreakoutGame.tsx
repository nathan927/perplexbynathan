import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Play, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface BreakoutGameProps {
  onBack: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  destroyed: boolean;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 8;
const BALL_SIZE = 8;
const BRICK_WIDTH = 45;
const BRICK_HEIGHT = 15;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;

export const BreakoutGame: React.FC<BreakoutGameProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('breakout-best-score');
    return saved ? parseInt(saved) : 0;
  });

  const [paddle, setPaddle] = useState({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 });
  const [ball, setBall] = useState<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: 1.2,
    dy: -1.2
  });
  const [bricks, setBricks] = useState<Brick[]>(() => initializeBricks());

  // 初始化砖块
  function initializeBricks(): Brick[] {
    const bricks: Brick[] = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * (BRICK_WIDTH + 5) + 10,
          y: row * (BRICK_HEIGHT + 5) + 30,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: colors[row],
          destroyed: false
        });
      }
    }
    
    return bricks;
  }

  // 检测碰撞
  const checkCollision = useCallback((ball: Ball, rect: { x: number; y: number; width: number; height: number }) => {
    return ball.x < rect.x + rect.width &&
           ball.x + BALL_SIZE > rect.x &&
           ball.y < rect.y + rect.height &&
           ball.y + BALL_SIZE > rect.y;
  }, []);

  // 游戏循环
  const gameLoop = useCallback(() => {
    if (!isPlaying || gameOver || won) return;

    setBall(currentBall => {
      let newBall = { ...currentBall };
      
      // 移动球
      newBall.x += newBall.dx;
      newBall.y += newBall.dy;
      
      // 壁面反弹
      if (newBall.x <= 0 || newBall.x >= CANVAS_WIDTH - BALL_SIZE) {
        newBall.dx = -newBall.dx;
      }
      if (newBall.y <= 0) {
        newBall.dy = -newBall.dy;
      }
      
      // 底部边界（失球）
      if (newBall.y >= CANVAS_HEIGHT - BALL_SIZE) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
            setIsPlaying(false);
          } else {
            // 重置球位置
            newBall = {
              x: CANVAS_WIDTH / 2,
              y: CANVAS_HEIGHT / 2,
              dx: 1.2 * (Math.random() > 0.5 ? 1 : -1),
              dy: -1.2
            };
          }
          return newLives;
        });
      }
      
      // 球拍碰撞
      if (checkCollision(newBall, { 
        x: paddle.x, 
        y: paddle.y, 
        width: PADDLE_WIDTH, 
        height: PADDLE_HEIGHT 
      })) {
        newBall.dy = -Math.abs(newBall.dy);
        // 根据球拍位置调整反弹角度
        const paddleCenter = paddle.x + PADDLE_WIDTH / 2;
        const ballCenter = newBall.x + BALL_SIZE / 2;
        const diff = ballCenter - paddleCenter;
        newBall.dx = diff * 0.1;
      }
      
      return newBall;
    });

    // 检查砖块碰撞
    setBricks(currentBricks => {
      const newBricks = [...currentBricks];
      let ballModified = false;
      
      for (let brick of newBricks) {
        if (!brick.destroyed && checkCollision(ball, brick)) {
          brick.destroyed = true;
          setBall(currentBall => ({ 
            ...currentBall, 
            dy: -currentBall.dy 
          }));
          setScore(prev => {
            const newScore = prev + 10;
            if (newScore > bestScore) {
              setBestScore(newScore);
              localStorage.setItem('breakout-best-score', newScore.toString());
            }
            return newScore;
          });
          ballModified = true;
          break;
        }
      }
      
      // 检查是否获胜
      const remainingBricks = newBricks.filter(brick => !brick.destroyed);
      if (remainingBricks.length === 0) {
        setWon(true);
        setIsPlaying(false);
      }
      
      return newBricks;
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, gameOver, won, ball, paddle, checkCollision, bestScore]);

  // 开始游戏循环
  useEffect(() => {
    if (isPlaying && !gameOver && !won) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, gameOver, won, gameLoop]);

  // 绘制游戏
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清空画布
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制砖块
    bricks.forEach(brick => {
      if (!brick.destroyed) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });
    
    // 绘制球拍
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // 绘制球
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE/2, ball.y + BALL_SIZE/2, BALL_SIZE/2, 0, Math.PI * 2);
    ctx.fill();
  }, [ball, paddle, bricks]);

  // 鼠标控制球拍
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const newPaddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2));
    
    setPaddle(prev => ({ ...prev, x: newPaddleX }));
  };

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setPaddle(prev => ({ 
            ...prev, 
            x: Math.max(0, prev.x - 10) 
          }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPaddle(prev => ({ 
            ...prev, 
            x: Math.min(CANVAS_WIDTH - PADDLE_WIDTH, prev.x + 10) 
          }));
          break;
        case ' ':
          e.preventDefault();
          if (!gameOver && !won) {
            setIsPlaying(prev => !prev);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, won]);

  // 重新开始游戏
  const restartGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setWon(false);
    setScore(0);
    setLives(3);
    setPaddle({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 });
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: 1.2,
      dy: -1.2
    });
    setBricks(initializeBricks());
  };

  // 切换暂停/播放
  const togglePause = () => {
    if (!gameOver && !won) {
      setIsPlaying(prev => !prev);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-2 md:p-0">
      {/* 头部 */}
      <div className="flex items-center justify-between w-full">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:inline">返回</span>
          <span className="md:hidden">Back</span>
        </Button>
        <h2 className="text-lg md:text-xl font-bold">打砖块</h2>
        <Button variant="ghost" onClick={restartGame} className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
          <RotateCcw className="w-4 h-4" />
          <span className="hidden md:inline">重新开始</span>
          <span className="md:hidden">Restart</span>
        </Button>
      </div>

      {/* 分数和生命 */}
      <div className="flex gap-2 md:gap-4 items-center flex-wrap justify-center">
        <div className="bg-slate-100 rounded-lg p-2 md:p-3 text-center">
          <div className="text-xs md:text-sm text-slate-600">分数</div>
          <div className="text-lg md:text-xl font-bold">{score}</div>
        </div>
        <div className="bg-slate-100 rounded-lg p-2 md:p-3 text-center">
          <div className="text-xs md:text-sm text-slate-600">最佳</div>
          <div className="text-lg md:text-xl font-bold">{bestScore}</div>
        </div>
        <div className="bg-slate-100 rounded-lg p-2 md:p-3 text-center">
          <div className="text-xs md:text-sm text-slate-600">生命</div>
          <div className="text-lg md:text-xl font-bold">{'❤️'.repeat(lives)}</div>
        </div>
        <Button
          onClick={togglePause}
          variant={isPlaying ? "default" : "outline"}
          className="flex items-center gap-2"
          disabled={gameOver || won}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? '暂停' : '开始'}
        </Button>
      </div>

      {/* 游戏状态 */}
      {(gameOver || won) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-slate-200 rounded-xl p-4 text-center shadow-lg"
        >
          <h3 className="text-lg font-bold mb-2">
            {won ? '🎉 恭喜通关！' : '💥 游戏结束'}
          </h3>
          <p className="text-slate-600 mb-2">最终分数: {score}</p>
          <Button onClick={restartGame} className="mt-2">
            再来一局
          </Button>
        </motion.div>
      )}

      {/* 游戏画布 */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-slate-300 rounded-lg cursor-none max-w-full h-auto"
          onMouseMove={handleMouseMove}
          style={{ imageRendering: 'pixelated' }}
        />
        
        {!isPlaying && !gameOver && !won && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <div className="text-white text-center">
              <p className="mb-2">点击开始按钮或按空格键开始游戏</p>
              <p className="text-sm">移动鼠标或使用方向键控制球拍</p>
            </div>
          </div>
        )}
      </div>

      {/* 操作说明 */}
      <div className="text-center text-xs text-slate-600 space-y-1">
        <p>移动鼠标或使用左右方向键控制球拍</p>
        <p>消除所有砖块即可获胜</p>
        <p>按空格键暂停/继续游戏</p>
      </div>
    </div>
  );
};
