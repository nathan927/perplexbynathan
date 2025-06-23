import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Compass, 
  Users, 
  BookOpen, 
  GraduationCap,
  DollarSign,
  MapPin,
  ShoppingCart,
  Stethoscope,
  Lightbulb,
  CheckCircle,
  FileText,
  Search,
  Mic,
  Upload,
  Camera,
  Plus,
  Languages,
  ChevronDown,
  Globe,
  Bot
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { SearchResults } from './SearchResults';
import { GameModal } from './games/GameModal';
import { productionSearchService } from '../services/productionSearchService';
import { type SearchQuery, type SearchResult } from '../services/realSearchService';

export const MainInterface: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchProgress, setSearchProgress] = useState(0);
  const [showGames, setShowGames] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);



  // 导航项目
  const navigationItems = [
    { icon: Home, label: t('common.home'), id: 'home', active: true },
    { icon: Compass, label: t('common.discover'), id: 'discover' },
    { icon: Users, label: t('common.spaces'), id: 'spaces' },
    { icon: BookOpen, label: t('common.library'), id: 'library' }
  ];

  // 功能标签
  const featureTags = [
    { icon: Stethoscope, label: t('common.troubleshoot'), color: 'bg-red-600 text-white hover:bg-red-700' },
    { icon: Lightbulb, label: t('common.health'), color: 'bg-blue-600 text-white hover:bg-blue-700' },
    { icon: GraduationCap, label: t('common.learn'), color: 'bg-green-600 text-white hover:bg-green-700' },
    { icon: CheckCircle, label: t('common.factCheck'), color: 'bg-purple-600 text-white hover:bg-purple-700' },
    { icon: FileText, label: t('common.summarize'), color: 'bg-orange-600 text-white hover:bg-orange-700' }
  ];

  // 焦点分类
  const focusCategories = [
    { icon: Globe, label: t('focus.all'), id: 'all', color: 'bg-slate-100' },
    { icon: BookOpen, label: t('focus.news'), id: 'news', color: 'bg-red-100' },
    { icon: GraduationCap, label: t('focus.academic'), id: 'academic', color: 'bg-purple-100' },
    { icon: DollarSign, label: t('common.finance'), id: 'finance', color: 'bg-green-100' },
    { icon: MapPin, label: t('common.travel'), id: 'travel', color: 'bg-blue-100' },
    { icon: ShoppingCart, label: t('common.shopping'), id: 'shopping', color: 'bg-orange-100' }
  ];

  // 语言选项
  const languages = [
    { code: 'zh-TW', name: '繁體中文', flag: '🇭🇰' },
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  // 执行搜索
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    setSearchProgress(0);
    setShowGames(true); // 显示游戏弹窗

    try {
      // 模拟搜索进度
      const progressSteps = [15, 35, 60, 85, 100];
      const stepMessages = [
        t('search.analyzingQuery'),
        t('search.generatingStrategy'),
        t('search.searchingInfo'),
        t('search.analyzingResults'),
        t('search.generatingFollowUp')
      ];

      for (let i = 0; i < progressSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        setSearchProgress(progressSteps[i]);
      }

      // 执行真实搜索
      const searchRequest: SearchQuery = {
        query: searchQuery,
        language: i18n.language,
        focus: selectedFocus
      };

      const result = await productionSearchService.performSearch(searchRequest);
      setSearchResult(result);

    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setIsSearching(false);
      setShowGames(false); // 隐藏游戏弹窗
    }
  };

  // 处理输入
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };



  // 切换语言
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  // 處理導航點擊
  const handleNavigation = (itemId: string) => {
    console.log(`導航到: ${itemId}`);
    // 這裡可以添加具體的導航邏輯，例如路由跳轉或狀態切換
  };

  // 處理麥克風功能
  const handleMicClick = () => {
    console.log('語音輸入功能');
    // 可以添加語音識別功能
    alert('語音輸入功能暫未實現，請直接輸入文字');
  };

  // 處理文件上傳
  const handleUploadClick = () => {
    console.log('文件上傳功能');
    // 可以添加文件上傳功能
    alert('文件上傳功能暫未實現');
  };

  // 處理相機功能
  const handleCameraClick = () => {
    console.log('相機功能');
    // 可以添加相機功能
    alert('相機功能暫未實現');
  };

  // 處理功能標籤點擊
  const handleFeatureTagClick = (label: string) => {
    console.log(`功能標籤: ${label}`);
    // 根據標籤設置搜索前綴或模式
    const prefixes: { [key: string]: string } = {
      [t('common.troubleshoot')]: '請幫我排解故障：',
      [t('common.health')]: '關於健康：',
      [t('common.learn')]: '請教我：',
      [t('common.factCheck')]: '請幫我查證：',
      [t('common.summarize')]: '請為我總結：'
    };
    
    const prefix = prefixes[label] || '';
    setQuery(prefix);
    inputRef.current?.focus();
  };

  // 焦点自动聚焦
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* 左侧导航栏 - 移动端隐藏 */}
      <div className="hidden md:flex w-16 bg-slate-800 border-r border-slate-700 flex-col items-center py-6">
        <div className="mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
        </div>

        <nav className="flex flex-col gap-4">
          {navigationItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation(item.id)}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                ${item.active 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'}
              `}
            >
              <item.icon className="w-5 h-5" />
            </motion.button>
          ))}
        </nav>

        <div className="mt-auto">
          <Button variant="ghost" size="sm" className="w-10 h-10 rounded-xl">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 品牌标题 */}
        <div className="text-center py-12 md:py-20 px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="text-4xl md:text-6xl font-light text-white mb-6 md:mb-8 cursor-pointer hover:text-blue-300 transition-colors duration-300"
            title="点击返回首页"
          >
            {t('brand.name')}
          </motion.h1>
          <p className="text-slate-400 text-base md:text-lg">
            {t('brand.tagline')}
          </p>
        </div>

        {/* 搜索区域 */}
        <div className="flex-1 max-w-4xl mx-auto px-4 md:px-6 w-full">
          {!searchResult ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* 焦点分类 */}
              <div className="flex flex-wrap gap-2 justify-center mb-8 md:mb-12">
                {focusCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFocus(category.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${selectedFocus === category.id 
                        ? `bg-blue-600 text-white border-2 border-blue-500` 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-2 border-transparent'}
                    `}
                  >
                    <category.icon className="w-4 h-4" />
                    {category.label}
                  </motion.button>
                ))}
              </div>

              {/* 主搜索框 */}
              <div className="relative">
                <Card className="border-2 border-slate-600 hover:border-slate-500 transition-colors bg-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-slate-400" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        placeholder={t('search.placeholder')}
                        className="flex-1 text-base md:text-lg bg-transparent border-none outline-none text-white placeholder-slate-400"
                        disabled={isSearching}
                      />
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 hover:bg-slate-700"
                          onClick={handleMicClick}
                        >
                          <Mic className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 hover:bg-slate-700"
                          onClick={handleUploadClick}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 hover:bg-slate-700"
                          onClick={handleCameraClick}
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 功能标签 */}
              <div className="flex flex-wrap gap-3 justify-center">
                {featureTags.map((tag, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFeatureTagClick(tag.label)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${tag.color}`}
                  >
                    <tag.icon className="w-4 h-4" />
                    {tag.label}
                  </motion.button>
                ))}
              </div>


            </motion.div>
          ) : (
            /* 搜索结果 */
            <SearchResults 
              result={searchResult}
              onNewSearch={(newQuery) => {
                setQuery(newQuery);
                setSearchResult(null);
                handleSearch(newQuery);
              }}
            />
          )}
        </div>
      </div>

      {/* 右侧面板 - 移动端隐藏 */}
      <div className="hidden lg:block w-80 bg-slate-800 border-l border-slate-700 p-6">
        {/* 语言选择器 */}
        <div className="mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  <span>{languages.find(lang => lang.code === i18n.language)?.name}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="flex items-center gap-2"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator className="mb-6" />

        {/* 專業搜索資訊區域 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-white mb-2">
                {t('search.professionalSearch')}
              </h3>
              <p className="text-sm text-slate-300 mb-4">
                {t('search.poweredByAI')}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {t('search.realTimeData')}
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {t('search.multiLanguageSupport')}
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                {t('search.authorativeSources')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 搜索来源说明 */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm font-medium text-slate-300">
            {t('search.selectSources')}
          </p>
          <p className="text-xs text-slate-500">
            {t('search.trustedAnswers')}
          </p>
        </div>
      </div>

      {/* 游戏弹窗 */}
      <GameModal 
        isOpen={showGames}
        onClose={() => setShowGames(false)}
        searchProgress={searchProgress}
      />
    </div>
  );
};

export default MainInterface;
