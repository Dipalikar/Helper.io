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

    const data= await signInFunc(sanitizedForm,navigate)
    console.log(data)
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
    <div className="flex flex-row h-screen">
      {/* Left Side */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-10">
        <h1 className="text-4xl font-semibold ">Welcome back!</h1>
        <p className="text-sm text-slate-500">Let's get some work done</p>

        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col items-center justify-between w-[60%] gap-5 mt-5 "
        >
          <input
            type="text"
            placeholder="Username"
            name="username"
            className="w-full border p-2 pl-6 rounded-4xl"
            required
            onChange={(e) => {
              handleChange(e);
            }}
          />

          <input
            type="password"
            placeholder="Password"
            name="password"
            className="w-full border p-2 pl-6 rounded-4xl"
            required
            onChange={(e) => {
              handleChange(e);
            }}
          />

          <p className="text-sm mt-2 text-slate-500 cursor-pointer">
            Forgot password?
          </p>

          <button className="bg-[#1a1999] text-white p-2 w-[45%] rounded-4xl mt-2 cursor-pointer">
            Login
          </button>

          <div className="flex flex-col items-center ">
            <p className="text-sm mt-2 text-slate-500">or continue with</p>
            <div className="flex text-xl p-2 gap-4">
              <p className="p-2 bg-[#1a1999] rounded-full cursor-pointer">
                <FacebookIcon className="text-white h-6 w-6" />
              </p>
              <p className="p-2 bg-[#1a1999] rounded-full cursor-pointer ">
                <ChromiumIcon className="text-white h-6 w-6 " />
              </p>
              <p className="p-2 bg-[#1a1999] rounded-full cursor-pointer">
                <Linkedin className="text-white h-6 w-6 " />
              </p>
            </div>
          </div>
        </form>

        <p className="text-sm mt-16 text-slate-500">
          Not a member?
          <span className="text-[#1a1999] cursor-pointer" onClick={openSignUp}>
            {" "}
            Register now
          </span>
        </p>
      </div>

      {/* Right Side */}
      <div className="flex flex-1 items-center justify-center bg-gray-100">
        <img
          src={signin_img}
          className="h-full w-full object-cover"
          alt="image"
        />
      </div>
    </div>
  );
};

export default SignIn;
