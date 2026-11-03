import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  MessageCircle,
  Compass,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { generateRuleBasedConciergeReply } from '../concierge/conciergeEngine';
import { getWhatsAppUrl, WHATSAPP_NUMBER } from '../data/seedData';

const QUICK_PROMPTS = [
  'Match me with a guide',
  'Gorilla permit prices',
  'Plan a 7-day safari',
  'Talk to a human on WhatsApp',
];

export const ConciergeWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Oli otya! I am the Enganda AI Concierge ("Guide Matcher"). At Enganda Safaris, the guide is the product — tell me what you want to see in Uganda (mountain gorillas, Kibale chimpanzees, the Shoebill at Mabamba, or Kidepo lions) and I will match you with a named Ugandan guide and verified UWA permit tariffs.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: 'asst_' + Date.now(),
            role: 'assistant',
            content: data.reply,
            toolCalls: data.toolCalls,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        throw new Error('Fallback to local concierge engine');
      }
    } catch {
      const fallback = generateRuleBasedConciergeReply(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: 'asst_' + Date.now(),
          role: 'assistant',
          content: fallback.reply,
          toolCalls: fallback.toolCalls,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Enganda Guide Matcher AI Concierge"
        className="fixed bottom-4 right-4 sm:right-6 z-40 inline-flex items-center gap-2 bg-[#226B3E] hover:bg-[#194E2D] text-[#FAF7F2] px-4 py-3 rounded-md shadow-xl border border-[#D99B26]/50 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-[#D99B26]" />
        <span>{isOpen ? 'Close Guide Matcher' : 'Ask Guide Matcher AI'}</span>
      </button>

      {/* Concierge Drawer / Panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[78vh] bg-[#FAF7F2] border border-[#E4DCCF] rounded-lg shadow-2xl flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Enganda Guide Matcher AI Concierge"
        >
          {/* Header */}
          <div className="bg-[#226B3E] text-[#FAF7F2] p-4 flex items-center justify-between border-b border-[#2E8550]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-md bg-[#1B5632] border border-[#D99B26]/40 flex items-center justify-center text-[#D99B26]">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif text-lg font-bold leading-none text-white">
                    Enganda Guide Matcher
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#D99B26]/20 text-[#D99B26]">
                    AI Concierge
                  </span>
                </div>
                <p className="text-[11px] text-[#D6CEC2] mt-0.5">
                  Matches Ugandan guides & verified UWA permit tariffs
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md text-[#D6CEC2] hover:text-white hover:bg-[#1B5632]"
              aria-label="Close concierge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF7F2]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-[#C85A28] text-white'
                      : 'bg-white border border-[#E4DCCF] text-[#1A1612]'
                  }`}
                >
                  {m.content}
                </div>

                {m.toolCalls && m.toolCalls.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.toolCalls.map((tc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[10px] font-mono bg-[#F3ECE1] text-[#226B3E] border border-[#E4DCCF] px-2 py-0.5 rounded"
                      >
                        <UserCheck className="w-3 h-3 text-[#C85A28]" />
                        <span>Verified tool: {tc.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="bg-white border border-[#E4DCCF] rounded-lg px-3.5 py-2.5 text-xs text-[#5A5248] inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C85A28] animate-spin" />
                <span>Consulting Enganda guide profiles & UWA permit schedule...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-[#F3ECE1] border-t border-[#E4DCCF] flex items-center gap-1.5 overflow-x-auto">
            {QUICK_PROMPTS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => sendMessage(chip)}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-[#226B3E] hover:text-white text-[#1A1612] border border-[#E4DCCF] text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-[#E4DCCF] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about guides, Bwindi permits, or a 7-day plan..."
              className="flex-1 bg-[#FAF7F2] border border-[#E4DCCF] rounded-md px-3 py-2 text-xs sm:text-sm text-[#1A1612] focus:outline-none focus:border-[#226B3E]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-md bg-[#C85A28] hover:bg-[#B04B1D] text-white disabled:opacity-40 transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer WhatsApp Handoff Strip */}
          <div className="px-3 py-2 bg-[#1B5632] text-[#D6CEC2] text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>12-hr Entebbe human confirmation</span>
            </span>
            <a
              href={getWhatsAppUrl('Oli otya! I was chatting with the Enganda Guide Matcher and would like to speak with a coordinator.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D99B26] hover:underline font-medium inline-flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp {WHATSAPP_NUMBER}</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
};
