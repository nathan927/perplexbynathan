const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// 搜索API端點
app.post('/api/search', async (req, res) => {
  try {
    const { query, language, focus } = req.body;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ 
        error: '搜索查詢不能為空',
        sources: [],
        answer: '請輸入搜索查詢。',
        followUpQuestions: []
      });
    }

    console.log(`執行搜索: "${query}" (語言: ${language}, 焦點: ${focus})`);

    // 模擬真實搜索（在生產環境中，這裡會調用實際的搜索API）
    const searchResults = await performRealSearch(query, language, focus);
    
    res.json(searchResults);
  } catch (error) {
    console.error('搜索API錯誤:', error);
    res.status(500).json({ 
      error: '搜索服務暫時不可用',
      sources: [],
      answer: '抱歉，搜索服務遇到了問題。請稍後再試。',
      followUpQuestions: []
    });
  }
});

// 真實搜索實現
async function performRealSearch(query, language, focus) {
  // 根據語言調整搜索查詢
  const searchQuery = adjustQueryForLanguage(query, language);
  
  // 模擬網絡搜索結果（實際部署時會使用真實的搜索API）
  const sources = await getMockSearchSources(searchQuery, language, focus);
  
  // 生成AI分析
  const answer = generateAIAnswer(sources, query, language);
  
  // 生成相關問題
  const followUpQuestions = generateFollowUpQuestions(query, language);
  
  return {
    sources,
    answer,
    followUpQuestions,
    hasResults: sources.length > 0
  };
}

// 根據語言調整查詢
function adjustQueryForLanguage(query, language) {
  if (language === 'zh-TW' || language === 'zh-HK') {
    // 為繁體中文查詢添加香港相關關鍵詞
    if (!query.includes('香港') && !query.includes('港')) {
      return `${query} 香港`;
    }
  }
  return query;
}

// 獲取模擬搜索源（在實際部署中替換為真實API調用）
async function getMockSearchSources(query, language, focus) {
  // 模擬搜索延遲
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const sources = [];
  const isChineseQuery = /[\u4e00-\u9fa5]/.test(query);
  
  // 基於查詢內容生成相關源
  if (query.toLowerCase().includes('ai') || query.includes('人工智能') || query.includes('智能')) {
    sources.push({
      title: isChineseQuery ? "香港科技園 - AI技術發展平台" : "Hong Kong Science Park - AI Development Platform",
      url: "https://www.hkstp.org/zh-hk/what-we-offer/incubation-acceleration/",
      snippet: isChineseQuery 
        ? "香港科技園公司致力推動人工智能技術發展，提供完善的創新科技生態系統，支持科技公司在AI領域的突破和發展。"
        : "Hong Kong Science Park is committed to promoting AI technology development, providing a comprehensive innovation ecosystem.",
      content: isChineseQuery
        ? "香港科技園作為香港領先的創新科技發展平台，專注於推動人工智能、機器學習、深度學習等前沿技術。我們為初創企業和科技公司提供世界級的基礎設施、資金支持和專業服務，助力它們在AI領域取得重大突破。"
        : "Hong Kong Science Park, as Hong Kong's leading innovation and technology development platform, focuses on promoting cutting-edge technologies such as artificial intelligence, machine learning, and deep learning.",
      hostname: "hkstp.org"
    });
  }
  
  if (query.includes('香港') || query.includes('港') || query.toLowerCase().includes('hong kong')) {
    sources.push({
      title: isChineseQuery ? "數碼港 - 創新數字社區" : "Cyberport - Creative Digital Community",
      url: "https://www.cyberport.hk/",
      snippet: isChineseQuery
        ? "數碼港是香港的創新數字社區，匯聚了眾多科技初創企業、跨國公司和投資者，共同推動數字科技發展。"
        : "Cyberport is Hong Kong's creative digital community, bringing together tech startups, multinational companies and investors.",
      content: isChineseQuery
        ? "數碼港致力於培育數字科技人才和企業，提供從概念到商業化的全方位支援。我們的社區包括金融科技、電子商務、遊戲開發、數字娛樂等多個領域的創新企業。"
        : "Cyberport is committed to nurturing digital technology talent and enterprises, providing comprehensive support from concept to commercialization.",
      hostname: "cyberport.hk"
    });
  }
  
  // 添加政府官方信息源
  sources.push({
    title: isChineseQuery ? "香港政府 - 創新科技署" : "HKSAR Government - Innovation and Technology Commission",
    url: "https://www.itc.gov.hk/",
    snippet: isChineseQuery
      ? "創新科技署負責制定和推行香港的創新科技政策，推動香港發展成為國際創新科技中心。"
      : "The Innovation and Technology Commission formulates and implements Hong Kong's innovation and technology policies.",
    content: isChineseQuery
      ? "創新科技署透過各項政策措施和資助計劃，支持科技研發、人才培訓和產業發展。我們致力於建立完善的創新生態系統，促進產學研合作，推動香港在全球創新科技領域的競爭力。"
      : "The Innovation and Technology Commission supports technology R&D, talent training and industry development through various policy measures and funding schemes.",
    hostname: "itc.gov.hk"
  });
  
  return sources.slice(0, 3);
}

// 生成AI分析回答
function generateAIAnswer(sources, query, language) {
  const isChineseQuery = /[\u4e00-\u9fa5]/.test(query);
  const useChineseResponse = language === 'zh-TW' || language === 'zh-HK' || isChineseQuery;
  
  if (sources.length === 0) {
    return useChineseResponse 
      ? '抱歉，未找到相關搜索結果。請嘗試使用不同的關鍵詞。'
      : 'Sorry, no relevant search results found. Please try different keywords.';
  }
  
  if (useChineseResponse) {
    return `關於「${query}」的搜索結果：

根據最新資訊，我們從多個可靠來源收集了相關信息。${sources.map(s => s.hostname).join('、')}等官方網站提供了詳細的內容。

${sources.map(source => `**${source.title}**
${source.snippet}`).join('\n\n')}

這些資訊來源權威可靠，為您提供了全面的參考資料。香港在相關領域持續發展，各大機構和政府部門都在積極推動創新和進步。`;
  } else {
    return `Search results for "${query}":

Based on the latest information, we have collected relevant content from multiple reliable sources including ${sources.map(s => s.hostname).join(', ')}.

${sources.map(source => `**${source.title}**
${source.snippet}`).join('\n\n')}

These authoritative sources provide comprehensive reference materials. Hong Kong continues to develop in related fields, with major institutions and government departments actively promoting innovation and progress.`;
  }
}

// 生成相關問題
function generateFollowUpQuestions(query, language) {
  const isChineseQuery = /[\u4e00-\u9fa5]/.test(query);
  const useChineseResponse = language === 'zh-TW' || language === 'zh-HK' || isChineseQuery;
  
  if (useChineseResponse) {
    return [
      `${query}在香港的最新發展如何？`,
      `相關政策有哪些新措施？`,
      `香港在這方面有什麼優勢？`,
      `未來發展趨勢是什麼？`
    ];
  } else {
    return [
      `What are the latest developments of ${query} in Hong Kong?`,
      `What new measures are there in related policies?`,
      `What advantages does Hong Kong have in this area?`,
      `What are the future development trends?`
    ];
  }
}

// 處理所有其他路由，返回React應用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Perplexity Hong Kong搜索服務運行在端口 ${PORT}`);
  console.log(`📱 前端應用: http://localhost:${PORT}`);
  console.log(`🔍 搜索API: http://localhost:${PORT}/api/search`);
});

module.exports = app;
