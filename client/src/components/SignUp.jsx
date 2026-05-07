import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChromiumIcon, FacebookIcon, Linkedin } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import signup_image from "../assets/signup_img.svg";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { signUpSchema, sanitizeSignUpData } from "../middleware/validation.js";
import { signInFunc, signUpFunc } from "../lib/actions/auth.js";
import { useEffect } from "react";

const SignUp = () => {
  const navigate = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState();
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    password: "",
  });
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const sanitizedForm = sanitizeSignUpData(form);
    if (form.password != confirmPassword) {
      toast.error("Confirm password does not match");
    }
    const result = signUpSchema.safeParse(sanitizedForm);

    if (!result.success) {
      //  show ALL zod errors using toast
      result.error.issues.forEach((issue) => {
        toast.error(issue.message);
      });
      return;
    }

    const data= await signUpFunc(sanitizedForm,navigate)
    console.log(data)
        if (data.success) {
      // console.log("Response data:", data);

      await signInFunc(sanitizedForm,navigate);
      toast.success("Sign Up successful")
      
      // Redirect to dashboard
      navigate("/dashboard");  
    } else {
      // console.log(data);
      toast.error(data.message);
      // console.log("Response data:", data);
    }
    
  };
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openSignIn = () => {
    navigate("/sign-in");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Side - Image */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-10 lg:p-0">
        <img
          src={signup_image}
          className="w-full max-w-lg lg:max-w-none lg:h-full lg:w-full object-contain lg:object-cover"
          alt="Sign Up Illustration"
        />
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-6 md:p-10 lg:p-20">
        <div className="w-full max-w-md">
          <h1 className="text-4xl md:text-5xl font-bold text-[#fb6505] mb-2">Welcome!</h1>
          <p className="text-base text-slate-500 mb-8">Let's get you signed up and ready to learn.</p>
  
          <form
            onSubmit={onSubmitHandler}
            className="flex flex-col w-full gap-5"
          >
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full name"
                name="full_name"
                className="w-full border border-slate-200 bg-slate-50 p-4 pl-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#fb6505]/20 focus:border-[#fb6505] transition-all"
                required
                onChange={handleChange}
              />
  
              <input
                type="text"
                placeholder="Username"
                name="username"
                className="w-full border border-slate-200 bg-slate-50 p-4 pl-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#fb6505]/20 focus:border-[#fb6505] transition-all"
                required
                onChange={handleChange}
              />
  
              <input
                type="password"
                placeholder="Password"
                name="password"
                className="w-full border border-slate-200 bg-slate-50 p-4 pl-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#fb6505]/20 focus:border-[#fb6505] transition-all"
                required
                onChange={handleChange}
              />
  
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full border border-slate-200 bg-slate-50 p-4 pl-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#fb6505]/20 focus:border-[#fb6505] transition-all"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
  
            <button className="bg-[#fb6505] hover:bg-[#d95404] text-white font-bold p-4 w-full rounded-2xl mt-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg">
              Sign Up
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
            Already a member?{" "}
            <span className="text-[#fb6505] font-bold cursor-pointer hover:underline" onClick={openSignIn}>
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
