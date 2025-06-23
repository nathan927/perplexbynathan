import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Play, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface SnakeGameProps {
  onBack: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 5, y: 5 };
const INITIAL_DIRECTION: Direction = 'RIGHT';

export const SnakeGame: React.FC<SnakeGameProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('snake-best-score');
    return saved ? parseInt(saved) : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(200);
  
  const directionRef = useRef(direction);
  const gameLoopRef = useRef<NodeJS.Timeout>();

  // 生成随机食物位置
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // 检查碰撞
  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    // 撞墙
    if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
      return true;
    }
    
    // 撞自己
    return body.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  // 移动蛇
  const moveSnake = useCallback(() => {
    setSnake(currentSnake => {
      const head = { ...currentSnake[0] };
      
      switch (directionRef.current) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }
      
      const newSnake = [head, ...currentSnake];
      
      // 检查碰撞
      if (checkCollision(head, currentSnake)) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }
      
      return newSnake;
    });
  }, [checkCollision]);

  // 检查食物碰撞和处理游戏状态
  useEffect(() => {
    if (snake.length === 0) return;
    
    const head = snake[0];
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
      // 增加分数
      setScore(prevScore => {
        const newScore = prevScore + 10;
        
        // 更新最高分
        setBestScore(prevBest => {
          if (newScore > prevBest) {
            localStorage.setItem('snake-best-score', newScore.toString());
            return newScore;
          }
          return prevBest;
        });
        
        // 增加速度
        if (newScore % 50 === 0) {
          setSpeed(prevSpeed => prevSpeed > 100 ? prevSpeed - 10 : prevSpeed);
        }
        
        return newScore;
      });
      
      // 生成新食物
      setFood(generateFood(snake));
    } else {
      // 正常移动，移除尾部
      setSnake(prevSnake => prevSnake.slice(0, -1));
    }
  }, [snake, food, generateFood]);

  // 游戏循环
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setTimeout(moveSnake, speed);
    }
    
    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, moveSnake, speed]);

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      let newDirection: Direction | null = null;
      
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') newDirection = 'UP';
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') newDirection = 'DOWN';
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') newDirection = 'LEFT';
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') newDirection = 'RIGHT';
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
      }
      
      if (newDirection) {
        e.preventDefault();
        setDirection(newDirection);
        directionRef.current = newDirection;
        
        // 如果游戏还没开始，自动开始
        if (!isPlaying) {
          setIsPlaying(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, isPlaying]);

  // 重新开始游戏
  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setGameOver(false);
    setScore(0);
    setIsPlaying(false);
    setSpeed(200);
  };

  // 切换暂停/播放
  const togglePause = () => {
    if (!gameOver) {
      setIsPlaying(prev => !prev);
    }
  };

  // 方向按钮点击
  const handleDirectionClick = (newDirection: Direction) => {
    if (gameOver) return;
    
    // 检查不能反向移动
    if (
      (directionRef.current === 'UP' && newDirection === 'DOWN') ||
      (directionRef.current === 'DOWN' && newDirection === 'UP') ||
      (directionRef.current === 'LEFT' && newDirection === 'RIGHT') ||
      (directionRef.current === 'RIGHT' && newDirection === 'LEFT')
    ) {
      return;
    }
    
    setDirection(newDirection);
    directionRef.current = newDirection;
    
    if (!isPlaying) {
      setIsPlaying(true);
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
        <h2 className="text-lg md:text-xl font-bold">贪吃蛇</h2>
        <Button variant="ghost" onClick={restartGame} className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
          <RotateCcw className="w-4 h-4" />
          <span className="hidden md:inline">重新开始</span>
          <span className="md:hidden">Restart</span>
        </Button>
      </div>

      {/* 分数和控制 */}
      <div className="flex gap-2 md:gap-4 items-center">
        <div className="bg-slate-100 rounded-lg p-2 md:p-3 text-center">
          <div className="text-xs md:text-sm text-slate-600">分数</div>
          <div className="text-lg md:text-xl font-bold">{score}</div>
        </div>
        <div className="bg-slate-100 rounded-lg p-2 md:p-3 text-center">
          <div className="text-xs md:text-sm text-slate-600">最佳</div>
          <div className="text-lg md:text-xl font-bold">{bestScore}</div>
        </div>
        <Button
          onClick={togglePause}
          variant={isPlaying ? "default" : "outline"}
          className="flex items-center gap-2"
          disabled={gameOver}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? '暂停' : '开始'}
        </Button>
      </div>

      {/* 游戏状态 */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-slate-200 rounded-xl p-4 text-center shadow-lg"
        >
          <h3 className="text-lg font-bold mb-2">🐍 游戏结束</h3>
          <p className="text-slate-600 mb-2">最终分数: {score}</p>
          <Button onClick={restartGame} className="mt-2">
            再来一局
          </Button>
        </motion.div>
      )}

      {/* 游戏板 */}
      <div className="relative">
        <div 
          className="bg-slate-800 rounded-xl border-4 border-slate-700 grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            width: '400px',
            height: '400px'
          }}
        >
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
            const x = index % BOARD_SIZE;
            const y = Math.floor(index / BOARD_SIZE);
            
            const isSnakeHead = snake.length > 0 && snake[0].x === x && snake[0].y === y;
            const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
            const isFood = food.x === x && food.y === y;
            
            return (
              <div
                key={index}
                className={`
                  border border-slate-700/30
                  ${isSnakeHead ? 'bg-green-400 rounded-sm' : ''}
                  ${isSnakeBody ? 'bg-green-600 rounded-sm' : ''}
                  ${isFood ? 'bg-red-500 rounded-full' : ''}
                `}
              >
                {isFood && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-full h-full bg-red-500 rounded-full"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 方向控制按钮 */}
      <div className="grid grid-cols-3 gap-2 w-32 md:w-32">
        <div></div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDirectionClick('UP')}
          disabled={gameOver}
          className="aspect-square h-10 w-10 md:h-8 md:w-8 text-lg md:text-base"
        >
          ↑
        </Button>
        <div></div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDirectionClick('LEFT')}
          disabled={gameOver}
          className="aspect-square h-10 w-10 md:h-8 md:w-8 text-lg md:text-base"
        >
          ←
        </Button>
        <div></div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDirectionClick('RIGHT')}
          disabled={gameOver}
          className="aspect-square h-10 w-10 md:h-8 md:w-8 text-lg md:text-base"
        >
          →
        </Button>
        
        <div></div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDirectionClick('DOWN')}
          disabled={gameOver}
          className="aspect-square h-10 w-10 md:h-8 md:w-8 text-lg md:text-base"
        >
          ↓
        </Button>
        <div></div>
      </div>

      {/* 操作说明 */}
      <div className="text-center text-xs text-slate-600 space-y-1">
        <p>使用方向键或按钮控制蛇的方向</p>
        <p>吃红色食物得分，避免撞墙和撞自己</p>
        <p>按空格键暂停/继续</p>
      </div>
    </div>
  );
};
