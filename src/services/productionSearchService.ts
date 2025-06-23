// Production 級真實搜索服務 - 使用用戶提供的 API 端點
import { SearchQuery, SearchResult, SearchSource } from './realSearchService';

// Helper interface for structured LLM response for sources
interface LLMSourceSuggestion {
  searchQueries?: string[];
  urls?: string[];
}

class ProductionSearchService {
  private readonly API_ENDPOINT = "https://aiquiz.ycm927.workers.dev";
  private readonly MODEL_FALLBACK_LIST = [
    "google/gemini-2.0-flash-exp:free",
    "deepseek/deepseek-r1-0528:free",
    "google/gemini-2.5-flash-preview-05-20"
  ];

  // 新增方法：從LLM獲取潛在的搜索查詢或URL
  private async getPotentialSourcesFromLLM(originalQuery: string, language: string): Promise<LLMSourceSuggestion> {
    const prompt = `Based on the user query "${originalQuery}" (language: ${language}), suggest 3-5 relevant web search queries OR direct URLs to find the most up-to-date and accurate information.
Return your answer ONLY as a JSON object with one or both of the following keys: "searchQueries" (a list of strings) or "urls" (a list of strings). For example:
{
  "searchQueries": ["latest AI developments in Hong Kong", "Hong Kong AI policy 2024"],
  "urls": ["https://www.example.com/ai-news", "https://www.another-example.com/hk-ai-report"]
}
If suggesting search queries, ensure they are effective for use with a standard search engine.
If suggesting URLs, ensure they are likely to contain relevant information.
Provide ONLY the JSON object in your response.`;

    // Try with the first model, can add fallback logic if needed
    const modelToUse = this.MODEL_FALLBACK_LIST[0];
    try {
      const response = await this.callAPI(modelToUse, prompt);
      // Attempt to parse the response as JSON
      const jsonResponse = JSON.parse(response) as LLMSourceSuggestion;
      if (jsonResponse.searchQueries || jsonResponse.urls) {
        return {
            searchQueries: jsonResponse.searchQueries?.slice(0, 5), // Limit to 5
            urls: jsonResponse.urls?.slice(0, 5) // Limit to 5
        };
      }
      console.warn("LLM source suggestion response was not in the expected format:", response);
      return {};
    } catch (error) {
      console.error("Error getting potential sources from LLM:", error);
      console.error("LLM response was:", error.response); // Log the problematic response if possible
      return {}; // Return empty object on error
    }
  }

  // 執行真實搜索
  async performSearch(searchQuery: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    let fetchedWebContext: { url: string, content: string, title?: string }[] = [];
    let actualSourcesForDisplay: SearchSource[] = [];

    try {
      // 1. 從LLM獲取潛在的搜索查詢或URL
      const potentialSources = await this.getPotentialSourcesFromLLM(searchQuery.query, searchQuery.language);
      console.log("Potential sources from LLM:", potentialSources);

      // 2. Fetch content from URLs if any are provided
      if (potentialSources.urls && potentialSources.urls.length > 0) {
        const urlsToFetch = potentialSources.urls.slice(0, 3); // Limit to fetching first 3 URLs

        for (const url of urlsToFetch) {
          try {
            console.log(`Fetching content from URL: ${url}`);
            // @ts-ignore Tool is available globally in the worker
            const siteContent = await view_text_website(url);

            if (siteContent) {
              const title = url; // Using URL as title for now
              const contentSnippet = siteContent.substring(0, 1500); // Truncate for context
              const displaySnippet = siteContent.substring(0, 200); // Shorter for display

              fetchedWebContext.push({ url, content: contentSnippet, title });
              actualSourcesForDisplay.push({
                title: title,
                url: url,
                snippet: displaySnippet,
                content: contentSnippet, // Store the truncated content
                hostname: new URL(url).hostname.replace(/^www\./, '')
              });
            }
          } catch (fetchError) {
            console.warn(`Failed to fetch content from ${url}:`, fetchError);
            // Optionally add a placeholder source indicating failure
            actualSourcesForDisplay.push({
              title: `Failed to load: ${url}`,
              url: url,
              snippet: `Could not retrieve content from this URL. ${fetchError.message || ''}`.substring(0,200),
              content: '',
              hostname: new URL(url).hostname.replace(/^www\./, '')
            });
          }
        }
      }
      // TODO: Handle potentialSources.searchQueries (construct search URLs, fetch, parse results)

      console.log("Fetched web context snippets:", fetchedWebContext.map(s => ({url: s.url, len: s.content.length })));

      // 3. 構建查詢提示詞 (Augmented with fetched context)
      const prompt = this.buildRAGPrompt(searchQuery, fetchedWebContext);

      // 4. 嘗試多個模型進行搜索
      for (const model of this.MODEL_FALLBACK_LIST) {
        try {
          const result = await this.callAPI(model, prompt);
          if (result) {
            const searchTime = Date.now() - startTime;
            return this.formatSearchResult(searchQuery.query, result, searchTime, actualSourcesForDisplay);
          }
        } catch (error) {
          console.warn(`模型 ${model} 失敗，嘗試下一個:`, error);
          continue;
        }
      }

      throw new Error('所有模型都失敗了');

    } catch (error) {
      console.error('搜索處理錯誤:', error);
      const searchTime = Date.now() - startTime;
      return {
        query: searchQuery.query,
        sources: actualSourcesForDisplay, // Return any sources fetched before the error
        answer: `抱歉，處理您的請求時發生錯誤。 ${error.message || ''}`.substring(0, 500),
        followUpQuestions: [],
        searchTime,
        hasResults: false
      };
    }
  }

