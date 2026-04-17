import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import NavBar from "./NavBar";
import ChatSidebar from "./ChatSidebar";
import { User, Bell, Shield, Save, Trash2, Mail } from "lucide-react";
import { toast } from "react-hot-toast";

const AccountSettings = () => {
  const navigate = useNavigate();
  const [decoded, setDecoded] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

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

  const tabs = [
    { id: "profile", label: "Profile Information", icon: <User size={18} /> },
    { id: "security", label: "Account Security", icon: <Shield size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className=" mx-auto px-6 bg-white border-b border-slate-100 sticky top-0 z-20">
        <NavBar toggleChatSidebar={() => setIsChatOpen(!isChatOpen)} />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Account Settings
          </h1>
          <p className="text-slate-500">
            Manage your profile information and account preferences.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-[#032068] text-white shadow-md shadow-blue-900/10"
                      : "text-slate-600 hover:bg-white hover:text-[#032068]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 md:p-10">
            {activeTab === "profile" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-6 mb-10 overflow-hidden">
                  <div className="w-24 h-24 bg-gradient-to-tr from-[#032068] to-[#2563eb] rounded-[2rem] flex items-center justify-center text-white text-3xl font-extrabold shadow-lg flex-shrink-0">
                    {decoded?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      Your Photo
                    </h3>
                    <p className="text-sm text-slate-500 mb-3">
                      This will be displayed on your profile.
                    </p>
                    <div className="flex gap-2">
                      <button className="text-sm font-bold text-[#032068] hover:underline transition-all">
                        Upload New
                      </button>
                      <span className="text-slate-300">•</span>
                      <button className="text-sm font-bold text-red-500 hover:underline transition-all">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">
                        Username
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <User size={18} />
                        </div>
                        <input
                          type="text"
                          defaultValue={decoded?.username || ""}
                          className="w-full bg-slate-50/50 border border-slate-200 p-3.5 pl-11 rounded-2xl text-slate-800 focus:outline-none focus:border-[#032068] focus:ring-1 focus:ring-[#032068] transition-all font-medium"
                          placeholder="johndoe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          defaultValue={decoded?.email || "learner@helper.io"}
                          className="w-full bg-slate-50/50 border border-slate-200 p-3.5 pl-11 rounded-2xl text-slate-800 focus:outline-none focus:border-[#032068] focus:ring-1 focus:ring-[#032068] transition-all font-medium"
                          placeholder="alex@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-50 mt-10">
                    <button
                      type="button"
                      onClick={() =>
                        toast.success("Profile updated successfully!")
                      }
                      className="flex items-center gap-2 bg-[#032068] text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-[#0a369d] transition-all hover:scale-[1.02] shadow-lg shadow-blue-900/10"
                    >
                      <Save size={18} />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "security" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Security Settings
                </h3>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Change Password
                    </h4>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 ml-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full bg-slate-50/50 border border-slate-200 p-3.5 rounded-2xl focus:outline-none focus:border-[#032068] focus:ring-1 focus:ring-[#032068] transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 ml-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full bg-slate-50/50 border border-slate-200 p-3.5 rounded-2xl focus:outline-none focus:border-[#032068] focus:ring-1 focus:ring-[#032068] transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-600 ml-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full bg-slate-50/50 border border-slate-200 p-3.5 rounded-2xl focus:outline-none focus:border-[#032068] focus:ring-1 focus:ring-[#032068] transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() =>
                        toast.success("Security settings updated!")
                      }
                      className="bg-[#032068] text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-[#0a369d] transition-all shadow-lg"
                    >
                      Update Security
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Notification Preferences
                </h3>

                <div className="space-y-6">
                  {[
                    {
                      id: "email-news",
                      title: "Email Newsletters",
                      desc: "Receive updates about new topics and features.",
                    },
                    {
                      id: "ai-tips",
                      title: "AI Learning Tips",
                      desc: "Get personalized tips for your learning journey.",
                    },
                    {
                      id: "security-alerts",
                      title: "Security Alerts",
                      desc: "Get notified about account logins and security events.",
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors"
                    >
                      <div className="max-w-md">
                        <h4 className="font-bold text-slate-800 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={item.id === "security-alerts"}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#032068]"></div>
                      </label>
                    </div>
                  ))}

                  <div className="pt-8 border-t border-slate-50 mt-10">
                    <button
                      onClick={() =>
                        toast.success("Notification preferences saved!")
                      }
                      className="bg-[#032068] text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-[#0a369d] transition-all shadow-lg"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-16 bg-red-50/50 border border-red-100 rounded-[2rem] p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2 justify-center md:justify-start">
                <Trash2 size={24} className="text-red-500" />
                Delete Account
              </h4>
              <p className="text-sm text-slate-500 max-w-md">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
            </div>
            <button className="bg-red-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-600 transition-all hover:scale-105 shadow-lg shadow-red-900/10 active:scale-95">
              Permanently Delete
            </button>
          </div>
        </div>
      </main>

      <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default AccountSettings;
