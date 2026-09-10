import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, MessageCircle, Bot, User, ArrowRight, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { ChatMessage, LanguageCode, Currency } from '../types';
import { trackEvent } from '../lib/analytics';
import { formatPrice } from '../lib/currency';

interface TingaAssistantWidgetProps {
  currentLanguage: LanguageCode;
  currentCurrency: Currency;
}

export const TingaAssistantWidget: React.FC<TingaAssistantWidgetProps> = ({
  currentLanguage,
  currentCurrency,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolCall, setActiveToolCall] = useState<string | null>(null);
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Initial welcome greeting tailored to language
  useEffect(() => {
    if (messages.length === 0) {
      let greeting = 'Jambo! I am Tinga Assistant, Akim’s AI safari concierge at Tinga Tinga Safari (Arusha, Tanzania). How may I assist your East African journey today?';
      if (currentLanguage === 'fr') {
        greeting = 'Jambo! Je suis Tinga Assistant, l’assistant IA d’Akim chez Tinga Tinga Safari à Arusha. Comment puis-je vous aider à concevoir votre safari sur-mesure ?';
      } else if (currentLanguage === 'de') {
        greeting = 'Jambo! Ich bin Tinga Assistant, Akims KI-Safari-Concierge bei Tinga Tinga Safari in Arusha. Wie kann ich Ihnen bei Ihrer Ostafrika-Reiseplanung behilflich sein?';
      } else if (currentLanguage === 'es') {
        greeting = '¡Jambo! Soy Tinga Assistant, el concierge de IA de Akim en Tinga Tinga Safari (Arusha). ¿Cómo puedo ayudarte a diseñar tu safari hoy?';
      } else if (currentLanguage === 'it') {
        greeting = 'Jambo! Sono Tinga Assistant, il concierge IA di Akim presso Tinga Tinga Safari ad Arusha. Come posso aiutarti a pianificare il tuo viaggio?';
      }

      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: greeting,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [currentLanguage]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);
    setIsLoading(true);

    trackEvent('waba_conversation_started', {
      channel: 'web_widget',
      snippet: userText.substring(0, 50),
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userText,
          language: currentLanguage,
          history: updatedHistory.slice(-8), // Keep recent context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach safari brain');
      }

      const data = await response.json();

      if (data.toolCall) {
        setActiveToolCall(data.toolCall.name);
      }

      const assistantMsg: ChatMessage = {
        id: 'msg_asst_' + Date.now(),
        role: 'assistant',
        content: data.reply || 'I am looking into our circuits and official park permit data right now.',
        toolCalls: data.toolCalls,
        timestamp: new Date().toISOString(),
      };

      setMessages([...updatedHistory, assistantMsg]);
    } catch (err) {
      // Fallback graceful concierge response
      const fallbackMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: 'I apologize for the slight delay. Our Arusha office connectivity is refreshing. You can also chat immediately with founder Akim on WhatsApp at +255 784 123 456!',
        timestamp: new Date().toISOString(),
      };
      setMessages([...updatedHistory, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setActiveToolCall(null);
    }
  };

  // Generate WhatsApp deep-link with conversation context
  const getWhatsAppContextLink = () => {
    const lastUserQuery = messages.filter((m) => m.role === 'user').pop()?.content || 'East African Safari Inquiry';
    const text = encodeURIComponent(
      `Hello Akim! I was chatting with Tinga Assistant on your website about: "${lastUserQuery.substring(0, 120)}...". I would love to continue with you directly.`
    );
    return `https://wa.me/255784123456?text=${text}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            trackEvent('waba_conversation_started', { trigger: 'widget_opened' });
          }}
          className="group relative flex items-center space-x-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold px-4 py-3 rounded-full shadow-2xl shadow-amber-900/50 hover:shadow-amber-900/80 transition-all duration-300 transform hover:scale-105 border border-amber-400/40"
        >
          <div className="w-8 h-8 rounded-full bg-stone-950 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="text-left pr-1 hidden sm:block">
            <div className="text-xs font-black tracking-wide leading-none text-stone-950">Tinga Assistant</div>
            <div className="text-[10px] text-stone-900 font-medium leading-none mt-1">Ask Akim's AI Concierge</div>
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-stone-900"></span>
        </button>
      )}

      {/* Chat Popover Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[410px] h-[580px] bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-sm font-bold text-white leading-none">Tinga Assistant</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                    AI Concierge
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Headquartered in Arusha (P.O. Box 2751)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <a
                href={getWhatsAppContextLink()}
                target="_blank"
                rel="noopener noreferrer"
                title="Continue on WhatsApp with Akim"
                className="p-2 rounded-lg text-emerald-400 hover:bg-stone-800 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Trust strip */}
          <div className="bg-stone-950/70 px-4 py-1.5 border-b border-stone-800/60 text-[10px] text-stone-400 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Quotes in price bands • Permit receipt guarantee</span>
            </span>
            <span className="text-emerald-400 font-medium">Akim on WhatsApp 24/7</span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-900/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser ? 'bg-amber-600 text-stone-950' : 'bg-stone-800 text-amber-400 border border-stone-700'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-amber-600 text-stone-950 font-medium rounded-tr-none'
                      : 'bg-stone-800 text-stone-200 border border-stone-700/80 rounded-tl-none shadow-md'
                  }`}>
                    {msg.content}

                    {/* Tool execution preview pills */}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-stone-700/80 space-y-1">
                        {msg.toolCalls.map((tc, idx) => (
                          <div key={idx} className="text-[10px] text-amber-300 font-mono bg-stone-900/60 px-2 py-0.5 rounded">
                            ⚡ Tool: {tc.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-stone-400 bg-stone-800/40 p-3 rounded-xl border border-stone-800 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>{activeToolCall ? `Invoking ${activeToolCall}...` : 'Consulting safari itineraries & permit data...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          <div className="px-4 py-2 bg-stone-950/90 border-t border-stone-800 flex items-center space-x-2 overflow-x-auto text-[11px] text-stone-300 no-scrollbar">
            <button
              onClick={() => {
                setInputValue('Tell me about the $800 Uganda vs $1500 Rwanda gorilla permits.');
              }}
              className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 whitespace-nowrap border border-stone-700"
            >
              🦍 Gorilla Permits ($800 vs $1,500)
            </button>
            <button
              onClick={() => {
                setInputValue('Can you recommend a 10-day cross-border safari from Serengeti to Bwindi?');
              }}
              className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 whitespace-nowrap border border-stone-700"
            >
              🦁 Serengeti to Bwindi circuit
            </button>
            <button
              onClick={() => {
                setInputValue('What are your named ground partners in Uganda and Kenya?');
              }}
              className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 whitespace-nowrap border border-stone-700"
            >
              🛡️ Named Ground Partners
            </button>
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-stone-950 border-t border-stone-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about circuits, migration dates, permits..."
              className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Deep link bottom CTA */}
          <div className="bg-emerald-950/40 px-4 py-2 border-t border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-300">
            <span>Prefer WhatsApp?</span>
            <a
              href={getWhatsAppContextLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline flex items-center space-x-1 hover:text-emerald-200"
            >
              <span>Continue with Akim</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