  // 修改 buildRAGPrompt 以接受外部上下文
  private buildRAGPrompt(searchQuery: SearchQuery, contextSnippets: { url: string, content: string, title?: string }[]): string {
    const { query, language, focus } = searchQuery;
    const currentDate = new Date().toISOString().split('T')[0];

    let contextText = "";
    if (contextSnippets && contextSnippets.length > 0) {
      contextText = "\n\n**Relevant Information from Web Search:**\n";
      contextSnippets.forEach((snippet, index) => {
        contextText += `\n[Source ${index + 1}: ${snippet.url} (${snippet.title || 'Untitled'})]\n${snippet.content}\n`;
      });
      contextText += "\nPlease synthesize an answer based on the above information and your general knowledge. Cite sources using [Source X] notation where appropriate.\n";
    }

    // 智能檢測查詢語言（檢查實際查詢內容的語言）
    const detectedLanguage = this.detectQueryLanguage(query, language);
    
    // 分析問題複雜度
    const complexity = this.analyzeQueryComplexity(query);
    
    let focusInstruction = "";
    switch (focus) {
      case 'news':
        focusInstruction = detectedLanguage === 'zh-CN' ? "专注于最新新闻和时事" : "專注於最新新聞和時事";
        break;
      case 'academic':
        focusInstruction = detectedLanguage === 'zh-CN' ? "专注于学术研究和教育资源" : "專注於學術研究和教育資源";
        break;
      case 'finance':
        focusInstruction = detectedLanguage === 'zh-CN' ? "专注于金融市场和投资信息" : "專注於金融市場和投資資訊";
        break;
      case 'travel':
        focusInstruction = detectedLanguage === 'zh-CN' ? "专注于旅游信息和地点介绍" : "專注於旅遊資訊和地點介紹";
        break;
      case 'shopping':
        focusInstruction = detectedLanguage === 'zh-CN' ? "专注于产品信息和购物建议" : "專注於產品資訊和購物建議";
        break;
      default:
        focusInstruction = detectedLanguage === 'zh-CN' ? "提供全面的信息" : "提供全面的資訊";
    }

    // 根據複雜度和語言調整回應要求
    let responseRequirement = "";
    if (detectedLanguage === 'zh-CN') {
      if (complexity === 'simple') {
        responseRequirement = `
**回应要求 (简单问题):**
- 用1-3句话直接回答
- 提供关键信息，避免过度解释
- 如果是事实问题，直接给出答案
- 保持简洁明了`;
      } else if (complexity === 'moderate') {
        responseRequirement = `
**回应要求 (中等复杂度):**
- 用2-4个段落回答
- 提供核心信息和必要背景
- 包含相关细节但避免冗余
- 结构清晰，重点突出`;
      } else {
        responseRequirement = `
**回应要求 (复杂问题):**
- 提供详细、结构化的回答
- 包含多个角度和深入分析
- 提供背景信息、现状和趋势
- 给出实用建议和总结`;
      }
    } else {
      if (complexity === 'simple') {
        responseRequirement = `
**回應要求 (簡單問題):**
- 用1-3句話直接回答
- 提供關鍵資訊，避免過度解釋
- 如果是事實問題，直接給出答案
- 保持簡潔明瞭`;
      } else if (complexity === 'moderate') {
        responseRequirement = `
**回應要求 (中等複雜度):**
- 用2-4個段落回答
- 提供核心資訊和必要背景
- 包含相關細節但避免冗餘
- 結構清晰，重點突出`;
      } else {
        responseRequirement = `
**回應要求 (複雜問題):**
- 提供詳細、結構化的回答
- 包含多個角度和深入分析
- 提供背景資訊、現狀和趨勢
- 給出實用建議和總結`;
      }
    }

    const languageInstruction = detectedLanguage === 'zh-CN' ? 
      '使用简体中文回答，使用中国大陆的用词习惯' : 
      detectedLanguage === 'zh-TW' ? 
        '使用繁體中文回答，使用台灣香港的用詞習慣' : 
        'Answer in English';

    const promptTemplate = detectedLanguage === 'zh-CN' ? 
      `你是专业的AI搜索助手，类似Perplexity.ai。根据问题复杂度提供适当详细程度的回答。

**基本要求:**
1. 直接回答问题，不说客套话
2. 使用最新信息（当前日期：${currentDate}）
3. ${focusInstruction}
4. ${languageInstruction}
5. 确保准确性和实用性

${responseRequirement}

**用户问题:** ${query}

现在开始回答：` :
      `你是專業的AI搜索助手，類似Perplexity.ai。根據問題複雜度提供適當詳細程度的回答。

**基本要求:**
1. 直接回答問題，不說客套話
2. 使用最新資訊（當前日期：${currentDate}）
3. ${focusInstruction}
4. ${languageInstruction}
5. 確保準確性和實用性

${responseRequirement}

**用戶問題:** ${query}

現在開始回答：`;

    return contextText + promptTemplate;
  }

