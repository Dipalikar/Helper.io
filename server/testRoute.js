import axios from "axios";

async function testRoute() {
  try {
    const response = await axios.post("http://localhost:5000/api/forgot-password", {
      email: "test@example.com"
    });
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.status : error.message);
    if (error.response) {
      console.error("Data:", error.response.data);
    }
  }
}

testRoute();
