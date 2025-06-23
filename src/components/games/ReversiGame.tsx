import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, User, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface ReversiGameProps {
  onBack: () => void;
}

type Player = 'black' | 'white' | null;
type Board = Player[][];

export const ReversiGame: React.FC<ReversiGameProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [board, setBoard] = useState<Board>(() => initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [blackScore, setBlackScore] = useState(2);
  const [whiteScore, setWhiteScore] = useState(2);
  const [gameOver, setGameOver] = useState(false);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // 初始化棋盘
  function initializeBoard(): Board {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    // 初始4个棋子
    board[3][3] = 'white';
    board[3][4] = 'black';
    board[4][3] = 'black';
    board[4][4] = 'white';
    return board;
  }

  // 检查是否是有效移动
  const isValidMove = useCallback((board: Board, row: number, col: number, player: Player): boolean => {
    if (board[row][col] !== null) return false;
    
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dx, dy] of directions) {
      let x = row + dx;
      let y = col + dy;
      let hasOpponent = false;
      
      while (x >= 0 && x < 8 && y >= 0 && y < 8 && board[x][y] !== null) {
        if (board[x][y] !== player) {
          hasOpponent = true;
        } else if (hasOpponent) {
          return true;
        } else {
          break;
        }
        x += dx;
        y += dy;
      }
    }
    
    return false;
  }, []);

  // 获取所有有效移动
  const getValidMoves = useCallback((board: Board, player: Player): [number, number][] => {
    const moves: [number, number][] = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (isValidMove(board, i, j, player)) {
          moves.push([i, j]);
        }
      }
    }
    return moves;
  }, [isValidMove]);

  // 执行移动
  const makeMove = useCallback((board: Board, row: number, col: number, player: Player): Board => {
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = player;
    
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dx, dy] of directions) {
      let x = row + dx;
      let y = col + dy;
      const toFlip: [number, number][] = [];
      
      while (x >= 0 && x < 8 && y >= 0 && y < 8 && newBoard[x][y] !== null) {
        if (newBoard[x][y] !== player) {
          toFlip.push([x, y]);
        } else {
          // 翻转所有中间的棋子
          toFlip.forEach(([fx, fy]) => {
            newBoard[fx][fy] = player;
          });
          break;
        }
        x += dx;
        y += dy;
      }
    }
    
    return newBoard;
  }, []);

  // 计算分数
  const calculateScore = useCallback((board: Board) => {
    let black = 0, white = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j] === 'black') black++;
        else if (board[i][j] === 'white') white++;
      }
    }
    return { black, white };
  }, []);

  // AI移动（简单算法）
  const makeAIMove = useCallback(() => {
    if (currentPlayer !== 'white' || gameOver) return;
    
    setIsAIThinking(true);
    
    setTimeout(() => {
      const moves = getValidMoves(board, 'white');
      if (moves.length === 0) {
        setCurrentPlayer('black');
        setIsAIThinking(false);
        return;
      }
      
      // 简单AI：选择能翻转最多棋子的位置
      let bestMove = moves[0];
      let bestScore = 0;
      
      for (const [row, col] of moves) {
        const testBoard = makeMove(board, row, col, 'white');
        const score = calculateScore(testBoard).white;
        if (score > bestScore) {
          bestScore = score;
          bestMove = [row, col];
        }
      }
      
      const newBoard = makeMove(board, bestMove[0], bestMove[1], 'white');
      setBoard(newBoard);
      
      const scores = calculateScore(newBoard);
      setBlackScore(scores.black);
      setWhiteScore(scores.white);
      
      setCurrentPlayer('black');
      setIsAIThinking(false);
    }, 1000);
  }, [currentPlayer, gameOver, board, getValidMoves, makeMove, calculateScore]);

  // 处理玩家点击
  const handleCellClick = (row: number, col: number) => {
    if (currentPlayer !== 'black' || gameOver || isAIThinking) return;
    if (!isValidMove(board, row, col, 'black')) return;
    
    const newBoard = makeMove(board, row, col, 'black');
    setBoard(newBoard);
    
    const scores = calculateScore(newBoard);
    setBlackScore(scores.black);
    setWhiteScore(scores.white);
    
    setCurrentPlayer('white');
  };

  // 重新开始游戏
  const restartGame = () => {
    setBoard(initializeBoard());
    setCurrentPlayer('black');
    setBlackScore(2);
    setWhiteScore(2);
    setGameOver(false);
    setValidMoves([]);
    setIsAIThinking(false);
  };

  // 更新有效移动和检查游戏结束
  useEffect(() => {
    const blackMoves = getValidMoves(board, 'black');
    const whiteMoves = getValidMoves(board, 'white');
    
    if (currentPlayer === 'black') {
      setValidMoves(blackMoves);
      if (blackMoves.length === 0 && whiteMoves.length === 0) {
        setGameOver(true);
      } else if (blackMoves.length === 0) {
        setCurrentPlayer('white');
      }
    } else {
      setValidMoves([]);
      if (whiteMoves.length === 0 && blackMoves.length === 0) {
        setGameOver(true);
      } else if (whiteMoves.length === 0) {
        setCurrentPlayer('black');
      }
    }
  }, [board, currentPlayer, getValidMoves]);

  // AI自动移动
  useEffect(() => {
    if (currentPlayer === 'white' && !gameOver) {
      makeAIMove();
    }
  }, [currentPlayer, gameOver, makeAIMove]);

  const isValidMoveCell = (row: number, col: number) => {
    return validMoves.some(([r, c]) => r === row && c === col);
  };

  const getWinner = () => {
    if (blackScore > whiteScore) return 'black';
    if (whiteScore > blackScore) return 'white';
    return 'tie';
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
        <h2 className="text-lg md:text-xl font-bold">黑白棋</h2>
        <Button variant="ghost" onClick={restartGame} className="flex items-center gap-1 md:gap-2 text-sm md:text-base">
          <RotateCcw className="w-4 h-4" />
          <span className="hidden md:inline">重新开始</span>
          <span className="md:hidden">Restart</span>
        </Button>
      </div>

      {/* 分数和状态 */}
      <div className="flex gap-2 md:gap-4">
        <div className={`bg-slate-100 rounded-lg p-2 md:p-3 text-center border-2 ${
          currentPlayer === 'black' && !gameOver ? 'border-black' : 'border-transparent'
        }`}>
          <div className="flex items-center gap-1 md:gap-2 mb-1">
            <User className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm text-slate-600">黑棋</span>
          </div>
          <div className="text-lg md:text-xl font-bold">{blackScore}</div>
        </div>
        
        <div className={`bg-slate-100 rounded-lg p-2 md:p-3 text-center border-2 ${
          currentPlayer === 'white' && !gameOver ? 'border-red-500' : 'border-transparent'
        }`}>
          <div className="flex items-center gap-1 md:gap-2 mb-1">
            <Bot className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm text-slate-600">白棋 (AI)</span>
          </div>
          <div className="text-lg md:text-xl font-bold">{whiteScore}</div>
        </div>
      </div>

      {/* 当前状态 */}
      <div className="text-center">
        {gameOver ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-lg"
          >
            <h3 className="text-lg font-bold mb-2">
              {getWinner() === 'black' ? '🎉 您获胜了！' :
               getWinner() === 'white' ? '😔 AI获胜了！' : '🤝 平局！'}
            </h3>
            <p className="text-sm text-slate-600 mb-2">
              最终分数：黑棋 {blackScore} - 白棋 {whiteScore}
            </p>
            <Button onClick={restartGame} className="mt-2">
              再来一局
            </Button>
          </motion.div>
        ) : (
          <div className="text-sm">
            {isAIThinking ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                AI思考中...
              </div>
            ) : (
              <span>
                {currentPlayer === 'black' ? '您的回合 (黑棋)' : 'AI的回合 (白棋)'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 游戏棋盘 */}
      <div className="bg-green-600 rounded-xl p-1 md:p-2 grid grid-cols-8 gap-1">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <motion.div
              key={`${i}-${j}`}
              className={`
                w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-500 border border-green-700 
                flex items-center justify-center cursor-pointer
                ${isValidMoveCell(i, j) ? 'ring-1 md:ring-2 ring-yellow-400 ring-opacity-70' : ''}
                ${currentPlayer === 'black' && !gameOver && !isAIThinking ? 'hover:bg-green-400' : ''}
              `}
              onClick={() => handleCellClick(i, j)}
              whileHover={
                currentPlayer === 'black' && !gameOver && !isAIThinking 
                  ? { scale: 1.1 } 
                  : {}
              }
              whileTap={{ scale: 0.95 }}
            >
              {cell && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`
                    w-6 h-6 md:w-8 md:h-8 rounded-full border-2
                    ${cell === 'black' 
                      ? 'bg-black border-gray-300' 
                      : 'bg-white border-gray-700'}
                  `}
                />
              )}
              
              {/* 显示可能的移动位置 */}
              {isValidMoveCell(i, j) && currentPlayer === 'black' && !gameOver && (
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-400 opacity-60" />
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* 规则说明 */}
      <div className="text-center text-xs md:text-sm text-slate-600 space-y-1 max-w-xs px-4">
        <p>点击黄色标记的位置下棋</p>
        <p>夹住对方棋子来翻转它们</p>
        <p>最终棋子多的一方获胜</p>
      </div>
    </div>
  );
};
