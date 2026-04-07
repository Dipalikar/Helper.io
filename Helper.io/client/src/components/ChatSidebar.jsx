import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Sparkles, FileText, HelpCircle, BrainCircuit } from "lucide-react";

const ChatSidebar = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Hi there! I'm your AI Learning Assistant. How can I help you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      let aiResponseText = "I'm still learning! Right now I'm a mocked assistant, but eventually I'll be able to help you properly with that.";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes("summarize")) {
        aiResponseText = "Here's a quick summary: The document covers the core concepts of the topic, breaking down the architecture and deployment steps. It highlights key features and best practices for scaling.";
      } else if (lowerText.includes("quiz")) {
        aiResponseText = "Alright, pop quiz!\n1. What is the primary function of this service?\n2. Name two best practices when configuring it.\nDrop your answers below!";
      }

      const aiMsg = { id: Date.now() + 1, role: "assistant", text: aiResponseText };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action) => {
    handleSend(action);
  };

  return (
    <>
      {/* Backdrop overlay for mobile (optional, but good for focus) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e7e8ff] rounded-xl text-[#032068]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">AI Assistant</h2>
              <p className="text-xs text-slate-500">Always here to help</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
          
          {/* Quick Actions (only show if few messages) */}
          {messages.length <= 2 && (
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Suggested Actions</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleQuickAction("Can you summarize the current document?")}
                  className="flex items-center gap-2 text-sm bg-white border border-slate-200 hover:border-[#f4ad5e] text-slate-700 hover:text-[#f4ad5e] px-3 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <FileText size={16} /> Summarize
                </button>
                <button 
                  onClick={() => handleQuickAction("Generate a quick quiz on this topic.")}
                  className="flex items-center gap-2 text-sm bg-white border border-slate-200 hover:border-[#036819] text-slate-700 hover:text-[#036819] px-3 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <BrainCircuit size={16} /> Quiz Me
                </button>
                <button 
                  onClick={() => handleQuickAction("I have a question about this topic.")}
                  className="flex items-center gap-2 text-sm bg-white border border-slate-200 hover:border-[#032068] text-slate-700 hover:text-[#032068] px-3 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <HelpCircle size={16} /> Question
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full mt-1 ${
                msg.role === "user" ? "bg-slate-200 text-slate-600" : "bg-gradient-to-br from-[#032068] to-[#0433a3] text-white shadow-sm"
              }`}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user" 
                  ? "bg-slate-800 text-white rounded-tr-sm" 
                  : "bg-white border border-slate-100 shadow-sm text-slate-700 rounded-tl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
               <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-[#032068] to-[#0433a3] text-white shadow-sm">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center h-10">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="relative flex items-center"
          >
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..." 
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-full pl-5 pr-12 py-3 focus:outline-none focus:border-[#032068] focus:ring-1 focus:ring-[#032068] transition-all"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 p-2 bg-[#032068] hover:bg-[#0433a3] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full transition-colors flex items-center justify-center"
            >
              <Send size={16} className="-ml-0.5 mt-0.5" />
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-[10px] text-slate-400">AI can make mistakes. Verify important information.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
