import { useState } from "react";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin=()=>{return window.location.href="/"}
    const handleRegister = async () => {
        if (!username || !email || !password) {
            alert("All fields are required");
        
        }
        else {
            try {
                const response = await axios.post("http://localhost:8000/api/register/", {
                    username,
                    email,
                    password,
                });
                if (response.status === 200) {
                    alert("Register success!");
                    return window.location.href = "/login";
                }
    
            } catch (error) {
                console.error("Register error:", error.response?.data || error.message);
                alert("Register failed!");
            }
        }
    };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <input
        type="text"
        placeholder="Username"
        className="mb-2 p-2 border"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        className="mb-2 p-2 border"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="mb-2 p-2 border"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="px-4 m-2 py-2 bg-sky-500 hover:bg-sky-700 duration-300 ease-in hover:scale-105 transition-3s text-white rounded"
        onClick={handleRegister}>
        Register
      </button>
      <button
        className="px-4 m-2 py-2 bg-sky-500 hover:bg-sky-700 duration-300 ease-in hover:scale-105 transition-3s text-white rounded"
        onClick={handleLogin}>
        Already have an account ? Login
      </button>
    </div>
  );
};

export default Register;
