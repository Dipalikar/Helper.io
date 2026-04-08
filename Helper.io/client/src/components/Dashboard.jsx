import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import dashboard from "../assets/dashboard.svg";

import { awsList, pythonList, devOpsList } from "../middleware/doc-list";
import DocumentViewer from "./DocumentViewer";
import NavBar from "./NavBar";
import ChatSidebar from "./ChatSidebar";
import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const [decoded, setDecoded] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentFile, setCurrentFile] = useState("");
  const [expandedTopic, setExpandedTopic] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/sign-in");
    } else {
      try {
        setDecoded(jwtDecode(token));
      } catch (e) {
        navigate("/sign-in");
      }
    }
  }, [navigate]);

  const list = {
    aws: awsList,
    python: pythonList,
    devops: devOpsList,
  };

  const topicNames = {
    aws: "AWS",
    python: "Python",
    devops: "Dev-Ops"
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-x-hidden">
      <div className="px-6 bg-white shadow-sm z-10 border-b border-slate-100">
        <NavBar toggleChatSidebar={() => setIsChatOpen(true)} />
      </div>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-80px)]">
        {/* Sidebar / File Explorer */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-y-auto shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-0">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Explorer</h2>
            <p className="text-xs text-slate-500 mt-1">Browse your topics</p>
          </div>
          
          <div className="p-4 flex flex-col gap-2">
            {['aws', 'python', 'devops'].map((topicKey) => {
              const isExpanded = expandedTopic === topicKey;
              return (
                <div key={topicKey} className="flex flex-col">
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      isExpanded 
                        ? 'bg-[#e7e8ff] text-[#032068] shadow-sm' 
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                    onClick={() => setExpandedTopic(isExpanded ? "" : topicKey)}
                  >
                    {isExpanded ? (
                      <ChevronDown size={18} className="text-[#032068]" />
                    ) : (
                      <ChevronRight size={18} className="text-slate-400" />
                    )}
                    <Folder size={20} className={isExpanded ? "text-[#032068]" : "text-slate-400"} />
                    <span className="font-semibold text-sm">
                      {topicNames[topicKey]}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="flex flex-col pl-9 pr-2 py-2 gap-1 animate-in slide-in-from-top-2 duration-300">
                      {Object.entries(list[topicKey]).map(([key, value]) => {
                        const isSelected = currentFile === value;
                        return (
                          <div
                            key={key}
                            onClick={() => {
                              setCurrentTopic(topicKey);
                              setCurrentFile(value);
                            }}
                            className={`flex items-center gap-2 cursor-pointer text-sm p-2.5 rounded-lg transition-all duration-200 ${
                              isSelected
                                ? 'bg-[#032068] text-white shadow-md'
                                : 'text-slate-600 hover:text-[#032068] hover:bg-[#e7e8ff]'
                            }`}
                          >
                            <FileText size={16} className={isSelected ? 'text-white' : 'text-slate-400'} />
                            <span className="truncate" title={key}>{key}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="mt-6 px-4 text-center">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-500">
                + Many more coming soon
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-8 relative">
          
          {currentFile ? (
            <DocumentViewer topic={currentTopic} file={currentFile} />
          ) : (
            <>
              {/* Hero Banner */}
              <div className="flex flex-col md:flex-row bg-gradient-to-r from-[#e7e8ff] to-[#f4f5ff] max-w-5xl mx-auto p-8 border border-white rounded-[2rem] justify-between items-center shadow-sm gap-6">
                <div className="flex flex-col text-[#032068]">
                  <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
                    Hi, {decoded?.username || "Learner"}! 👋
                  </h1>
                  <p className="text-lg text-[#032068]/80 font-medium max-w-md">
                    Ready to level up your skills? Select a topic from the explorer to begin.
                  </p>
                </div>
                <img
                  src={dashboard}
                  className="w-48 h-48 object-contain drop-shadow-xl z-10 hover:scale-105 transition-transform duration-300"
                  alt="Dashboard Illustration"
                />
              </div>
              
              {/* Placeholder when no file is selected */}
              <div className="max-w-5xl mx-auto mt-12 text-center flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                  <Folder size={48} className="text-[#032068]/40" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-3">No Document Selected</h3>
                <p className="text-slate-500 max-w-md text-base">
                  Use the file explorer on the left to navigate through AWS, Python, and Dev-Ops topics to open your documents.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} topic={currentTopic} file={currentFile} />
    </div>
  );
};

export default Dashboard;
