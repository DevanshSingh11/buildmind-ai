import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { sendDailyAssistantMessage } from '../services/api';

const QUICK_PROMPTS = [
  'Draft a 5-minute toolbox talk on working near crane swing radii and overhead power lines.',
  'Summarize today’s site log: 40 cubic yards poured at Level 4, 3 delivery trucks delayed, 1 minor first aid incident.',
  'Generate an MEP subcontractor punch list for second-fix rough-in inspection.',
  'What are the mandatory inspection checkpoints before casting a concrete transfer slab?',
];

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content:
      'Hello Site Team! I am your Construction Daily Assistant. I can help synthesize daily shift logs, prepare safety toolbox talks, coordinate trade schedules, review inspection checklists, or calculate material requirements. How can I assist your site operations today?',
    timestamp: '08:00 AM',
  },
];

export default function DailyAssistant() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const response = await sendDailyAssistantMessage(text, newHistory);
      const assistantReply = {
        role: 'assistant',
        content:
          typeof response === 'string'
            ? response
            : response.reply || response.response || response.message || JSON.stringify(response),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantReply]);
    } catch (err) {
      console.warn('Daily assistant API call failed:', err);
      setError(err.message || 'Unable to connect to assistant service.');
      // Add a fallback simulation response for demo continuity
      const fallbackReply = {
        role: 'assistant',
        content: `[Demo Mode Reply] Regarding "${text}":\n\n1. Ensure all trade leads confirm personnel headcounts on the morning sign-in log.\n2. Verify that high-visibility PPE and hard hats are mandatory across the perimeter.\n3. Keep emergency egress paths unencumbered from material staging.\n\n(Note: Connect backend on port 8000 for live AI model inference)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* 1. Title + Description */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center text-xl shrink-0">
              📝
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Site Daily Assistant & Copilot
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Conversational assistant for daily site briefings, subcontractor coordination, toolbox talks, and incident reports.
              </p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
          >
            Clear Conversation
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">
          Quick Operational Inquiries:
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs text-left px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 text-slate-700 transition-colors shadow-2xs"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Stream Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs ${
                    isUser
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-900 text-amber-400 border border-slate-800'
                  }`}
                >
                  {isUser ? '👷' : '🤖'}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-white rounded-tr-none shadow-xs'
                      : 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/60'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-[10px] mt-1.5 font-mono ${
                      isUser ? 'text-amber-100 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center text-sm border border-slate-800 shrink-0">
                🤖
              </div>
              <div className="bg-slate-100 text-slate-600 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2 border border-slate-200/60">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                <span className="text-slate-500 font-mono ml-1">Assistant formulating guidance...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Error notification banner if any */}
        {error && (
          <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <span>Notice: {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-rose-900 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2 & 3. Input Section & Submit Button */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about daily site logs, trade coordination, or safety rules..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-2xs"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className={`px-5 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-md shrink-0 flex items-center gap-1.5 ${
                loading || !inputText.trim()
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-cyan-500/20 active:scale-[0.98]'
              }`}
            >
              <span>Send</span>
              <span>🚀</span>
            </button>
          </form>
          <div className="mt-2 text-center text-[11px] text-slate-400 font-mono">
            Press Enter to send • Built for site superintendents, foremen, and project engineers
          </div>
        </div>
      </div>
    </div>
  );
}
