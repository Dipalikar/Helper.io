import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import forgot_img from "../assets/signin_img.svg"; // Reusing signin image or use a specific one
import { API_URL } from "../lib/config";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      if (response.data.success) {
        toast.success(response.data.message);
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
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1999] mb-2">Forgot Password?</h1>
          <p className="text-base text-slate-500 mb-8">Enter your email and we'll send you a link to reset your password.</p>
  
          <form onSubmit={onSubmitHandler} className="flex flex-col w-full gap-5">
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                className="w-full border border-slate-200 bg-slate-50 p-4 pl-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a1999]/20 focus:border-[#1a1999] transition-all"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
  
            <button 
              disabled={loading}
              className="bg-[#1a1999] hover:bg-[#151480] text-white font-bold p-4 w-full rounded-2xl mt-2 cursor-pointer transition-all hover:scale-[1.02] shadow-lg disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
  
          <p className="text-center text-sm mt-10 text-slate-500">
            Remembered your password?{" "}
            <span className="text-[#1a1999] font-bold cursor-pointer hover:underline" onClick={() => navigate("/sign-in")}>
              Back to Sign In
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 p-10 lg:p-0 order-1 lg:order-2">
        <img
          src={forgot_img}
          className="w-full max-w-lg lg:max-w-none lg:h-full lg:w-full object-contain lg:object-cover"
          alt="Forgot Password Illustration"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;
