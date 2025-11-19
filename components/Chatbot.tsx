
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SendIcon } from './icons/Icons';
import tinycolor from 'tinycolor2';

interface ChatbotProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ history, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [history, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="w-full max-w-2xl h-full flex flex-col bg-white border border-gray-200 shadow-xl overflow-hidden rounded-lg">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-center text-gray-800">Color AI Assistant</h2>
        <p className="text-xs text-center text-gray-500">Ask for a specific mood, theme, or object.</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
        <div className="flex flex-col gap-4">
          {history.length === 0 && (
              <div className="text-center text-gray-400 mt-10 text-sm">
                  <p>Try asking:</p>
                  <p className="mt-2">"Sunset over the ocean"</p>
                  <p>"Cyberpunk city vibes"</p>
                  <p>"Professional colors for a law firm"</p>
              </div>
          )}
          {history.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-[#1982c4] text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="max-w-xs md:max-w-md px-4 py-3 bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-none shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a palette..."
            className="flex-grow bg-gray-50 border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1982c4] focus:border-[#1982c4] transition-all shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 flex items-center justify-center bg-[#1982c4] text-white font-semibold rounded-lg shadow-md hover:bg-[#156fba] disabled:bg-gray-300 disabled:cursor-not-allowed transform active:scale-95 transition-all duration-200"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
