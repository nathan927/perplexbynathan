import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface Game2048Props {
  onBack: () => void;
}

type Board = number[][];
type Direction = 'up' | 'down' | 'left' | 'right';

export const Game2048: React.FC<Game2048Props> = ({ onBack }) => {
  const { t } = useTranslation();
  const [board, setBoard] = useState<Board>(() => initializeBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('2048-best-score');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // 初始化棋盘
  function initializeBoard(): Board {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    return newBoard;
  }

  // 添加随机瓦片
  function addRandomTile(board: Board) {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[randomCell[0]][randomCell[1]] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  // 移动瓦片
  const moveBoard = useCallback((direction: Direction) => {
    if (gameOver || won) return;

    const newBoard = board.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const moveLeft = (row: number[]) => {
      const filtered = row.filter(val => val !== 0);
      const missing = 4 - filtered.length;
      const zeros = Array(missing).fill(0);
      return filtered.concat(zeros);
    };

    const combineLeft = (row: number[]) => {
      for (let i = 3; i >= 1; i--) {
        if (row[i] !== 0 && row[i] === row[i - 1]) {
          row[i - 1] *= 2;
          row[i] = 0;
          newScore += row[i - 1];
          if (row[i - 1] === 2048 && !won) {
            setWon(true);
          }
        }
      }
      return row;
    };

    const operateRow = (row: number[]) => {
      return moveLeft(combineLeft(moveLeft(row)));
    };

    const rotateBoard = (board: Board) => {
      const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          newBoard[j][3 - i] = board[i][j];
        }
      }
      return newBoard;
    };

    let workingBoard = newBoard;
    
    if (direction === 'left') {
      for (let i = 0; i < 4; i++) {
        const newRow = operateRow(workingBoard[i]);
        if (JSON.stringify(newRow) !== JSON.stringify(workingBoard[i])) {
          moved = true;
        }
        workingBoard[i] = newRow;
      }
    } else if (direction === 'right') {
      for (let i = 0; i < 4; i++) {
        const reversedRow = [...workingBoard[i]].reverse();
        const newRow = operateRow(reversedRow).reverse();
        if (JSON.stringify(newRow) !== JSON.stringify(workingBoard[i])) {
          moved = true;
        }
        workingBoard[i] = newRow;
      }
    } else if (direction === 'up') {
      workingBoard = rotateBoard(rotateBoard(rotateBoard(workingBoard)));
      for (let i = 0; i < 4; i++) {
        const newRow = operateRow(workingBoard[i]);
        if (JSON.stringify(newRow) !== JSON.stringify(workingBoard[i])) {
          moved = true;
        }
        workingBoard[i] = newRow;
      }
      workingBoard = rotateBoard(workingBoard);
    } else if (direction === 'down') {
      workingBoard = rotateBoard(workingBoard);
      for (let i = 0; i < 4; i++) {
        const newRow = operateRow(workingBoard[i]);
        if (JSON.stringify(newRow) !== JSON.stringify(workingBoard[i])) {
          moved = true;
        }
        workingBoard[i] = newRow;
      }
      workingBoard = rotateBoard(rotateBoard(rotateBoard(workingBoard)));
    }

    if (moved) {
      addRandomTile(workingBoard);
      setBoard(workingBoard);
      setScore(newScore);
      
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048-best-score', newScore.toString());
      }
      
      // 检查游戏是否结束
      if (isGameOver(workingBoard)) {
        setGameOver(true);
      }
    }
  }, [board, score, bestScore, gameOver, won]);

  // 检查游戏是否结束
  function isGameOver(board: Board): boolean {
    // 检查是否有空格
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return false;
      }
    }
    
    // 检查是否可以合并
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === board[i][j + 1]) return false;
      }
    }
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === board[i + 1][j]) return false;
      }
    }
    
    return true;
  }

  // 重新开始游戏
  const restartGame = () => {
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowLeft':
          moveBoard('left');
          break;
        case 'ArrowRight':
          moveBoard('right');
          break;
        case 'ArrowUp':
          moveBoard('up');
          break;
        case 'ArrowDown':
          moveBoard('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveBoard]);

  // 获取瓦片颜色
  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      0: 'bg-slate-200',
      2: 'bg-slate-100 text-slate-800',
      4: 'bg-slate-200 text-slate-800',
      8: 'bg-orange-300 text-white',
      16: 'bg-orange-400 text-white',
      32: 'bg-orange-500 text-white',
      64: 'bg-red-400 text-white',
      128: 'bg-yellow-400 text-white',
      256: 'bg-yellow-500 text-white',
      512: 'bg-yellow-600 text-white',
      1024: 'bg-yellow-700 text-white',
      2048: 'bg-yellow-800 text-white'
    };
    return colors[value] || 'bg-purple-500 text-white';
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
        <h2 className="text-lg md:text-xl font-bold">2048</h2>
        <Button variant="ghost" onClick={restartGame} className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
          <RotateCcw className="w-4 h-4" />
          <span className="hidden md:inline">重新开始</span>
          <span className="md:hidden">Restart</span>
        </Button>
      </div>

      {/* 分数 */}
      <div className="flex gap-2 md:gap-4">
        <div className="bg-slate-100 rounded-lg p-2 md:p-3 text-center">
          <div className="text-xs md:text-sm text-slate-600">分数</div>
          <div className="text-lg md:text-xl font-bold">{score}</div>
        </div>
        <div className="bg-slate-100 rounded-lg p-2 md:p-3 text-center">
          <div className="text-xs md:text-sm text-slate-600">最佳</div>
          <div className="text-lg md:text-xl font-bold">{bestScore}</div>
        </div>
      </div>

      {/* 游戏状态 */}
      {(gameOver || won) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-slate-200 rounded-xl p-4 text-center shadow-lg"
        >
          <h3 className="text-lg font-bold mb-2">
            {won ? '🎉 恭喜！您达到了2048！' : '😔 游戏结束'}
          </h3>
          <Button onClick={restartGame} className="mt-2">
            再来一局
          </Button>
        </motion.div>
      )}

      {/* 游戏棋盘 */}
      <div className="bg-slate-300 rounded-xl p-2 grid grid-cols-4 gap-2 w-72 h-72 md:w-80 md:h-80">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <motion.div
              key={`${i}-${j}`}
              className={`rounded-lg flex items-center justify-center text-lg md:text-xl font-bold ${getTileColor(cell)}`}
              initial={{ scale: cell === 0 ? 1 : 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {cell !== 0 && cell}
            </motion.div>
          ))
        )}
      </div>

      {/* 操作说明 */}
      <div className="text-center text-xs md:text-sm text-slate-600 space-y-1 px-4">
        <p>使用方向键移动瓦片</p>
        <p>相同数字的瓦片会合并</p>
        <p>目标：达到2048！</p>
      </div>
    </div>
  );
};