  // 智能檢測查詢語言
  private detectQueryLanguage(query: string, fallbackLanguage: string): string {
    // 檢測簡體中文特徵字符
    const simplifiedChars = /[国学时间问题电脑软件应该怎么样]/;
    // 檢測繁體中文特徵字符  
    const traditionalChars = /[國學時間問題電腦軟體應該怎麼樣]/;
    
    if (simplifiedChars.test(query)) {
      return 'zh-CN';
    }
    if (traditionalChars.test(query)) {
      return 'zh-TW';
    }
    
    // 檢測是否包含中文字符
    const chineseChars = /[\u4e00-\u9fff]/;
    if (chineseChars.test(query)) {
      // 如果包含中文但無法確定簡繁，使用fallback語言
      return fallbackLanguage.startsWith('zh') ? fallbackLanguage : 'zh-TW';
    }
    
    // 默認使用fallback語言
    return fallbackLanguage;
  }

  // 分析問題複雜度
  private analyzeQueryComplexity(query: string): 'simple' | 'moderate' | 'complex' {
    const lowercaseQuery = query.toLowerCase();
    
    // 簡單問題的關鍵詞
    const simpleKeywords = [
      'what day', 'what time', 'what date', 'when is', 'how much', 'how many',
      '今天', '現在', '幾點', '多少', '什麼時候', '哪天', '今日', '當前'
    ];
    
    // 複雜問題的關鍵詞
    const complexKeywords = [
      'analyze', 'compare', 'explain', 'evaluate', 'discuss', 'pros and cons',
      'advantages', 'disadvantages', 'strategy', 'implementation', 'methodology',
      '分析', '比較', '解釋', '評估', '討論', '優缺點', '優勢', '劣勢', '策略', '實施', '方法論',
      '如何實現', '深入', '詳細', '全面', '綜合'
    ];
    
    // 檢查是否為簡單問題
    if (simpleKeywords.some(keyword => lowercaseQuery.includes(keyword))) {
      return 'simple';
    }
    
    // 檢查是否為複雜問題
    if (complexKeywords.some(keyword => lowercaseQuery.includes(keyword))) {
      return 'complex';
    }
    
    // 根據字數判斷
    const wordCount = query.trim().split(/\s+/).length;
    if (wordCount <= 5) {
      return 'simple';
    } else if (wordCount <= 15) {
      return 'moderate';
    } else {
      return 'complex';
    }
  }

  // 呼叫 API
  private async callAPI(model: string, prompt: string): Promise<string> {
    const payload = {
      model: model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: false
    };

    const response = await fetch(this.API_ENDPOINT, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // 處理不同可能的響應格式
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    } else if (data.content) {
      return data.content;
    } else if (data.response) {
      return data.response;
    } else if (typeof data === 'string') {
      return data;
    }
    
    throw new Error('無效的API響應格式');
  }

  // 格式化搜索結果
  private formatSearchResult(query: string, apiResponse: string, searchTime: number, fetchedSources: SearchSource[]): SearchResult {
    // 使用從網絡獲取的真實來源
    const sources: SearchSource[] = fetchedSources.map(s => ({
      title: s.title,
      url: s.url,
      snippet: s.snippet, // Snippet could be a summary of the content fetched
      content: s.content, // Full content fetched, if available
      hostname: new URL(s.url).hostname.replace(/^www\./, '')
    }));
    
    // 生成相關問題
    const followUpQuestions = this.generateFollowUpQuestions(query, apiResponse);

    return {
      query,
      sources, // Use the actual fetched sources
      answer: apiResponse,
      followUpQuestions,
      searchTime,
      hasResults: true // Assuming if we got an API response, it's a result
    };
  }

  // 生成相關問題
  private generateFollowUpQuestions(query: string, response: string): string[] {
    const questions: string[] = [];
    const queryLower = query.toLowerCase();

    if (queryLower.includes('ai') || queryLower.includes('人工智能')) {
      questions.push(
        "AI技術對香港未來發展的影響？",
        "香港在AI領域的競爭優勢是什麼？",
        "如何在香港學習AI相關技能？"
      );
    } else if (queryLower.includes('金融') || queryLower.includes('投資')) {
      questions.push(
        "香港金融市場的最新趨勢？",
        "投資香港市場需要注意什麼？",
        "香港作為金融中心的優勢？"
      );
    } else if (queryLower.includes('教育')) {
      questions.push(
        "香港教育制度的特色？",
        "如何申請香港的大學？",
        "香港學生升學路徑有哪些？"
      );
    } else {
      questions.push(
        "相關的最新發展趨勢？",
        "這個領域在香港的現狀如何？",
        "未來可能的發展方向？"
      );
    }

    return questions.slice(0, 3); // 返回最多3個問題
  }
}

export const productionSearchService = new ProductionSearchService();
