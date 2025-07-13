import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle,
  Clock,
  Code,
  Copy,
  Download,
  FileText,
  Lightbulb,
  MessageCircle,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Settings,
  Trash2,
  Upload,
  User,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
  metadata?: {
    model?: string;
    tokens?: number;
    executionTime?: number;
    workflowGenerated?: boolean;
  };
}

interface LLMModel {
  id: string;
  name: string;
  description: string;
  provider: "local" | "remote";
  status: "available" | "loading" | "error";
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
}

interface Suggestion {
  id: string;
  text: string;
  category: "workflow" | "system" | "file" | "web";
  icon: React.ElementType;
}

export function LLMInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "こんにちは！Floorp OS の AI アシスタントです。何かお手伝いできることはありますか？自然言語でシステム操作、ワークフロー作成、ファイル管理などが可能です。",
      timestamp: new Date(Date.now() - 300000),
      metadata: {
        model: "gemma-2b",
        tokens: 45,
        executionTime: 1.2,
      },
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemma-2b");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] = useState(
    false,
  );
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const models: LLMModel[] = [
    {
      id: "gemma-2b",
      name: "Gemma 2B",
      description: "軽量で高速な日本語対応モデル",
      provider: "local",
      status: "available",
      parameters: { temperature: 0.7, maxTokens: 2048, topP: 0.9 },
    },
    {
      id: "llama-7b",
      name: "Llama 7B",
      description: "高性能な汎用言語モデル",
      provider: "local",
      status: "available",
      parameters: { temperature: 0.8, maxTokens: 4096, topP: 0.95 },
    },
    {
      id: "deepseek-coder",
      name: "DeepSeek Coder",
      description: "コード生成に特化したモデル",
      provider: "local",
      status: "loading",
      parameters: { temperature: 0.2, maxTokens: 8192, topP: 0.9 },
    },
  ];

  const suggestions: Suggestion[] = [
    {
      id: "workflow",
      text: "メールを自動で分類して、重要なものだけ通知する",
      category: "workflow",
      icon: Zap,
    },
    {
      id: "system",
      text: "現在のシステム状態を確認して",
      category: "system",
      icon: Settings,
    },
    {
      id: "file",
      text: "ダウンロードフォルダを整理して",
      category: "file",
      icon: FileText,
    },
    {
      id: "web",
      text: "ニュースサイトから最新情報を収集して",
      category: "web",
      icon: MessageCircle,
    },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    // メッセージ履歴に追加
    setConversationHistory((prev) => [...prev, currentMessage]);

    try {
      // シミュレーション: 実際のLLM API呼び出し
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateSimulatedResponse(currentMessage),
        timestamp: new Date(),
        status: "sent",
        metadata: {
          model: selectedModel,
          tokens: Math.floor(Math.random() * 100) + 50,
          executionTime: Math.random() * 2 + 0.5,
          workflowGenerated: currentMessage.includes("ワークフロー") ||
            currentMessage.includes("自動"),
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "すみません、エラーが発生しました。もう一度試してください。",
        timestamp: new Date(),
        status: "error",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSimulatedResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("ワークフロー") || input.includes("自動")) {
      return "ワークフローを作成しました。以下の手順で実行されます：\n\n1. 指定された条件を監視\n2. 条件が満たされた場合にアクションを実行\n3. 結果を通知\n\nワークフロー管理画面で詳細を確認できます。実行しますか？";
    }

    if (input.includes("システム") || input.includes("状態")) {
      return "システム状態を確認しました：\n\n• CPU使用率: 23%\n• メモリ使用率: 67%\n• ストレージ使用率: 45%\n• 実行中プロセス: 156個\n\nシステムは正常に動作しています。詳細な情報はシステムモニターで確認できます。";
    }

    if (input.includes("ファイル") || input.includes("整理")) {
      return "ファイル整理を開始します：\n\n• ダウンロードフォルダをスキャン\n• ファイル種類別に分類\n• 重複ファイルの検出\n• 古いファイルの確認\n\n整理を実行しますか？";
    }

    if (input.includes("検索") || input.includes("探す")) {
      return "Floorp Search を使用して検索します。ローカルファイルとウェブの両方を検索できます。具体的に何を探しますか？";
    }

    return "承知しました。その操作を実行するためのワークフローを作成できます。より詳細な指示をいただければ、最適な自動化を提案します。";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationHistory([]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setCurrentMessage(suggestion.text);
    textareaRef.current?.focus();
  };

  const currentModel = models.find((m) => m.id === selectedModel);

  return (
    <div className="h-full w-full flex flex-col bg-base-100">
      <div className="flex-1 flex">
        {/* メイン対話エリア */}
        <div className="flex-1 flex flex-col">
          {/* ヘッダー */}
          <div className="bg-base-200 border-b border-base-content/10 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">AI アシスタント</h1>
                  <p className="text-sm text-base-content/70">
                    {currentModel?.name} • {currentModel?.status === "available"
                      ? "利用可能"
                      : "読み込み中"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                >
                  {isVoiceEnabled
                    ? <Volume2 className="w-4 h-4" />
                    : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={clearConversation}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="btn btn-ghost btn-sm">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* メッセージ一覧 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0
              ? (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                  <h3 className="text-xl font-semibold mb-2">
                    AI アシスタントにようこそ
                  </h3>
                  <p className="text-base-content/70 mb-6">
                    自然言語でシステム操作、ワークフロー作成、ファイル管理などが可能です
                  </p>
                </div>
              )
              : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-content" />
                      </div>
                    )}
                    <div
                      className={`max-w-2xl ${
                        message.role === "user" ? "order-first" : ""
                      }`}
                    >
                      <div
                        className={`p-4 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-content ml-12"
                            : "bg-base-200 text-base-content mr-12"
                        }`}
                      >
                        <div className="prose prose-sm max-w-none">
                          {message.content.split("\n").map((line, idx) => (
                            <p key={idx} className="mb-2 last:mb-0">{line}</p>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 px-2">
                        <div className="flex items-center gap-2 text-xs text-base-content/50">
                          <span>
                            {message.timestamp.toLocaleTimeString("ja-JP", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {message.metadata && (
                            <>
                              <span>•</span>
                              <span>{message.metadata.model}</span>
                              {message.metadata.tokens && (
                                <>
                                  <span>•</span>
                                  <span>{message.metadata.tokens} tokens</span>
                                </>
                              )}
                            </>
                          )}
                          {message.status === "error" && (
                            <AlertCircle className="w-3 h-3 text-error" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {message.metadata?.workflowGenerated && (
                            <span className="badge badge-xs badge-success">
                              ワークフロー
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-secondary-content" />
                      </div>
                    )}
                  </div>
                ))
              )}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-content" />
                </div>
                <div className="bg-base-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="loading loading-dots loading-sm"></div>
                    <span className="text-sm text-base-content/70">
                      考え中...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div className="bg-base-200 border-t border-base-content/10 p-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="自然言語でシステム操作、ワークフロー作成、ファイル管理などの指示を入力..."
                  className="textarea textarea-bordered w-full resize-none"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className={`btn btn-circle ${
                    isSpeechRecognitionActive ? "btn-error" : "btn-ghost"
                  }`}
                  onClick={() =>
                    setIsSpeechRecognitionActive(!isSpeechRecognitionActive)}
                >
                  {isSpeechRecognitionActive
                    ? <MicOff className="w-4 h-4" />
                    : <Mic className="w-4 h-4" />}
                </button>
                <button
                  className="btn btn-primary btn-circle"
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="w-80 bg-base-200 border-l border-base-content/10 p-4 space-y-6">
          {/* モデル選択 */}
          <div>
            <h3 className="font-semibold mb-3">言語モデル</h3>
            <select
              className="select select-bordered w-full"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
            {currentModel && (
              <div className="mt-2 text-sm text-base-content/70">
                {currentModel.description}
              </div>
            )}
          </div>

          {/* 提案 */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              提案
            </h3>
            <div className="space-y-2">
              {suggestions.map((suggestion) => {
                const IconComponent = suggestion.icon;
                return (
                  <button
                    key={suggestion.id}
                    className="w-full p-3 bg-base-100 rounded-lg text-left hover:bg-base-300 transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="w-4 h-4 text-primary" />
                      <span className="text-xs uppercase tracking-wide text-base-content/50">
                        {suggestion.category}
                      </span>
                    </div>
                    <p className="text-sm">{suggestion.text}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 履歴 */}
          {conversationHistory.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                最近の質問
              </h3>
              <div className="space-y-1">
                {conversationHistory.slice(-5).map((query, idx) => (
                  <button
                    key={idx}
                    className="w-full p-2 bg-base-100 rounded text-left hover:bg-base-300 transition-colors"
                    onClick={() => setCurrentMessage(query)}
                  >
                    <p className="text-sm truncate">{query}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
