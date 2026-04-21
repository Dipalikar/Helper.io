import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import NavBar from "./NavBar";
import ChatSidebar from "./ChatSidebar";
import StickyNotesOverlay from "./StickyNotesOverlay";
import { FileText, Trash2, UploadCloud, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import toast from "react-hot-toast";
import axios from "axios";

const MyNotes = () => {
  const navigate = useNavigate();
  const { noteTitle } = useParams();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/sign-in");
    } else {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
        fetchNotes(decoded.username);
      } catch (e) {
        navigate("/sign-in");
      }
    }
  }, [navigate]);

  useEffect(() => {
    document.title = "My Notes | Helper.io";
  }, []);

  // Sync state with URL parameter
  useEffect(() => {
    if (notes.length > 0 && noteTitle) {
      const decodedTitle = decodeURIComponent(noteTitle);
      const note = notes.find(n => n.title === decodedTitle);
      if (note && (!selectedNote || selectedNote.id !== note.id)) {
        resolveNoteContent(note);
      }
    }
  }, [notes, noteTitle]);

  const fetchNotes = async (user) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/notes/list?username=${user}`);
      if (data.success) {
        setNotes(data.notes);
      }
    } catch (error) {
      toast.error("Failed to fetch notes");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) {
      toast.error("Please upload a .md or .txt file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      const title = file.name.replace(/\.[^/.]+$/, "");
      
      const uploadToast = toast.loading("Uploading note...");
      try {
        const { data } = await axios.post("http://localhost:5000/api/notes/upload", {
          username,
          title,
          content
        });

        if (data.success) {
          const newNote = data.note;
          setNotes([newNote, ...notes]);
          setSelectedNote(newNote);
          toast.success("Note uploaded successfully!", { id: uploadToast });
        }
      } catch (error) {
        toast.error("Error uploading note", { id: uploadToast });
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input
  };

  const handleNoteSelect = (note) => {
    setIsChatOpen(false);
    navigate(`/notes/${encodeURIComponent(note.title)}`);
  };

  const resolveNoteContent = async (note, force = false) => {
    if (note.content && !force) {
      setSelectedNote(note);
      return;
    }
    
    setIsNoteLoading(true);
    if (!force) setSelectedNote(null);
    
    try {
      const { data } = await axios.get(`http://localhost:5000/api/notes/content?file_key=${encodeURIComponent(note.file_key)}`);
      if (data.success) {
        const updatedNote = { ...note, content: data.content };
        setSelectedNote(updatedNote);
        setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n));
      }
    } catch (error) {
      toast.error("Error loading note content");
    } finally {
      setIsNoteLoading(false);
    }
  };

  const handleDelete = async (e, id, file_key) => {
    e.stopPropagation();
    try {
      const { data } = await axios.delete("http://localhost:5000/api/notes/delete", {
        data: { id, file_key }
      });
      if (data.success) {
        setNotes(notes.filter((n) => n.id !== id));
        if (selectedNote?.id === id) {
          setSelectedNote(null);
        }
        toast.success("Note deleted");
      }
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-[#032068]" />
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">My Notes</h1>
              </div>
            </div>
            {/* Upload Button */}
            <div 
              className="flex items-center justify-center gap-2 w-full p-3 bg-[#e7e8ff] hover:bg-[#d6d8ff] text-[#032068] rounded-xl font-bold transition-colors cursor-pointer"
              onClick={() => document.getElementById("note-upload").click()}
            >
              <UploadCloud size={18} />
              <span>Upload Note</span>
              <input id="note-upload" type="file" accept=".md,.txt" className="hidden" onChange={handleFileUpload} />
            </div>
          </div>
          
          <div className="p-4 flex flex-col gap-2">
            {notes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center mt-4">No notes uploaded yet.</p>
            ) : (
              notes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => handleNoteSelect(note)}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-[#032068] text-white shadow-md' 
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText size={16} className={isSelected ? "text-white" : "text-slate-400"} />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className={`font-semibold text-sm truncate ${isSelected ? "text-white" : ""}`}>
                          {note.title}
                        </span>
                        <span className={`text-xs truncate ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                          {formatDate(note.created_at || note.date)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, note.id, note.file_key)}
                      className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                        isSelected ? "hover:bg-red-500/20 text-red-200" : "hover:bg-red-50 text-red-500"
                      }`}
                      title="Delete note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-white p-8 relative">
          {isNoteLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-slate-400 gap-4">
               <Loader2 className="animate-spin w-12 h-12 text-[#032068]" />
               <p className="font-medium animate-pulse">Loading note...</p>
            </div>
          ) : selectedNote ? (
            <div className="max-w-5xl mx-auto">
               <div className="bg-white border border-slate-200 shadow-xl rounded-[2.5rem] p-8 md:p-16 mb-12 mx-auto max-w-6xl min-h-full hover:shadow-2xl relative" ref={containerRef}>
                  <StickyNotesOverlay containerRef={containerRef} document_key={selectedNote.file_key} />
                  <div className="flex items-center gap-5 border-b border-slate-100 pb-8 mb-10 text-[#032068]">
                    <div className="p-4 bg-gradient-to-br from-[#e7e8ff] to-[#f0f1ff] rounded-2xl shadow-sm">
                      <FileText size={32} className="text-[#032068]" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-black tracking-tight m-0 bg-clip-text text-transparent bg-gradient-to-r from-[#032068] to-[#0a36a3]">
                        {selectedNote.title}
                      </h1>
                      <p className="text-slate-500 text-sm mt-1 font-medium flex items-center gap-2">
                        Uploaded on {formatDate(selectedNote.created_at || selectedNote.date)}
                      </p>
                    </div>
                  </div>

                  <div className="prose prose-slate prose-lg max-w-none 
                    prose-p:my-6 prose-p:leading-relaxed text-slate-700
                    prose-headings:text-[#032068] prose-headings:font-bold prose-headings:tracking-tight
                    prose-h1:text-4xl prose-h1:mt-24 prose-h1:mb-10
                    prose-h2:text-3xl prose-h2:mt-20 prose-h2:mb-8 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-4
                    prose-h3:text-2xl prose-h3:mt-16 prose-h3:mb-6
                    prose-h4:text-xl prose-h4:mt-12 prose-h4:mb-4
                    prose-a:text-[#f4ad5e] prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-[#e09b4d]
                    prose-blockquote:border-l-4 prose-blockquote:border-l-[#032068] prose-blockquote:bg-slate-50 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:my-10 prose-blockquote:text-slate-600 prose-blockquote:italic
                    prose-strong:text-[#032068] prose-strong:font-bold
                    prose-code:text-[#036819] prose-code:bg-[#ebf5ed] prose-code:px-2.5 prose-code:py-1 prose-code:rounded-lg prose-code:font-semibold prose-code:text-base
                    prose-pre:bg-[#1e1e1e] prose-pre:text-slate-50 prose-pre:rounded-3xl prose-pre:shadow-2xl prose-pre:my-12 prose-pre:border prose-pre:border-slate-800
                    prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:my-14 prose-img:border prose-img:border-slate-100
                    prose-table:w-full prose-table:border-collapse prose-table:my-12 prose-table:rounded-2xl prose-table:overflow-hidden prose-table:shadow-sm
                    prose-thead:bg-[#f1f5f9] prose-th:py-4 prose-th:px-6 prose-th:text-left prose-th:font-bold prose-th:text-[#032068]
                    prose-td:py-4 prose-td:px-6 prose-td:border-b prose-td:border-slate-100
                    prose-ul:my-8 prose-ol:my-8 prose-li:my-3 prose-li:leading-relaxed
                  ">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          const language = match ? match[1] : null;

                          return !inline && language ? (
                            <div className="relative group">
                              <div className="absolute right-4 top-4 text-xs font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                                {language}
                              </div>
                              <SyntaxHighlighter
                                style={atomOneLight}
                                language={language}
                                PreTag="div"
                                className="!rounded-2xl !p-6"
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {selectedNote.content}
                    </ReactMarkdown>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div 
                className=" p-12 rounded-[3rem] border-2 border-dashed border-[#032068]/20 flex flex-col items-center justify-center cursor-pointer transition-all max-w-lg mb-6 group"
                onClick={() => document.getElementById("note-upload-main").click()}
              >
                <div className="bg-white p-6 rounded-full shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <UploadCloud size={48} className="text-[#032068]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700 mb-3">Upload Personal Notes</h2>
                <p className="text-slate-500">
                  Drag and drop or click to upload your `.md` or `.txt` files. They will be stored securely on Cloudflare R2!
                </p>
                <input id="note-upload-main" type="file" accept=".md,.txt" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Sidebar - Integrated into Layout */}
        <ChatSidebar 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          inline={true}
          file_key={selectedNote?.file_key}
          onActionSuccess={() => {
            fetchNotes(username);
            if (selectedNote) {
              resolveNoteContent(selectedNote, true);
            }
          }}
        />
      </div>
    </div>
  );
};

export default MyNotes;
