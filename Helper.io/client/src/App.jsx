import React from "react";
import SignUp from "./components/SignUp";
import { Route, Routes } from "react-router-dom";
import SignIn from "./components/SignIn";
import { Toaster } from "react-hot-toast";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";


const App = () => {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="sign-up" element={<SignUp/>}/>
        <Route path="dashboard" element={<Dashboard/>}/>
        <Route path="sign-in" element={<SignIn/>}/>
      </Routes>
    </div>
    
  );
};

export default App;
