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
    <div className="flex flex-row h-screen">
      {/* Left Side */}
      <div className="flex flex-1 items-center justify-center bg-gray-100">
        <img
          src={signup_image}
          className="h-full w-full object-cover"
          alt="image"
        />
      </div>

      {/* Right Side */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-10">
        <h1 className="text-4xl font-semibold mb-10">
          Welcome! Let's get you signed up
        </h1>

        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col items-center justify-between w-[60%] gap-5 mt-5 "
        >
          <input
            type="text"
            placeholder="Full name"
            name="full_name"
            className="w-full border p-2 pl-6 rounded-4xl "
            required
            onChange={(e) => {
              handleChange(e);
            }}
          />

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

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border p-2 pl-6 rounded-4xl"
            required
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
          />

          <button className="bg-[#fb6505] text-white p-2 w-[45%] rounded-4xl mt-4 cursor-pointer">
            Sign Up
          </button>

          <div className="flex flex-col items-center ">
            <p className="text-sm mt-2 text-slate-500">or continue with</p>
            <div className="flex text-xl p-2 gap-4">
              <p className="p-2 bg-[#fb6505] rounded-full cursor-pointer">
                <FacebookIcon className="text-white h-6 w-6" />
              </p>
              <p className="p-2 bg-[#fb6505] rounded-full cursor-pointer ">
                <ChromiumIcon className="text-white h-6 w-6 " />
              </p>
              <p className="p-2 bg-[#fb6505] rounded-full cursor-pointer">
                <Linkedin className="text-white h-6 w-6 " />
              </p>
            </div>
          </div>
        </form>

        <p className="text-sm mt-2 text-slate-500">
          Already a member?
          <span className="text-[#d96d18] cursor-pointer" onClick={openSignIn}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
