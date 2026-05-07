import React from 'react'
import landing_page from '../assets/landing_page.svg'
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {

    const navigate=useNavigate()

    const openSignIn = () => {
    navigate("/sign-in");
  };

  const openSignUp = () => {
    navigate("/sign-up");
  };

  return (
    <>
    <div className="flex flex-col lg:flex-row min-h-screen">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-white p-6 md:p-10 text-center lg:text-left lg:items-start lg:pl-20">
            <h1 className='text-4xl md:text-6xl font-bold text-[#032068] tracking-tight'>
                Helper.io is here!
            </h1>
            <h2 className='text-3xl md:text-5xl font-semibold text-slate-800'>
                Want to De-clutter?
            </h2>
            <p className="text-base md:text-xl text-slate-500 max-w-md">
                Get everything in a single place. Your personal learning assistant.
            </p>
            <div className='flex flex-col sm:flex-row justify-center lg:justify-start mt-6 w-full lg:w-[70%] gap-4'>
                <button className='bg-[#2bb65e] hover:bg-[#249e51] text-white font-bold py-4 px-8 rounded-2xl cursor-pointer transition-all hover:scale-105 shadow-lg flex-1' onClick={openSignIn}>Log in</button>
                <button className='bg-[#f09b00] hover:bg-[#d98c00] text-white font-bold py-4 px-8 rounded-2xl cursor-pointer transition-all hover:scale-105 shadow-lg flex-1' onClick={openSignUp}>Sign up</button>
            </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-slate-50 p-6 lg:p-0">
                <img
                  src={landing_page}
                  className="w-full max-w-2xl lg:max-w-none lg:h-full lg:w-full object-contain lg:object-cover animate-float"
                  alt="Helper.io Illustration"
                />
              </div>
        
    </div>
    </>
  )
}

export default LandingPage