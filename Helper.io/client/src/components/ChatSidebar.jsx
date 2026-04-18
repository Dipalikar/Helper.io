import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  X,
  Send,
  Bot,
  User,
  FileText,
  HelpCircle,
  BrainCircuit,
} from "lucide-react";
import Markdown from "react-markdown";
import { AiOutlineAliwangwang } from "react-icons/ai";

const ChatSidebar = ({ isOpen, onClose, topic, file, file_key, inline = false }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Hi there! I'm your AI Learning Assistant. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        role: "assistant",
        text: "Hi there! I'm your AI Learning Assistant. How can I help you today?",
      },
    ]);

    setQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  const handleAnswer = (option) => {
    const correct = quiz[currentQuestion].answer;

    setSelectedAnswer(option);
    setShowResult(true);

    if (option === correct) {
      setScore((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);

    if (currentQuestion + 1 < quiz.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          text: `🎉 Quiz finished! Your score: ${score}/${quiz.length}`,
        },
      ]);

      setQuiz(null);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    resetChat();
  }, [file, file_key, topic]);

  const getApiEndpoint = (type) => {
    if (file_key) {
      return `http://localhost:5000/api/notes/ai/${type}`;
    }
    return `http://localhost:5000/api/ai/${type}`;
  };

  const getPayload = (extraParams = {}) => {
    if (file_key) {
      return { file_key, ...extraParams };
    }
    return { topic, file, ...extraParams };
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      let responseText = "";
      const lowerText = text.toLowerCase();

      if (lowerText.includes("summarize")) {
        const res = await axios.post(getApiEndpoint("summarize"), getPayload());
        responseText = res.data.summary;
      } else if (lowerText.includes("quiz")) {
        const res = await axios.post(getApiEndpoint("quiz"), getPayload());
        let quizData = res.data.quiz;

        if (typeof quizData === "string") {
          quizData = quizData
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

          quizData = JSON.parse(quizData);
        }

        setQuiz(quizData);
        setCurrentQuestion(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowResult(false);

        responseText = "🧠 Quiz started! Answer the questions below.";
      } else {
        const res = await axios.post(getApiEndpoint("doubt"), getPayload({ question: text }));
        responseText = res.data.answer;
      }

      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        text: responseText,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        text: "⚠️ Something went wrong connecting to the AI server.",
      };

      setMessages((prev) => [...prev, aiMsg]);
      console.log(error);
    } finally {
      setIsTyping(false);
    }
  };
  const handleQuickAction = (action) => {
    handleSend(action);
  };

  return (
    <>
      {/* Backdrop overlay for mobile (only if not inline) */}
      {isOpen && !inline && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`${
          inline 
            ? `relative border-l border-slate-200 h-full ${isOpen ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden"}` 
            : `fixed top-0 right-0 h-full w-full sm:w-96 shadow-2xl z-50 ${isOpen ? "translate-x-0" : "translate-x-full"}`
        } bg-white flex flex-col transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e7e8ff] rounded-xl text-[#032068]">
              <AiOutlineAliwangwang size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">AI Assistant</h2>
              <p className="text-xs text-slate-500">Always here to help</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetChat();
              onClose();
            }}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full mt-1 ${
                  msg.role === "user"
                    ? "bg-slate-200 text-slate-600"
                    : "text-[#032068] "
                }`}
              >
                {msg.role === "user" ? <User size={16} /> : <AiOutlineAliwangwang size={24} />}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-slate-800 text-white rounded-tr-sm"
                    : "bg-white border border-slate-100 shadow-sm text-slate-700 rounded-tl-sm"
                }`}
              >
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          ))}

          {quiz && (
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-3">
                Question {currentQuestion + 1} / {quiz.length}
              </h3>

              <p className="mb-3 text-slate-700">
                {quiz[currentQuestion].question}
              </p>

              <div className="flex flex-col gap-2">
                {quiz[currentQuestion].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                    className="text-left border border-slate-200 p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    {option}
                  </button>
                ))}
              </div>

              {showResult && (
                <div className="mt-3">
                  {selectedAnswer === quiz[currentQuestion].answer ? (
                    <p className="text-green-600 font-medium">✅ Correct!</p>
                  ) : (
                    <p className="text-red-600 font-medium">
                      ❌ Incorrect. Correct answer:{" "}
                      {quiz[currentQuestion].answer}
                    </p>
                  )}

                  <button
                    onClick={nextQuestion}
                    className="mt-2 bg-[#032068] text-white px-3 py-1 rounded-md cursor-pointer"
                  >
                    Next Question
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-[#032068]">
                <AiOutlineAliwangwang size={24} />
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
          {!isTyping && !quiz && (
            <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={() => handleQuickAction("Can you summarize the current document?")}
                className="flex items-center gap-1.5 text-[10px] md:text-xs bg-slate-50 border border-slate-200 hover:border-[#f4ad5e] hover:bg-[#f4ad5e]/5 text-slate-600 hover:text-[#f4ad5e] px-2.5 py-1.5 rounded-full transition-all shadow-sm"
              >
                <FileText size={12} /> Summarize
              </button>
              <button
                onClick={() => handleQuickAction("Generate a quick quiz on this topic.")}
                className="flex items-center gap-1.5 text-[10px] md:text-xs bg-slate-50 border border-slate-200 hover:border-[#036819] hover:bg-[#036819]/5 text-slate-600 hover:text-[#036819] px-2.5 py-1.5 rounded-full transition-all shadow-sm"
              >
                <BrainCircuit size={12} /> Quiz Me
              </button>
              <button
                onClick={() => handleQuickAction("I have a question about this topic.")}
                className="flex items-center gap-1.5 text-[10px] md:text-xs bg-slate-50 border border-slate-200 hover:border-[#032068] hover:bg-[#032068]/5 text-slate-600 hover:text-[#032068] px-2.5 py-1.5 rounded-full transition-all shadow-sm"
              >
                <HelpCircle size={12} /> Question
              </button>
            </div>
          )}
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
            <span className="text-[10px] text-slate-400">
              AI can make mistakes. Verify important information.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
