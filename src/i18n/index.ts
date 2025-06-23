import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 繁體中文（默認）
const zhTW = {
  common: {
    search: '搜索',
    searching: '搜索中...',
    home: '首頁',
    discover: '探索',
    spaces: '空間',
    library: '圖書館',
    academic: '學術',
    finance: '金融',
    travel: '旅遊',
    shopping: '購物',
    troubleshoot: '故障排除',
    health: '健康',
    learn: '學習',
    factCheck: '事實查核',
    summarize: '摘要',
    loading: '載入中...',
    error: '錯誤',
    retry: '重試',
    close: '關閉',
    language: '語言'
  },
  search: {
    placeholder: '問任何問題...',
    askAnything: '問任何問題',
    searchProgress: '搜索進度',
    analyzingQuery: '正在分析查詢...',
    generatingStrategy: '正在生成搜索策略...',
    searchingInfo: '正在搜索相關信息...',
    analyzingResults: '正在分析搜索結果...',
    generatingFollowUp: '正在生成追問建議...',
    sources: '來源',
    citations: '引用',
    followUpQuestions: '相關問題推薦',
    selectSources: '選擇來源',
    trustedAnswers: '可信答案和引用',
    viewAllSources: '查看全部來源',
    expandSource: '展開',
    collapseSource: '收起',
    professionalSearch: '專業搜索',
    poweredByAI: '由先進AI技術驅動，提供即時準確答案',
    realTimeData: '即時最新數據',
    multiLanguageSupport: '多語言支援',
    authorativeSources: '權威來源引用'
  },
  auth: {
    signIn: '登入',
    signUp: '註冊',
    createAccount: '創建帳戶',
    signInOrCreateAccount: '登入或創建帳戶',
    continueWithGoogle: '使用 Google 繼續',
    continueWithApple: '使用 Apple 繼續',
    continueWithEmail: '使用電子郵件繼續',
    enterEmail: '輸入您的電子郵件',
    singleSignOn: '單一登入 (SSO)',
    unlockProSearch: '解鎖 Pro 搜索和歷史記錄'
  },
  games: {
    title: '等待時間小遊戲',
    selectGame: '選擇一個遊戲來打發等待時間',
    game2048: '2048',
    reversi: '黑白棋',
    snake: '貪吃蛇',
    breakout: '打磚塊',
    score: '分數',
    bestScore: '最佳分數',
    gameOver: '遊戲結束',
    youWin: '您贏了！',
    restart: '重新開始',
    newGame: '新遊戲',
    controls: '控制',
    useArrowKeys: '使用方向鍵',
    useMouse: '使用滑鼠',
    clickToPlay: '點擊開始遊戲'
  },
  brand: {
    name: 'Perplexity by Nathan',
    tagline: '基於最新的 RAG 技術，為您提供實時、準確的搜索結果',
    description: '智能搜索 • RAG 架構'
  },
  focus: {
    all: '全部',
    news: '新聞',
    academic: '學術',
    videos: '影片',
    shopping: '購物',
    recent: '最新',
    allDescription: '搜索所有相關信息',
    newsDescription: '搜索最新新聞報道',
    academicDescription: '搜索學術論文和研究',
    videosDescription: '搜索相關影片內容',
    shoppingDescription: '搜索商品和價格信息',
    recentDescription: '搜索最近24小時內的信息'
  }
};

// 简体中文
const zhCN = {
  common: {
    search: '搜索',
    searching: '搜索中...',
    home: '首页',
    discover: '探索',
    spaces: '空间',
    library: '图书馆',
    academic: '学术',
    finance: '金融',
    travel: '旅游',
    shopping: '购物',
    troubleshoot: '故障排除',
    health: '健康',
    learn: '学习',
    factCheck: '事实查核',
    summarize: '摘要',
    loading: '加载中...',
    error: '错误',
    retry: '重试',
    close: '关闭',
    language: '语言'
  },
  search: {
    placeholder: '问任何问题...',
    askAnything: '问任何问题',
    searchProgress: '搜索进度',
    analyzingQuery: '正在分析查询...',
    generatingStrategy: '正在生成搜索策略...',
    searchingInfo: '正在搜索相关信息...',
    analyzingResults: '正在分析搜索结果...',
    generatingFollowUp: '正在生成追问建议...',
    sources: '来源',
    citations: '引用',
    followUpQuestions: '相关问题推荐',
    selectSources: '选择来源',
    trustedAnswers: '可信答案和引用',
    viewAllSources: '查看全部来源',
    expandSource: '展开',
    collapseSource: '收起',
    professionalSearch: '专业搜索',
    poweredByAI: '由先进AI技术驱动，提供即时准确答案',
    realTimeData: '即时最新数据',
    multiLanguageSupport: '多语言支持',
    authorativeSources: '权威来源引用'
  },
  auth: {
    signIn: '登录',
    signUp: '注册',
    createAccount: '创建账户',
    signInOrCreateAccount: '登录或创建账户',
    continueWithGoogle: '使用 Google 继续',
    continueWithApple: '使用 Apple 继续',
    continueWithEmail: '使用电子邮件继续',
    enterEmail: '输入您的电子邮件',
    singleSignOn: '单一登录 (SSO)',
    unlockProSearch: '解锁 Pro 搜索和历史记录'
  },
  games: {
    title: '等待时间小游戏',
    selectGame: '选择一个游戏来打发等待时间',
    game2048: '2048',
    reversi: '黑白棋',
    snake: '贪吃蛇',
    breakout: '打砖块',
    score: '分数',
    bestScore: '最佳分数',
    gameOver: '游戏结束',
    youWin: '您赢了！',
    restart: '重新开始',
    newGame: '新游戏',
    controls: '控制',
    useArrowKeys: '使用方向键',
    useMouse: '使用鼠标',
    clickToPlay: '点击开始游戏'
  },
  brand: {
    name: 'Perplexity by Nathan',
    tagline: '基于最新的 RAG 技术，为您提供实时、准确的搜索结果',
    description: '智能搜索 • RAG 架构'
  },
  focus: {
    all: '全部',
    news: '新闻',
    academic: '学术',
    videos: '视频',
    shopping: '购物',
    recent: '最新',
    allDescription: '搜索所有相关信息',
    newsDescription: '搜索最新新闻报道',
    academicDescription: '搜索学术论文和研究',
    videosDescription: '搜索相关视频内容',
    shoppingDescription: '搜索商品和价格信息',
    recentDescription: '搜索最近24小时内的信息'
  }
};

