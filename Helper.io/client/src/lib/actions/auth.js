import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";



export const signUpFunc = async (sanitizedForm,navigate) => {
  try {
    const { data } = await axios.post(
      "http://localhost:5000/api/sign-up",
      sanitizedForm,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return data
  } catch (error) {
    console.log("Error:", error);

    // THIS IS THE FIX: Access error.response.data for backend error messages
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage =
        error.response.data?.message || "An error occurred during sign up";
      toast.error(errorMessage);
      console.log("Error response:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      toast.error("No response from server. Please check your connection.");
      console.log("Error request:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error("An error occurred. Please try again.");
      console.log("Error message:", error.message);
    }
  }
};

export const signInFunc = async (sanitizedForm,navigate) => {
  const existingToken = localStorage.getItem("token");
  
  if (existingToken) {
    // Optional: verify token with backend
     navigate("/dashboard");
  }
  try {
    const { data } = await axios.get("http://localhost:5000/api/sign-in", {
      params: sanitizedForm, // <-- SENDS DATA
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(data);
     if (data.success) {
      localStorage.setItem("token", data.token);
      // Redirect to dashboard
      return data
      
    } else {
      // console.log(data);
      toast.error(data.message);
      // console.log("Response data:", data);
    }
    
  } catch (error) {
    console.log(error)
    toast.error(error.response.data.message);
  }
};
