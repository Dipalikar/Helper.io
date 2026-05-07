import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import reset_img from "../assets/signin_img.svg";
import { API_URL } from "../lib/config";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/reset-password`, { token, password });
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/sign-in");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-6 md:p-10 lg:p-20 order-2 lg:order-1">
        <div className="w-full max-w-md">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1999] mb-2">Reset Password</h1>
          <p className="text-base text-slate-500 mb-8">Enter your new password below.</p>
  
          <form onSubmit={onSubmitHandler} className="flex flex-col w-full gap-5">
            <div className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                className="w-full border border-slate-200 bg-slate-50 p-4 pl-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a1999]/20 focus:border-[#1a1999] transition-all"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full border border-slate-200 bg-slate-50 p-4 pl-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a1999]/20 focus:border-[#1a1999] transition-all"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
  
            <button 
              disabled={loading}
              className="bg-[#1a1999] hover:bg-[#151480] text-white font-bold p-4 w-full rounded-2xl mt-2 cursor-pointer transition-all hover:scale-[1.02] shadow-lg disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 p-10 lg:p-0 order-1 lg:order-2">
        <img
          src={reset_img}
          className="w-full max-w-lg lg:max-w-none lg:h-full lg:w-full object-contain lg:object-cover"
          alt="Reset Password Illustration"
        />
      </div>
    </div>
  );
};

export default ResetPassword;
