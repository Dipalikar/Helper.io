import React from "react";
import SignUp from "./components/SignUp";
import { Route, Routes } from "react-router-dom";
import SignIn from "./components/SignIn";
import { Toaster } from "react-hot-toast";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import Topics from "./components/Topics";
import AccountSettings from "./components/AccountSettings";
import MyNotes from "./components/MyNotes";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

const App = () => {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="sign-up" element={<SignUp/>}/>
        <Route path="dashboard" element={<Dashboard/>}/>
        <Route path="topics" element={<Topics/>}/>
        <Route path="topics/:topic" element={<Topics/>}/>
        <Route path="topics/:topic/:file" element={<Topics/>}/>
        <Route path="notes" element={<MyNotes/>}/>
        <Route path="notes/:noteTitle" element={<MyNotes/>}/>
        <Route path="sign-in" element={<SignIn/>}/>
        <Route path="forgot-password" element={<ForgotPassword/>}/>
        <Route path="reset-password/:token" element={<ResetPassword/>}/>
        <Route path="settings" element={<AccountSettings/>}/>
      </Routes>
    </div>
  );
};

export default App;
