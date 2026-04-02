import React from "react";
import icon from "../assets/icon.svg";
import chat_icon from "../assets/chat-bot.svg";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NavBar = ({ toggleChatSidebar }) => {
  const navigate = useNavigate();
  const onClickHandler = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const now = new Date(Date.now());
  
    const formattedDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="flex flex-row justify-between mb-3 mt-3 items-center">
      <div className="flex ">
        <div className="flex justify-center mr-25 ml-5 cursor-pointer">
          <img
            src={icon}
            className="w-10 h-10 object-cover "
            alt="image"
            onClick={onClickHandler}
          />
          <span className="text-3xl ">Helper.io</span>
        </div>
        <div className="cursor-pointer">
          <h1 className="text-3xl">Dashboard</h1>
          <p className="text-sm">{formattedDate}</p>
        </div>
      </div>
      <div className="flex flex-row justify-between gap-2">
        <img
          src={chat_icon}
          className="flex w-11 h-11  cursor-pointer items-center transition-transform hover:scale-105"
          alt="image"
          onClick={toggleChatSidebar}
        />
        <LogOut
          className="flex w-11 h-11 mr-5 cursor-pointer items-center"
          onClick={onClickHandler}
        />
      </div>
    </div>
  );
};

export default NavBar;
