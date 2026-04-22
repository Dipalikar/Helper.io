import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import dashboardImg from "../assets/dashboard.svg";
import NavBar from "./NavBar";
import ChatSidebar from "./ChatSidebar";
import { ArrowRight, Code, Cloud, Cpu, Sparkles, LayoutDashboard } from "lucide-react";
import { AiOutlineAliwangwang } from "react-icons/ai";

const Dashboard = () => {
  const navigate = useNavigate();
  const [decoded, setDecoded] = useState("");
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

  const popularTopics = [
    {
      id: "aws",
      name: "AWS & Cloud",
      description: "Master cloud infrastructure and serverless architectures.",
      icon: <Cloud className="text-blue-500" size={24} />,
      color: "bg-blue-50",
    },
    {
      id: "python",
      name: "Python Mastery",
      description: "From basics to advanced automation and data science.",
      icon: <Code className="text-emerald-500" size={24} />,
      color: "bg-emerald-50",
    },
    {
      id: "devops",
      name: "DevOps & CI/CD",
      description: "Scale applications with modern deployment patterns.",
      icon: <Cpu className="text-purple-500" size={24} />,
      color: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className=" mx-auto px-6 border-b border-slate-100">
        <NavBar toggleChatSidebar={() => setIsChatOpen(!isChatOpen)} />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#032068] to-[#0a369d] p-8 md:p-16 text-white mb-20 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-bold uppercase tracking-wider mb-6">
              <AiOutlineAliwangwang size={14} className="text-yellow-400" />
              Welcome Back
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Hi, {decoded?.username || "Learner"}! <br />
              <span className="text-blue-200">What are we building today?</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100/80 mb-10 max-w-lg font-medium leading-relaxed">
              Continue your journey through our curated learning paths and master the latest technologies with AI assistance.
            </p>
            <Link
              to="/topics"
              className="inline-flex items-center gap-2 bg-white text-[#032068] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all hover:scale-105 shadow-lg decoration-transparent"
            >
              Explore All Topics
              <ArrowRight size={20} />
            </Link>
          </div>

          {/* Abstract background blobs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-0 mr-40 mb-10 hidden lg:block">
            <img 
              src={dashboardImg} 
              alt="Hero Illustration" 
              className="w-[450px] drop-shadow-2xl animate-float"
            />
          </div>
        </section>

        {/* Popular Topics Grid */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Popular Topics</h2>
              <p className="text-slate-500 mt-1">Jump right back into your favorite subjects</p>
            </div>
            <Link to="/topics" className="text-[#032068] font-bold hover:underline flex items-center gap-1 decoration-transparent">
              View All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularTopics.map((topic) => (
              <Link
                key={topic.id}
                to={`/topics/${topic.id}`}
                className="group p-8 rounded-[2rem] border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 decoration-transparent"
              >
                <div className={`${topic.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {topic.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{topic.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {topic.description}
                </p>
                <div className="flex items-center text-[#032068] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Start Learning <ArrowRight size={16} className="ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Community/Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 border-t border-slate-100">
          <div className="bg-slate-50 p-8 rounded-3xl flex items-center gap-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm">
                <AiOutlineAliwangwang className="text-yellow-500" size={32}/>
            </div>
            <div>
              <h4 className="font-bold text-slate-900">AI Tutor Ready</h4>
              <p className="text-slate-500 text-sm">Our assistant is here to help with any questions.</p>
            </div>
          </div>
          <div className="bg-slate-50 p-8 rounded-3xl flex items-center gap-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm">
                <LayoutDashboard className="text-blue-500" size={32}/>
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Personalized Feed</h4>
              <p className="text-slate-500 text-sm">We've customized your dashboard for optimal learning.</p>
            </div>
          </div>
        </section>
      </main>

      <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Dashboard;
