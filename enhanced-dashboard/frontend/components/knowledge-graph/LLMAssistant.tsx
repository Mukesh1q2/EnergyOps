"""
LLM Assistant Component
Phase 4: Visual Knowledge Graphs & AI Integration

Conversational interface for natural language queries about knowledge graphs
Features:
- Natural language query interface
- Query intent detection
- Real-time responses
- Query history
- Context management
- Source citation
"""

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Brain, 
  Search, 
  Filter,
  BookOpen,
  ExternalLink,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Star,
  Copy,
  Download,
  RefreshCw,
  Settings,
  HelpCircle,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LLMSession {
  id: string;
  graphId: string;
  sessionName?: string;
  messageCount: number;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
}

interface LLMQuery {
  id: string;
  sessionId: string;
  queryText: string;
  queryIntent?: string;
  queryEntities?: string[];
  responseText?: string;
  responseSources?: string[];
  responseConfidence: number;
  executionTimeMs?: number;
  tokensInput: number;
  tokensOutput: number;
  operationsPerformed?: string[];
  nodesAffected?: string[];
  edgesAffected?: string[];
  helpfulnessScore?: number;
  accuracyScore?: number;
  completenessScore?: number;
  createdAt: string;
}

interface LLMSuggestion {
  id: string;
  title: string;
  description: string;
  query: string;
  category: 'search' | 'analyze' | 'explain' | 'recommend';
  icon: React.ComponentType<{ className?: string }>;
}

interface LLMAssistantProps {
  graphId: string;
  onQuerySubmit?: (query: string, intent?: string) => void;
  onNodeSelect?: (nodeId: string) => void;
  onEdgeSelect?: (edgeId: string) => void;
  className?: string;
  readonly?: boolean;
  showSuggestions?: boolean;
  showHistory?: boolean;
  showMetrics?: boolean;
  maxHistoryItems?: number;
}

