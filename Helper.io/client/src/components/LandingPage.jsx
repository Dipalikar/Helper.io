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
    <div className="flex flex-row h-screen">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-white p-10">
            <h1 className='text-4xl font-semibold'>Helper.io is here!</h1>
            <h1 className='text-4xl font-semibold'>Want to De-clutter?</h1>
            <p className="text-sm text-slate-500">Get everything in a single place</p>
            <div className=' flex justify-between mt-2 w-[50%] gap-2 '>
                <button className='bg-[#2bb65e] text-white  text-green p-2 w-[50%] rounded-4xl  cursor-pointer'onClick={openSignIn}>Log in</button>
                <button className='bg-[#f09b00] text-white  text-green p-2 w-[50%] rounded-4xl cursor-pointer' onClick={openSignUp}>Sign up</button>
            </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-gray-100">
                <img
                  src={landing_page}
                  className="h-full w-full object-cover"
                  alt="image"
                />
              </div>
        
    </div>
    </>
  )
}

export default LandingPage