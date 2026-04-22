import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Trash2, MessageSquare, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../lib/config";

const StickyNotesOverlay = ({ document_key, containerRef }) => {
  const [comments, setComments] = useState([]);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [newCommentPos, setNewCommentPos] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [username, setUsername] = useState("");
  const [expandedCommentId, setExpandedCommentId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
      } catch (e) {}
    }
  }, []);

  const fetchComments = useCallback(async () => {
    if (!document_key || !username) return;
    try {
      const { data } = await axios.get(`${API_URL}/comments?document_key=${encodeURIComponent(document_key)}&username=${encodeURIComponent(username)}`);
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    }
  }, [document_key, username]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    const handleToggle = () => setIsCommentMode(prev => !prev);
    const handleClickOutside = (e) => {
      if (!e.target.closest('.sticky-note-el')) {
        setExpandedCommentId(null);
      }
    };
    window.addEventListener("toggle-comment-mode", handleToggle);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("toggle-comment-mode", handleToggle);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleContainerClick = (e) => {
    if (!isCommentMode || !containerRef.current) return;
    
    // Ignore clicks if they are on an existing comment or the new comment input box
    if (e.target.closest('.sticky-note-el')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const y_position = e.clientY - rect.top;
    
    setNewCommentPos(y_position);
    setCommentText("");
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      if (isCommentMode) {
        container.style.cursor = 'crosshair';
        container.addEventListener('click', handleContainerClick);
      } else {
        container.style.cursor = 'auto';
        container.removeEventListener('click', handleContainerClick);
        setNewCommentPos(null);
      }
    }
    return () => {
      if (container) {
        container.style.cursor = 'auto';
        container.removeEventListener('click', handleContainerClick);
      }
    };
  }, [isCommentMode, containerRef, handleContainerClick]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const toastId = toast.loading("Adding comment...");
    try {
      const { data } = await axios.post(`${API_URL}/comments`, {
        username,
        document_key,
        y_position: newCommentPos,
        content: commentText
      });
      if (data.success) {
        setComments([...comments, data.comment]);
        setNewCommentPos(null);
        setCommentText("");
        setIsCommentMode(false);
        toast.success("Comment added!", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to add comment", { id: toastId });
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      const { data } = await axios.delete(`${API_URL}/comments`, {
        data: { id, username }
      });
      if (data.success) {
        setComments(comments.filter(c => c.id !== id));
        toast.success("Comment deleted");
      }
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none sticky-notes-layer" style={{ zIndex: 10 }}>
      {isCommentMode && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-[#032068] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce pointer-events-auto z-50">
          <Plus size={20} />
          <span className="font-semibold text-sm md:text-base">Comment Mode Active: Click anywhere on the document</span>
          <button onClick={() => setIsCommentMode(false)} className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {comments.map((comment, index) => {
        const isExpanded = expandedCommentId === comment.id;
        const displayContent = isExpanded 
          ? comment.content 
          : (comment.content.length > 20 ? comment.content.substring(0, 20) + "..." : comment.content);

        // Calculate a consistent but "random" looking tilt and offset based on ID or index
        const tilt = ((index % 3) - 1) * 1.5; // -1.5, 0, or 1.5 degrees
        const stagger = (index % 2) * 8; // 0 or 8px horizontal stagger

        return (
          <div 
            key={comment.id} 
            onClick={(e) => {
              e.stopPropagation();
              setExpandedCommentId(isExpanded ? null : comment.id);
            }}
            className={`absolute bg-yellow-100 border border-yellow-200/60 shadow-[2px_4px_12px_rgba(0,0,0,0.1)] p-4 transform -translate-y-1/2 pointer-events-auto sticky-note-el transition-all hover:scale-105 hover:shadow-xl hover:z-30 group cursor-pointer ${isExpanded ? 'w-64 md:w-72 z-40' : 'w-48 md:w-56 z-10'}`}
            style={{ 
              top: `${comment.y_position}px`,
              right: `${(window.innerWidth < 768 ? 32 : 64) + stagger}px`,
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)',
              borderBottomRightRadius: '15px'
            }}
          >
            {/* Fold effect corner */}
            <div className="absolute bottom-0 right-0 w-[15px] h-[15px] bg-yellow-200 shadow-[-2px_-2px_4px_rgba(0,0,0,0.05)]"></div>
            
            <div className={`flex ${comment.username === username ? 'justify-end' : 'hidden'} items-start mb-2`}>
              {comment.username === username && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteComment(comment.id);
                  }} 
                  className="text-yellow-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-sm text-yellow-900 leading-snug whitespace-pre-wrap font-medium">
              {displayContent}
            </p>
          </div>
        );
      })}

      {newCommentPos !== null && (
        <div 
          className="absolute right-8 md:right-16 w-48 md:w-56 bg-white shadow-2xl p-4 border border-blue-200 transform -translate-y-1/2 rounded-xl pointer-events-auto sticky-note-el z-50"
          style={{ top: `${newCommentPos}px` }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-blue-700">New Sticky Note</span>
            <button onClick={() => setNewCommentPos(null)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
          <textarea 
            autoFocus
            maxLength={500}
            className="w-full h-24 text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#032068] resize-none mb-1"
            placeholder="Type your comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="text-[10px] text-right text-slate-400 mb-2">
            {commentText.length}/500
          </div>
          <button 
            onClick={handleAddComment}
            className="w-full bg-[#032068] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#0433a3] transition-colors"
          >
            Save Note
          </button>
        </div>
      )}
    </div>
  );
};

export default StickyNotesOverlay;
