import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gamepad2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Game2048 } from './Game2048';
import { ReversiGame } from './ReversiGame';
import { SnakeGame } from './SnakeGame';
import { BreakoutGame } from './BreakoutGame';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchProgress: number;
}

type GameType = '2048' | 'reversi' | 'snake' | 'breakout' | null;

export const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose, searchProgress }) => {
  const { t } = useTranslation();
  const [selectedGame, setSelectedGame] = useState<GameType>(null);

  const games = [
    {
      id: '2048' as GameType,
      name: t('games.game2048'),
      description: '经典数字合成游戏',
      color: 'bg-orange-500',
      icon: '🎯'
    },
    {
      id: 'reversi' as GameType,
      name: t('games.reversi'),
      description: '策略翻转棋类游戏',
      color: 'bg-purple-500',
      icon: '⚫'
    },
    {
      id: 'snake' as GameType,
      name: t('games.snake'),
      description: '经典贪吃蛇游戏',
      color: 'bg-green-500',
      icon: '🐍'
    },
    {
      id: 'breakout' as GameType,
      name: t('games.breakout'),
      description: '经典弹球打砖块',
      color: 'bg-blue-500',
      icon: '🏓'
    }
  ];

  const handleGameSelect = (gameId: GameType) => {
    setSelectedGame(gameId);
  };

  const handleBackToSelection = () => {
    setSelectedGame(null);
  };

  const renderGameComponent = () => {
    switch (selectedGame) {
      case '2048':
        return <Game2048 onBack={handleBackToSelection} />;
      case 'reversi':
        return <ReversiGame onBack={handleBackToSelection} />;
      case 'snake':
        return <SnakeGame onBack={handleBackToSelection} />;
      case 'breakout':
        return <BreakoutGame onBack={handleBackToSelection} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 rounded-lg md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700 bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white">
                    {t('games.title')}
                  </CardTitle>
                  <p className="text-sm text-slate-300">
                    搜索进度: {Math.round(searchProgress)}%
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>

            <CardContent className="p-6">
              {!selectedGame ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <p className="text-center text-slate-300 mb-6">
                    {t('games.selectGame')}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {games.map((game) => (
                      <motion.div
                        key={game.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-slate-600 hover:border-blue-400 bg-slate-800"
                          onClick={() => handleGameSelect(game.id)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className={`w-16 h-16 ${game.color} rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl`}>
                              {game.icon}
                            </div>
                            <h3 className="font-semibold text-white mb-1">
                              {game.name}
                            </h3>
                            <p className="text-xs text-slate-300">
                              {game.description}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* 搜索进度条 */}
                  <div className="mt-6 p-4 bg-slate-700 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">搜索进度</span>
                      <span className="text-sm text-slate-300">{Math.round(searchProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${searchProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      搜索完成后将自动关闭游戏窗口
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-[500px] overflow-auto"
                >
                  {renderGameComponent()}
                </motion.div>
              )}
            </CardContent>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
