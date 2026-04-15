import React, { useState } from "react";
import icon from "../assets/icon.svg";
import chat_icon from "../assets/chat-bot.svg";
import { LogOut, User, Settings, ChevronDown, LayoutDashboard, BookOpen } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AiOutlineAliwangwang } from "react-icons/ai";

const NavBar = ({ toggleChatSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Topics", path: "/topics", icon: <BookOpen size={18} /> },
  ];

  return (
    <nav className="flex flex-row justify-between h-20 items-center">
      {/* Brand Section */}
      <div className="flex items-center gap-8">
        <Link 
          to="/" 
          onClick={handleLogout}
          className="flex items-center gap-2 group decoration-transparent"
        >
          <div className="bg-[#032068] p-2 rounded-xl transition-transform group-hover:scale-110">
            <img src={icon} className="w-6 h-6 invert" alt="Logo" />
          </div>
          <span className="text-2xl font-bold text-[#032068] tracking-tight">Helper.io</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 decoration-transparent ${
                location.pathname === link.path
                  ? "bg-[#e7e8ff] text-[#032068]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Right Section: Chat & Profile */}
      <div className="flex items-center gap-5">
        <button
          onClick={toggleChatSidebar}
          className="p-2.5 rounded-full hover:bg-[#e7e8ff] transition-colors relative"
          title="AI Assistant"
        >
          <AiOutlineAliwangwang className="w-10 h-10 text-[#032068]" alt="Chat" />
        </button>

        <div className="h-8 w-[1px] bg-slate-200"></div>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-[#032068] to-[#2563eb] rounded-full flex items-center justify-center text-white shadow-sm">
              <User size={20} />
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-sm font-bold text-slate-800">My Account</p>
                <p className="text-xs text-slate-500 truncate">Settings & Profile</p>
              </div>
              
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-[#f4f5ff] hover:text-[#032068] transition-colors">
                <Settings size={18} />
                <span>Account Settings</span>
              </button>
              
              <div className="h-[1px] bg-slate-50 my-1"></div>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
