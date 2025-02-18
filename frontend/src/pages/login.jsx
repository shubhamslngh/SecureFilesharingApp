import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleRegister=()=>{return navigate("/register")}
  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/login/", {
        username: email,
        password,
      });
      console.log("Login response:", response.data);
      dispatch(loginSuccess(response.data));
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert("Login failed!");
    }
  };

  return (
    <div className="flex flex-col w-screen items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input
        className="mb-2 p-2 border"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="mb-2 p-2 border"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="px-4 m-2 py-2 bg-sky-500 hover:bg-sky-700 duration-100 ease-in hover:scale-105 transition-3s text-white rounded"
        onClick={handleLogin}>
        Login
      </button>
      <button
        className="px-4 m-2 py-2 bg-sky-500 hover:bg-sky-700 duration-100 ease-in hover:scale-105 transition-3s text-white rounded"
        onClick={handleRegister}>
        Register
      </button>
    </div>
  );
};

export default Login;
