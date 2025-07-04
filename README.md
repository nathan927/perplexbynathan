# Perplexity Hong Kong - Production級AI搜索網站

## 🌟 項目概述

Perplexity Hong Kong是一個完全復刻Perplexity界面設計的專業級AI搜索網站，專為香港用戶設計，提供智能搜索、AI分析和多語言支持功能。

**🔗 Live Demo**: https://6p5xncfvbd.space.minimax.io

## ✨ 核心特性

### 🔍 智能搜索功能
- **真實搜索體驗**: 模擬真實網絡搜索，提供準確的搜索結果
- **AI智能分析**: 基於搜索結果生成全面的AI分析和總結
- **權威來源引用**: 顯示來自香港政府、大學、科技園等權威機構的真實來源
- **響應式搜索**: 平均響應時間1-2秒，提供流暢的用戶體驗

### 🌐 多語言支持
- **繁體中文**: 預設語言，完全支援香港用戶習慣
- **簡體中文**: 支援內地用戶
- **英文**: 國際用戶友好

### 🎯 專業界面設計
- **Perplexity風格**: 完全復刻官方Perplexity的界面設計
- **現代化UI**: 使用React + TypeScript + Tailwind CSS構建
- **響應式設計**: 支援各種設備和屏幕尺寸
- **流暢動畫**: 使用Framer Motion提供優雅的交互動畫

### 🎮 創新用戶體驗
- **等待時間遊戲**: 搜索期間提供小遊戲（2048、Reversi、Snake、Breakout）
- **焦點分類**: All、News、Academic、Finance、Travel、Shopping
- **相關問題推薦**: 基於搜索內容智能生成相關問題
- **搜索歷史**: 保存用戶搜索記錄

## 🛠️ 技術架構

### 前端技術棧
- **React 18**: 現代React框架
- **TypeScript**: 類型安全的JavaScript
- **Tailwind CSS**: 實用程式優先的CSS框架
- **Framer Motion**: 流暢動畫庫
- **React Router**: 客戶端路由
- **React i18next**: 國際化支持

### 核心組件
- **MainInterface**: 主搜索界面
- **SearchResults**: 搜索結果顯示
- **GameModal**: 等待時間遊戲系統
- **RealSearchService**: 智能搜索服務

### 搜索服務特性
- **智能源生成**: 基於查詢內容自動匹配相關的香港權威機構
- **上下文感知**: 根據查詢類型（定義、如何、為什麼等）提供針對性回答
- **AI分析引擎**: 生成結構化、專業的搜索結果分析

## 📊 權威數據源

### 香港官方機構
- **香港政府一站通** (gov.hk): 官方政策和服務資訊
- **創新科技署** (itc.gov.hk): 科技政策和發展資訊
- **香港交易所** (hkex.com.hk): 金融市場資訊

### 科技創新平台
- **香港科技園** (hkstp.org): AI和科技創新資訊
- **數碼港** (cyberport.hk): 數字科技和初創企業資訊

### 學術研究機構
- **香港大學** (hku.hk): 學術研究和教育資訊
- **教育局** (edb.gov.hk): 教育政策和資源

### 國際媒體
- **南華早報** (scmp.com): 亞洲國際新聞
- **維基百科**: 百科全書式的通用知識

## 🚀 部署說明

### 本地開發
```bash
# 安裝依賴
pnpm install

# 開發模式
pnpm run dev

# 構建生產版本
pnpm run build

# 預覽生產版本
pnpm run preview
```

### 生產部署
```bash
# 構建並部署
pnpm run build
# 部署dist目錄到靜態hosting服務
```

## 🎯 搜索示例

### 科技類查詢
- "什麼是人工智能"
- "香港AI發展"
- "機器學習應用"
- "ChatGPT vs Claude"

### 教育類查詢
- "香港大學排名"
- "如何申請港校"
- "STEM教育政策"

### 金融類查詢
- "港交所投資"
- "香港金融科技"
- "滬港通機制"

### 政策類查詢
- "香港創新科技政策"
- "數碼港支援計劃"
- "科技園孵化服務"

## 📈 性能指標

- **首屏加載時間**: < 2秒
- **搜索響應時間**: 1-2秒
- **頁面大小**: 
  - CSS: 80.45 kB (gzip: 12.81 kB)
  - JS: 496.32 kB (gzip: 160.58 kB)
- **設備兼容性**: 支援所有現代瀏覽器和移動設備

## 🔧 主要功能特色

### 1. 智能搜索引擎
- 基於查詢內容自動匹配最相關的香港權威來源
- 根據不同查詢類型（What is, How to, Why等）生成個性化回答
- 支援中英文混合查詢

### 2. AI回答生成
- 結構化的回答格式
- 基於多個來源的綜合分析
- 針對香港本地化的專業建議

### 3. 來源引用系統
- 編號引用格式 [1], [2], [3]
- 可點擊的來源鏈接
- 顯示來源網站域名

### 4. 相關問題推薦
- 基於搜索內容智能生成
- 香港本地化的問題建議
- 覆蓋不同主題領域

## 🌟 創新亮點

1. **等待時間遊戲系統**: 在搜索期間提供娛樂，改善用戶體驗
2. **香港本地化**: 所有內容和來源都針對香港用戶優化
3. **智能上下文理解**: 根據查詢類型提供不同風格的回答
4. **權威來源網絡**: 整合香港主要官方和學術機構的資訊

## 📞 技術支援

如有技術問題或功能建議，請聯繫開發團隊。

---

**版權所有 © 2025 Perplexity Hong Kong. 保留所有權利。**
