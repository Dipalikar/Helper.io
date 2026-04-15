import { ChromiumIcon, FacebookIcon, Linkedin, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import signin_img from "../assets/signin_img.svg";
import { sanitizeSignIpData, signIpSchema } from "../middleware/validation";
import { useState, useEffect } from "react";
import { signInFunc } from "../lib/actions/auth";
import { AiOutlineAliwangwang } from "react-icons/ai";

const SignIn = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const sanitizedForm = sanitizeSignIpData(form);
    const result = signIpSchema.safeParse(sanitizedForm);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        toast.error(issue.message);
      });
      setIsLoading(false);
      return;
    }

    const data = await signInFunc(sanitizedForm, navigate);
    setIsLoading(false);
    
    if (data.success) {
      navigate("/dashboard");  
      toast.success("Welcome back!");
    } else {
      toast.error(data.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-[#032068] p-3 rounded-2xl shadow-lg transition-transform hover:scale-110">
            <AiOutlineAliwangwang className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Sign in to your account to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 sm:rounded-[2.5rem] sm:px-12 transition-all">
          <form className="space-y-6" onSubmit={onSubmitHandler}>
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-700 ml-1 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#032068] focus:border-transparent transition-all sm:text-sm"
                  placeholder="johndoe"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 ml-1 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#032068] focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="#" className="font-bold text-[#032068] hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-lg font-bold text-white bg-[#032068] hover:bg-[#0a369d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#032068] transition-all transform hover:scale-[1.02] active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group">
                <FacebookIcon className="h-5 w-5 text-slate-600 group-hover:text-blue-600" />
              </button>
              <button className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group">
                <ChromiumIcon className="h-5 w-5 text-slate-600 group-hover:text-red-500" />
              </button>
              <button className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group">
                <Linkedin className="h-5 w-5 text-slate-600 group-hover:text-blue-700" />
              </button>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              Not a member?{' '}
              <Link to="/sign-up" className="font-bold text-[#032068] hover:text-blue-700 transition-colors">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 -ml-20 -mt-20 w-80 h-80 bg-blue-100 rounded-full blur-[100px] opacity-20 -z-10"></div>
      <div className="fixed bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 bg-blue-100 rounded-full blur-[100px] opacity-20 -z-10"></div>
    </div>
  );
};

export default SignIn;

export default SignIn;
