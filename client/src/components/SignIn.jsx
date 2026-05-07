import { ChromiumIcon, FacebookIcon, Linkedin } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import signin_img from "../assets/signin_img.svg";
import { sanitizeSignIpData, signIpSchema } from "../middleware/validation";
import { useState } from "react";
import axios from "axios";
import { signInFunc } from "../lib/actions/auth";
import { useEffect } from "react";

const SignIn = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const sanitizedForm = sanitizeSignIpData(form);

    const result = signIpSchema.safeParse(sanitizedForm);

    if (!result.success) {
      //  show ALL zod errors using toast
      result.error.issues.forEach((issue) => {
        toast.error(issue.message);
      });
      return;
    }

    const data = await signInFunc(sanitizedForm, navigate);
    console.log(data);
    if (data.success) {
      // Redirect to dashboard
      navigate("/dashboard");
      toast.success("Sign in successful");
    } else {
      // console.log(data);
      toast.error(data.message);
      // console.log("Response data:", data);
    }
  };
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openSignUp = () => {
    navigate("/sign-up");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-6 md:p-10 lg:p-20 order-2 lg:order-1">
        <div className="w-full max-w-md">
          <h1 className="text-4xl md:text-5xl font-bold text-[#032068] mb-2">Welcome back!</h1>
          <p className="text-base text-slate-500 mb-8">Let's get some work done. Please enter your details.</p>
  
          <form
            onSubmit={onSubmitHandler}
            className="flex flex-col w-full gap-5"
          >
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                name="username"
                className="w-full border border-slate-200 bg-slate-50 p-4 pl-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a1999]/20 focus:border-[#1a1999] transition-all"
                required
                onChange={handleChange}
              />
  
              <input
                type="password"
                placeholder="Password"
                name="password"
                className="w-full border border-slate-200 bg-slate-50 p-4 pl-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a1999]/20 focus:border-[#1a1999] transition-all"
                required
                onChange={handleChange}
              />
            </div>
  
            <div className="flex justify-end">
              <p 
                className="text-sm font-medium text-slate-500 hover:text-[#1a1999] cursor-pointer transition-colors"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </p>
            </div>
  
            <button className="bg-[#1a1999] hover:bg-[#151480] text-white font-bold p-4 w-full rounded-2xl mt-2 cursor-pointer transition-all hover:scale-[1.02] shadow-lg">
              Login
            </button>
  
            <div className="flex flex-col items-center gap-4 mt-4">
              <div className="relative w-full flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-4 bg-white text-sm text-slate-500">or continue with</span>
              </div>
              
              <div className="flex gap-4">
                <button type="button" className="p-3 bg-slate-50 border border-slate-100 rounded-full cursor-pointer hover:bg-slate-100 transition-colors">
                  <FacebookIcon className="text-[#1877F2] h-6 w-6" />
                </button>
                <button type="button" className="p-3 bg-slate-50 border border-slate-100 rounded-full cursor-pointer hover:bg-slate-100 transition-colors">
                  <ChromiumIcon className="text-slate-700 h-6 w-6 " />
                </button>
                <button type="button" className="p-3 bg-slate-50 border border-slate-100 rounded-full cursor-pointer hover:bg-slate-100 transition-colors">
                  <Linkedin className="text-[#0A66C2] h-6 w-6 " />
                </button>
              </div>
            </div>
          </form>
  
          <p className="text-center text-sm mt-10 text-slate-500">
            Not a member?{" "}
            <span className="text-[#1a1999] font-bold cursor-pointer hover:underline" onClick={openSignUp}>
              Register now
            </span>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-10 lg:p-0 order-1 lg:order-2">
        <img
          src={signin_img}
          className="w-full max-w-lg lg:max-w-none lg:h-full lg:w-full object-contain lg:object-cover"
          alt="Sign In Illustration"
        />
      </div>
    </div>
  );
};

export default SignIn;
