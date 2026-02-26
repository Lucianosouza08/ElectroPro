import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { gemini } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../utils';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const stream = await gemini.streamChat(userMessage, history);
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', content: "" }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text || "";
        fullResponse += chunkText;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'model') {
            return [...prev.slice(0, -1), { role: 'model', content: fullResponse }];
          }
          return prev;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Desculpe, ocorreu um erro ao processar sua solicitação. Verifique sua conexão ou tente novamente mais tarde." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-500" />
            Assistente IA
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">Tire dúvidas técnicas e peça ajuda com cálculos e normas.</p>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={clearChat}
            className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
            title="Limpar conversa"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 no-scrollbar pb-8">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Bot className="w-12 h-12 text-zinc-300" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Como posso ajudar hoje?</p>
              <p className="text-xs text-zinc-500">Ex: "Como dimensionar um cabo para 50A em 220V?"</p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4",
                m.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                m.role === 'user' ? "bg-zinc-900 text-white" : "bg-amber-100 text-amber-600"
              )}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                m.role === 'user' 
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-tr-none" 
                  : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-tl-none shadow-sm"
              )}>
                <div className="markdown-body">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-lg">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua dúvida técnica..."
            className="flex-1 bg-transparent border-none outline-none text-sm dark:text-white"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-2 rounded-lg transition-all",
              input.trim() && !isLoading 
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" 
                : "text-zinc-300"
            )}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