const LLMAssistant: React.FC<LLMAssistantProps> = ({
  graphId,
  onQuerySubmit,
  onNodeSelect,
  onEdgeSelect,
  className,
  readonly = false,
  showSuggestions = true,
  showHistory = true,
  showMetrics = true,
  maxHistoryItems = 50
}) => {
  // State management
  const [currentSession, setCurrentSession] = useState<LLMSession | null>(null);
  const [queryHistory, setQueryHistory] = useState<LLMQuery[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<LLMSession[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [modelSettings, setModelSettings] = useState({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: 'You are an AI assistant specialized in knowledge graphs and data analysis.'
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Predefined query suggestions
  const querySuggestions: LLMSuggestion[] = [
    {
      id: '1',
      title: 'Find Central Nodes',
      description: 'Identify the most important nodes in the network',
      query: 'Show me the most central nodes in this knowledge graph',
      category: 'analyze',
      icon: Target
    },
    {
      id: '2',
      title: 'Community Detection',
      description: 'Discover clusters and communities in the graph',
      query: 'What communities or clusters can you identify in this graph?',
      category: 'analyze',
      icon: TrendingUp
    },
    {
      id: '3',
      title: 'Path Analysis',
      description: 'Find shortest paths between nodes',
      query: 'What is the relationship path between node A and node B?',
      category: 'explain',
      icon: Search
    },
    {
      id: '4',
      title: 'Pattern Detection',
      description: 'Identify recurring patterns and structures',
      query: 'What patterns do you see in the relationships and connections?',
      category: 'analyze',
      icon: Zap
    },
    {
      id: '5',
      title: 'Node Information',
      description: 'Get detailed information about specific nodes',
      query: 'Tell me about [specific node type or name]',
      category: 'explain',
      icon: BookOpen
    },
    {
      id: '6',
      title: 'Recommendations',
      description: 'Get recommendations for graph improvements',
      query: 'How can I improve or expand this knowledge graph?',
      category: 'recommend',
      icon: CheckCircle
    }
  ];

  // Intent detection patterns
  const intentPatterns = {
    search: /(search|find|look|discover|identify)\b/i,
    analyze: /(analyze|analyse|examine|study|investigate|assess|evaluate|detect)\b/i,
    explain: /(explain|describe|tell|show|how|what|why|when|where)\b/i,
    recommend: /(recommend|suggest|advise|improve|optimize|enhance|expand)\b/i
  };

  // Initialize session on component mount
  useEffect(() => {
    initializeSession();
  }, [graphId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queryHistory, isTyping]);

  // Auto-focus input when not loading
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create new session or load existing one
      const sessionResponse = await fetch(`/api/graphs/${graphId}/llm/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionName: `Session ${new Date().toLocaleString()}`,
          systemPrompt: modelSettings.systemPrompt,
          modelName: modelSettings.model
        })
      });

      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        setCurrentSession(session);
        
        // Load query history
        const historyResponse = await fetch(
          `/api/graphs/${graphId}/llm/sessions/${session.id}/history`
        );
        
        if (historyResponse.ok) {
          const history = await historyResponse.json();
          setQueryHistory(history.slice(-maxHistoryItems));
        }
      }
    } catch (err) {
      setError('Failed to initialize LLM session');
      console.error('Session initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const detectIntent = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (intentPatterns.search.test(lowerQuery)) return 'search';
    if (intentPatterns.analyze.test(lowerQuery)) return 'analyze';
    if (intentPatterns.recommend.test(lowerQuery)) return 'recommend';
    if (intentPatterns.explain.test(lowerQuery)) return 'explain';
    
    return 'general';
  };

  const extractEntities = (query: string): string[] => {
    // Simple entity extraction - in production, use NER models
    const entities: string[] = [];
    const words = query.split(/\s+/);
    
    // Look for quoted strings (likely entity names)
    const quotedMatches = query.match(/["']([^"']+)["']/g);
    if (quotedMatches) {
      entities.push(...quotedMatches.map(match => match.replace(/["']/g, '')));
    }
    
    // Look for node type keywords
    const nodeTypes = ['person', 'organization', 'energy', 'asset', 'transaction', 'location', 'regulation'];
    words.forEach(word => {
      if (nodeTypes.includes(word.toLowerCase())) {
        entities.push(word.toLowerCase());
      }
    });
    
    return [...new Set(entities)];
  };

  const submitQuery = async (queryText?: string) => {
    const text = queryText || currentQuery.trim();
    if (!text || !currentSession || isLoading) return;

    setIsLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      const intent = detectIntent(text);
      const entities = extractEntities(text);

      // Add user message to history
      const userQuery: LLMQuery = {
        id: `temp-${Date.now()}`,
        sessionId: currentSession.id,
        queryText: text,
        queryIntent: intent,
        queryEntities: entities,
        responseText: undefined,
        responseConfidence: 0,
        tokensInput: 0,
        tokensOutput: 0,
        createdAt: new Date().toISOString()
      };

      setQueryHistory(prev => [...prev, userQuery]);
      setCurrentQuery('');

      // Submit to API
      const response = await fetch(`/api/graphs/${graphId}/llm/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: currentSession.id,
          query_text: text,
          query_intent: intent,
          query_entities: entities
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Replace temporary query with actual response
        setQueryHistory(prev => 
          prev.map(q => q.id === userQuery.id ? result : q)
        );

        // Simulate typing effect for AI response
        setTimeout(() => {
          setIsTyping(false);
        }, 500);

        // Callback for external integration
        onQuerySubmit?.(text, intent);

        // Handle operations performed (node/edge selection)
        if (result.operations_performed?.length > 0) {
          result.operations_performed.forEach((op: string) => {
            if (op.includes('node_')) {
              const nodeId = op.split('node_')[1];
              onNodeSelect?.(nodeId);
            } else if (op.includes('edge_')) {
              const edgeId = op.split('edge_')[1];
              onEdgeSelect?.(edgeId);
            }
          });
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError('Failed to process query. Please try again.');
      console.error('Query submission error:', err);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitQuery();
    }
  };

  const rateQuery = async (queryId: string, score: 'helpful' | 'not_helpful', metric: 'helpfulness' | 'accuracy' | 'completeness') => {
    try {
      await fetch(`/api/graphs/${graphId}/llm/queries/${queryId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [metric]: score === 'helpful' ? 5 : 1
        })
      });

      // Update local state
      setQueryHistory(prev => 
        prev.map(q => 
          q.id === queryId 
            ? { 
                ...q, 
                helpfulnessScore: score === 'helpful' ? 5 : 1,
                accuracyScore: score === 'helpful' ? 5 : 1,
                completenessScore: score === 'helpful' ? 5 : 1
              }
            : q
        )
      );
    } catch (err) {
      console.error('Failed to rate query:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderQueryMessage = (query: LLMQuery, isUser: boolean) => (
    <div key={query.id} className={cn(
      "flex gap-3 mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-blue-100 text-blue-700">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "max-w-[80%] space-y-2",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-2 text-sm",
          isUser 
            ? "bg-blue-600 text-white" 
            : "bg-gray-100 text-gray-900 border"
        )}>
          {isUser ? (
            <div>{query.queryText}</div>
          ) : (
            <div className="space-y-2">
              <div>{query.responseText}</div>
              
              {/* Response metadata */}
              {query.responseSources && query.responseSources.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Sources:</div>
                  {query.responseSources.map((source, idx) => (
                    <div key={idx} className="text-xs text-gray-500 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {source}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Response metrics */}
              {query.responseConfidence && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Brain className="w-3 h-3" />
                    <span>Confidence: {Math.round(query.responseConfidence * 100)}%</span>
                    {query.executionTimeMs && (
                      <Clock className="w-3 h-3 ml-2" />
                    )}
                    {query.executionTimeMs && (
                      <span>{query.executionTimeMs}ms</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Query metadata */}
        {!isUser && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {query.queryIntent && (
              <Badge variant="outline" className="text-xs">
                {query.queryIntent}
              </Badge>
            )}
            <span>{new Date(query.createdAt).toLocaleTimeString()}</span>
            
            {/* Rating buttons */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => rateQuery(query.id, 'helpful', 'helpfulness')}
                title="Helpful"
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => rateQuery(query.id, 'not_helpful', 'helpfulness')}
                title="Not helpful"
              >
                <ThumbsDown className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(query.responseText || '')}
                title="Copy response"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-gray-100 text-gray-700">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );

  const renderTypingIndicator = () => (
    <div className="flex gap-3 mb-4 justify-start">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-blue-100 text-blue-700">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-gray-100 rounded-lg px-4 py-2">
        <div className="flex items-center gap-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-xs text-gray-500 ml-2">AI is thinking...</span>
        </div>
      </div>
    </div>
  );

  const renderQuerySuggestions = () => (
    <div className="p-4 bg-gray-50 rounded-lg mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <HelpCircle className="w-4 h-4" />
        Suggested Queries
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {querySuggestions.map(suggestion => {
          const IconComponent = suggestion.icon;
          return (
            <Button
              key={suggestion.id}
              variant="ghost"
              className="justify-start h-auto p-3 text-left"
              onClick={() => setCurrentQuery(suggestion.query)}
            >
              <IconComponent className="w-4 h-4 mr-2 text-gray-500" />
              <div>
                <div className="font-medium text-sm">{suggestion.title}</div>
                <div className="text-xs text-gray-500">{suggestion.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={cn("llm-assistant flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">AI Assistant</h2>
          </div>
          {currentSession && (
            <Badge variant="outline" className="text-xs">
              Session: {currentSession.messageCount} messages
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showMetrics && queryHistory.length > 0 && (
            <div className="text-xs text-gray-500">
              Avg confidence: {
                Math.round(
                  (queryHistory
                    .filter(q => q.responseConfidence)
                    .reduce((sum, q) => sum + q.responseConfidence, 0) /
                  Math.max(1, queryHistory.filter(q => q.responseConfidence).length)) * 100
                )
              }%
            </div>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Assistant Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Model</label>
              <select 
                className="w-full text-sm border rounded px-2 py-1"
                value={modelSettings.model}
                onChange={(e) => setModelSettings(prev => ({ ...prev, model: e.target.value }))}
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Temperature</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={modelSettings.temperature}
                onChange={(e) => setModelSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {queryHistory.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to the AI Assistant
            </h3>
            <p className="text-sm mb-4">
              Ask questions about your knowledge graph in natural language.
            </p>
            {showSuggestions && renderQuerySuggestions()}
          </div>
        )}

        <div className="space-y-4">
          {queryHistory.map(query => renderQueryMessage(query, query.id.startsWith('temp-')))}
          {isTyping && renderTypingIndicator()}
        </div>
        
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your knowledge graph..."
            disabled={isLoading || readonly}
            className="flex-1"
          />
          <Button
            onClick={() => submitQuery()}
            disabled={!currentQuery.trim() || isLoading || readonly}
            size="sm"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {currentQuery.length > 0 && (
            <span>{currentQuery.length} characters</span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {queryHistory.length > 0 && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQueryHistory([])}
            >
              Clear History
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const historyText = queryHistory
                  .map(q => `Q: ${q.queryText}\nA: ${q.responseText || 'No response'}`)
                  .join('\n\n');
                copyToClipboard(historyText);
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              Export History
            </Button>
            {currentSession && (
              <Button
                size="sm"
                variant="outline"
                onClick={initializeSession}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                New Session
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMAssistant;