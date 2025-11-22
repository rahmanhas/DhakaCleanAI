import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, MapPin } from 'lucide-react';
import { chatWithBot, findNearbyCollectionPoints } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your Dhaka Eco-Assistant. Ask me about waste separation, collection schedules, or where to drop off recyclables!', timestamp: Date.now() }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Check if user is asking for location (simple heuristic)
    const lowerInput = userMsg.text.toLowerCase();
    const isLocationQuery = lowerInput.includes('where') || lowerInput.includes('nearby') || lowerInput.includes('location') || lowerInput.includes('center') || lowerInput.includes('bin');

    let responseText = "";

    if (isLocationQuery) {
        // Attempt to get geolocation
        let lat, lng;
        try {
             const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                 navigator.geolocation.getCurrentPosition(resolve, reject, {timeout: 5000});
             });
             lat = position.coords.latitude;
             lng = position.coords.longitude;
        } catch (e) {
            // Continue without location if permission denied or error
            console.log("Location access denied or failed, proceeding with text search.");
        }
        
        const mapResult = await findNearbyCollectionPoints(userMsg.text, lat, lng);
        responseText = mapResult.text;
        
        // If we have grounding chunks (URLs), append them nicely
        if (mapResult.chunks && mapResult.chunks.length > 0) {
             const links = mapResult.chunks
                .map((c: any) => {
                    if (c.web?.uri) return `• [${c.web.title || 'Link'}](${c.web.uri})`;
                    if (c.maps?.uri) return `• [${c.maps.title || 'Map Location'}](${c.maps.uri})`;
                    return '';
                })
                .filter((s: string) => s !== '')
                .join('\n');
             if (links) responseText += `\n\nSources:\n${links}`;
        }

    } else {
        // Standard Chat
        // Transform messages for Gemini History
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));
        responseText = await chatWithBot(history, userMsg.text);
    }

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to render markdown-ish links from text
  const renderText = (text: string) => {
      // Simple link parser
      const parts = text.split(/(\[.*?\]\(.*?\))/g);
      return parts.map((part, i) => {
          const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
          if (linkMatch) {
              return <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" className="text-emerald-600 underline hover:text-emerald-800 font-medium">{linkMatch[1]}</a>
          }
          return part;
      });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b px-6 py-4 shadow-sm flex justify-between items-center">
        <div>
            <h2 className="text-lg font-bold text-slate-800">Eco-Assistant</h2>
            <p className="text-xs text-slate-500">Ask about rules, bins, or locations</p>
        </div>
        <div className="bg-emerald-100 p-2 rounded-full">
            <Bot size={20} className="text-emerald-600" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              
              <div
                className={`p-4 rounded-2xl shadow-sm whitespace-pre-wrap text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}
              >
                {renderText(msg.text)}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start w-full">
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 ml-11">
              <Loader2 className="animate-spin text-emerald-600" size={16} />
              <span className="text-xs text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a question..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;