// 英文
const en = {
  common: {
    search: 'Search',
    searching: 'Searching...',
    home: 'Home',
    discover: 'Discover',
    spaces: 'Spaces',
    library: 'Library',
    academic: 'Academic',
    finance: 'Finance',
    travel: 'Travel',
    shopping: 'Shopping',
    troubleshoot: 'Troubleshoot',
    health: 'Health',
    learn: 'Learn',
    factCheck: 'Fact Check',
    summarize: 'Summarize',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    close: 'Close',
    language: 'Language'
  },
  search: {
    placeholder: 'Ask anything...',
    askAnything: 'Ask anything',
    searchProgress: 'Search Progress',
    analyzingQuery: 'Analyzing query...',
    generatingStrategy: 'Generating search strategy...',
    searchingInfo: 'Searching for information...',
    analyzingResults: 'Analyzing search results...',
    generatingFollowUp: 'Generating follow-up questions...',
    sources: 'Sources',
    citations: 'Citations',
    followUpQuestions: 'Related Questions',
    selectSources: 'Select sources',
    trustedAnswers: 'Trusted answers and citations',
    viewAllSources: 'View all sources',
    expandSource: 'Expand',
    collapseSource: 'Collapse',
    professionalSearch: 'Professional Search',
    poweredByAI: 'Powered by advanced AI technology for instant accurate answers',
    realTimeData: 'Real-time latest data',
    multiLanguageSupport: 'Multi-language support',
    authorativeSources: 'Authoritative source citations'
  },
  auth: {
    signIn: 'Sign in',
    signUp: 'Sign up',
    createAccount: 'Create account',
    signInOrCreateAccount: 'Sign in or create an account',
    continueWithGoogle: 'Continue with Google',
    continueWithApple: 'Continue with Apple',
    continueWithEmail: 'Continue with email',
    enterEmail: 'Enter your email',
    singleSignOn: 'Single sign-on (SSO)',
    unlockProSearch: 'Unlock Pro Search and History'
  },
  games: {
    title: 'Waiting Time Mini Games',
    selectGame: 'Choose a game to pass the waiting time',
    game2048: '2048',
    reversi: 'Reversi',
    snake: 'Snake',
    breakout: 'Breakout',
    score: 'Score',
    bestScore: 'Best Score',
    gameOver: 'Game Over',
    youWin: 'You Win!',
    restart: 'Restart',
    newGame: 'New Game',
    controls: 'Controls',
    useArrowKeys: 'Use arrow keys',
    useMouse: 'Use mouse',
    clickToPlay: 'Click to play'
  },
  brand: {
    name: 'Perplexity by Nathan',
    tagline: 'Real-time, accurate search results powered by the latest RAG technology',
    description: 'AI Search • RAG Architecture'
  },
  focus: {
    all: 'All',
    news: 'News',
    academic: 'Academic',
    videos: 'Videos',
    shopping: 'Shopping',
    recent: 'Recent',
    allDescription: 'Search all relevant information',
    newsDescription: 'Search latest news reports',
    academicDescription: 'Search academic papers and research',
    videosDescription: 'Search related video content',
    shoppingDescription: 'Search products and pricing',
    recentDescription: 'Search information from the last 24 hours'
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      'zh-CN': { translation: zhCN },
      en: { translation: en }
    },
    fallbackLng: 'zh-TW', // 默认繁体中文
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
