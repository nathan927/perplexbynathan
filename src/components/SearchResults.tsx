import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Copy, Share2, BookmarkPlus, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { type SearchResult } from '../services/realSearchService';

interface SearchResultsProps {
  result: SearchResult;
  onNewSearch: (query: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ result, onNewSearch }) => {
  const { t } = useTranslation();

  const formatTime = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const shareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: `Perplexity Hong Kong - ${result.query}`,
        text: result.answer,
        url: window.location.href
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* 查詢標題和操作 */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {result.query}
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(result.searchTime)}
            </div>
            <Badge variant="secondary">
              {result.sources.length} {t('sources')}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(result.answer)}
            className="text-slate-400 hover:text-white"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={shareResult}
            className="text-slate-400 hover:text-white"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <BookmarkPlus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI回答 */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <CardContent className="p-6">
          <div className="prose prose-gray dark:prose-invert max-w-none prose-lg">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // 自定義樣式元件
                h1: ({node, ...props}) => (
                  <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100" {...props} />
                ),
                h2: ({node, ...props}) => (
                  <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100" {...props} />
                ),
                h3: ({node, ...props}) => (
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100" {...props} />
                ),
                p: ({node, ...props}) => (
                  <p className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200" {...props} />
                ),
                ul: ({node, ...props}) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-gray-800 dark:text-gray-200" {...props} />
                ),
                ol: ({node, ...props}) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-800 dark:text-gray-200" {...props} />
                ),
                li: ({node, ...props}) => (
                  <li className="mb-1 text-gray-800 dark:text-gray-200" {...props} />
                ),
                strong: ({node, ...props}) => (
                  <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />
                ),
                em: ({node, ...props}) => (
                  <em className="italic text-gray-800 dark:text-gray-200" {...props} />
                ),
                code: ({node, ...props}) => (
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100" {...props} />
                ),
                pre: ({node, ...props}) => (
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
                ),
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-700 dark:text-gray-300" {...props} />
                ),
                a: ({node, ...props}) => (
                  <a className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline" {...props} />
                ),
              }}
            >
              {result.answer}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* 來源 */}
      {result.sources.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('sources')}
          </h2>
          <div className="grid gap-4">
            {result.sources.map((source, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          <a 
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            {source.title}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </CardTitle>
                        <p className="text-sm text-slate-400 mt-1">{source.hostname}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {index + 1}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {source.snippet}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 相關問題 */}
      {result.followUpQuestions.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('relatedQuestions')}
          </h2>
          <div className="grid gap-3">
            {result.followUpQuestions.map((question, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => onNewSearch(question)}
                >
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {question}
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
