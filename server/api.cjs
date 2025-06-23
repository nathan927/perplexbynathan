const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// 中間件
app.use(cors());
app.use(express.json());

// 模擬搜索服務
const performMockSearch = async (query, language = 'zh-HK', focus = 'all') => {
  // 模擬搜索延遲
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockSources = [
    {
      title: language === 'zh-HK' ? "香港科技園 - AI 技術發展" : "Hong Kong Science Park - AI Development",
      url: "https://www.hkstp.org/zh-hk/what-we-offer/",
      snippet: language === 'zh-HK' 
        ? "香港科技園致力推動AI技術發展，提供完善的創新科技生態系統，支持初創企業和科技公司的發展。"
        : "Hong Kong Science Park is committed to promoting AI technology development, providing a comprehensive innovation ecosystem.",
      content: language === 'zh-HK'
        ? "香港科技園公司是香港領先的創新科技發展平台，致力推動人工智能等新興技術的發展。我們提供世界級的基礎設施、資金支持和專業服務，協助科技企業實現突破性創新。"
        : "Hong Kong Science Park is Hong Kong's leading innovation and technology development platform, committed to promoting the development of emerging technologies such as artificial intelligence.",
      hostname: "hkstp.org"
    },
    {
      title: language === 'zh-HK' ? "香港大學 - 人工智能研究" : "University of Hong Kong - AI Research",
      url: "https://www.hku.hk/research/",
      snippet: language === 'zh-HK'
        ? "香港大學在人工智能領域的研究涵蓋機器學習、深度學習、自然語言處理等多個前沿方向。"
        : "The University of Hong Kong's research in artificial intelligence covers machine learning, deep learning, natural language processing and other cutting-edge directions.",
      content: language === 'zh-HK'
        ? "香港大學的AI研究團隊由世界知名學者領導，在計算機視覺、語音識別、智能機器人等領域取得了重要突破。研究成果廣泛應用於醫療、金融、教育等行業。"
        : "The AI research team at the University of Hong Kong is led by world-renowned scholars and has made important breakthroughs in computer vision, speech recognition, intelligent robots and other fields.",
      hostname: "hku.hk"
    },
    {
      title: language === 'zh-HK' ? "香港政府 - 智慧城市藍圖" : "Hong Kong Government - Smart City Blueprint",
      url: "https://www.smartcity.gov.hk/",
      snippet: language === 'zh-HK'
        ? "香港政府推出智慧城市藍圖，利用創新科技提升城市管理效率，改善市民生活質素。"
        : "The Hong Kong Government has launched a smart city blueprint to use innovative technology to improve urban management efficiency and improve citizens' quality of life.",
      content: language === 'zh-HK'
        ? "智慧城市藍圖包括智慧出行、智慧生活、智慧環境、智慧市民、智慧政府和智慧經濟六大範疇，透過大數據、人工智能等技術實現城市數碼化轉型。"
        : "The Smart City Blueprint includes six major areas: smart mobility, smart living, smart environment, smart people, smart government and smart economy.",
      hostname: "smartcity.gov.hk"
    }
  ];

  const answer = language === 'zh-HK' 
    ? `關於"${query}"的搜索結果：根據最新資訊，香港在AI技術發展方面正處於快速發展階段。香港科技園、各大學府和政府都在積極推動人工智能技術的研究與應用。

香港科技園作為創新科技發展的重要平台，為AI初創企業提供了完善的支持生態系統。同時，香港大學等學術機構在AI研究方面也取得了重要突破，特別是在機器學習和深度學習領域。

政府方面，智慧城市藍圖的推出標誌著香港正式進入AI驅動的城市管理新時代，通過大數據和人工智能技術提升各個領域的效率。`
    : `Search results for "${query}": According to the latest information, Hong Kong is in a rapid development stage in AI technology development. Hong Kong Science Park, universities and the government are actively promoting the research and application of artificial intelligence technology.`;

  const followUpQuestions = language === 'zh-HK' 
    ? [
        "香港AI政策的具體實施措施有哪些？",
        "哪些香港公司在AI領域表現突出？",
        "香港AI人才培養計劃的詳細內容？",
        "香港與內地在AI合作方面有什麼進展？"
      ]
    : [
        "What are the specific implementation measures of Hong Kong's AI policy?",
        "Which Hong Kong companies are outstanding in the AI field?",
        "What are the details of Hong Kong's AI talent development plan?",
        "What progress has been made in AI cooperation between Hong Kong and the mainland?"
      ];

  return {
    sources: mockSources,
    answer,
    followUpQuestions
  };
};

// 搜索API端點
app.post('/api/search', async (req, res) => {
  try {
    const { query, language = 'zh-HK', focus = 'all', num_results = 10 } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        error: '搜索查詢不能為空',
        message: 'Search query cannot be empty' 
      });
    }

    console.log(`搜索請求: "${query}" (語言: ${language}, 焦點: ${focus})`);
    
    const searchResult = await performMockSearch(query, language, focus);
    
    res.json({
      success: true,
      query,
      language,
      focus,
      ...searchResult
    });
    
  } catch (error) {
    console.error('搜索錯誤:', error);
    res.status(500).json({ 
      error: '搜索服務暫時不可用',
      message: 'Search service temporarily unavailable',
      details: error.message 
    });
  }
});

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Perplexity Hong Kong API is running',
    timestamp: new Date().toISOString()
  });
});

// 提供靜態文件（用於生產環境）
app.use(express.static(path.join(__dirname, '../dist')));

// 對於所有其他路由，返回React應用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`🚀 Perplexity Hong Kong API 服務器運行於 http://localhost:${PORT}`);
  console.log(`📊 健康檢查: http://localhost:${PORT}/api/health`);
  console.log(`🔍 搜索API: http://localhost:${PORT}/api/search`);
});

module.exports = app;
