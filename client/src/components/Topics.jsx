import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { awsList, pythonList, devOpsList } from "../middleware/doc-list";
import DocumentViewer from "./DocumentViewer";
import NavBar from "./NavBar";
import ChatSidebar from "./ChatSidebar";
import { ChevronDown, ChevronRight, FileText, Folder, BookOpen } from "lucide-react";

const Topics = () => {
  const navigate = useNavigate();
  const { topic: urlTopic, file: urlFile } = useParams();

  const [decoded, setDecoded] = useState("");
  const [currentTopic, setCurrentTopic] = useState(urlTopic || "");
  const [currentFile, setCurrentFile] = useState(urlFile || "");
  const [expandedTopic, setExpandedTopic] = useState(urlTopic || "");
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

  // Update state when URL params change
  useEffect(() => {
    if (urlTopic) {
      setCurrentTopic(urlTopic);
      setExpandedTopic(urlTopic);
    } else {
      setCurrentTopic("");
    }
    
    // Resolve filename from readable name in URL
    if (urlFile) {
      const topicFiles = list[urlTopic] || {};
      const decodedUrlFile = decodeURIComponent(urlFile);
      // If the URL param matches a readable name (key), get its filename (value)
      // Otherwise fallback to the param itself (for backwards compatibility)
      const resolvedFile = topicFiles[decodedUrlFile] || decodedUrlFile;
      setCurrentFile(resolvedFile);
    } else {
      setCurrentFile("");
    }

    // Automatically close chat when navigating to a new topic or file
    setIsChatOpen(false);
  }, [urlTopic, urlFile]);

  // SEO: Update page title - set to only topic/file name as requested
  useEffect(() => {
    const baseTitle = "Helper.io";
    if (currentFile && currentTopic) {
      const topicFiles = list[currentTopic] || {};
      const readableName = Object.keys(topicFiles).find(key => topicFiles[key] === currentFile) || currentFile;
      document.title = readableName +" | Helper.io";
    } else if (currentTopic) {
      document.title = topicNames[currentTopic] +" | Helper.io";
    } else {
      document.title = baseTitle;
    }

    return () => {
      document.title = baseTitle;
    };
  }, [currentTopic, currentFile]);

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

  const handleFileSelect = (topic, readableName) => {
    navigate(`/topics/${topic}/${encodeURIComponent(readableName)}`);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      <div className="px-6 bg-white shadow-sm z-10 border-b border-slate-100 flex-shrink-0">
        <NavBar toggleChatSidebar={() => setIsChatOpen(!isChatOpen)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / File Explorer */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-y-auto shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-0">
          <div className="p-5 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={20} className="text-[#032068]" />
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Topics</h1>
            </div>
            <p className="text-xs text-slate-500">Explore learning resources</p>
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
                    onClick={() => {
                        const nextExpanded = isExpanded ? "" : topicKey;
                        setExpandedTopic(nextExpanded);
                        if (nextExpanded) navigate(`/topics/${nextExpanded}`);
                    }}
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
                        const isSelected = decodeURIComponent(urlFile || "") === key;
                        return (
                          <div
                            key={key}
                            onClick={() => handleFileSelect(topicKey, key)}
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
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-white p-8 relative">
          {currentFile ? (
            <div className="max-w-5xl mx-auto">
              <DocumentViewer topic={currentTopic} file={currentFile} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="bg-white p-8 rounded-full shadow-sm mb-6 animate-pulse">
                <BookOpen size={64} className="text-[#032068]/20" />
              </div>
              <h2 className="text-2xl font-bold text-slate-700 mb-2">Select a Topic to Start</h2>
              <p className="text-slate-500 max-w-sm">
                Choose a category and document from the sidebar to begin your learning session.
              </p>
            </div>
          )}
        </div>

        {/* AI Assistant Sidebar - Integrated into Layout */}
        <ChatSidebar 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          topic={currentTopic} 
          file={currentFile} 
          inline={true}
        />
      </div>
    </div>
  );
};

export default Topics;
