import { LogOut } from "lucide-react";
import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import dashboard from "../assets/dashboard.svg";
import icon from "../assets/icon.svg";

const Dashboard = () => {
  const navigate = useNavigate();

  const now = new Date(Date.now());

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/sign-in");
    setDecoded(jwtDecode(token));
  }, []);
  const [decoded, setDecoded] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");

  const onClickHandler = () => {
    localStorage.removeItem("token");
    navigate("/sign-up");
  };
  const onIconClickHandler = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  // const token = localStorage.getItem("token");
  // const decoded = jwtDecode(token);
  return (
    <>
      <div className="flex flex-row justify-between mb-6 mt-3 items-center">
        <div className="flex ">
          <div className="flex justify-center mr-25 ml-5 cursor-pointer">
            <img src={icon} className="w-10 h-10 object-cover " alt="image" onClick={onIconClickHandler}/>
            <span className="text-3xl ">Helper.io</span>
          </div>
          <div className="cursor-pointer">
            <h1 className="text-3xl">Dashboard</h1>
            <p className="text-sm">{formattedDate}</p>
          </div>
        </div>

        <LogOut
          className="flex w-10 h-10 mr-5 cursor-pointer items-center"
          onClick={onClickHandler}
        />
      </div>
      <div className="flex flex-row bg-[#e7e8ff] w-[80%] ml-38 p-2 border-none rounded-4xl  justify-around items-center">
        <div className="flex flex-col  text-pink-950 bg-">
          <h1 className=" text-3xl mb-1">Hi,{decoded.username}</h1>
          <p className=" text-sm">
            Ready to start your learning with Helper?
          </p>{" "}
        </div>
        <img
          src={dashboard}
          className="w-[25%] h-[25%] object-cover "
          alt="image"
        />
      </div>
      <div className="flex justify-start flex-col mt-10">
        <p className="text-xl text-slate-500 ml-40">Topics</p>
        <div className="flex bg-slate justify-center gap-3">
          <div className="border-none bg-[#f4ad5e] text-white p-2 rounded-xl cursor-pointer" onClick={()=>{setCurrentTopic("aws")}}>
            AWS
          </div>
          <div className="border-none bg-[#032068] text-white p-2 rounded-xl cursor-pointer" onClick={()=>{setCurrentTopic("python")}}>
            Python
          </div>
          <div className="border-none bg-[#036819] text-white p-2 rounded-xl cursor-pointer" onClick={()=>{setCurrentTopic("dev-ops")}}>
            Dev-Ops
          </div>
          <div className="border-none text-slate-500 p-2 cursor-pointer">
            + Many more to come
          </div>
        </div>
      </div>
      
    </>
  );
};

export default Dashboard;
