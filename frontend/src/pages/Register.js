import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "../api/axios";

function Register() {
  const [errMesg, setErr] = useState("");
  const [registerPayload, setRegisterPayload] = useState({
    username: "",
    password: "",
    email: "",
  });
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post("/register", registerPayload);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      setErr(err)
    }
    navigate('/login')
  };

  return (
    <div className="h-screen">
      <div className="flex flex-col gap-4 justify-center items-center h-full">
        {errMesg !== "" && (
          <div className="border border-red-800 w-1/4 p-3">
            <p className="text-red-600">{"Error : " + errMesg}</p>
          </div>
        )}
        <div className="border p-5 w-1/4">
          <div className="text-lg my-1 text-center ">Register</div>
          <form onSubmit={handleSubmit}>
            <p>Username</p>
            <input
              type="te"
              className="border border-black h-10 w-full p-2 my-2"
              value={registerPayload.username}
              onChange={(e) => {
                setRegisterPayload({
                  ...registerPayload,
                  username: e.target.value,
                });
              }}
              required
            />
            <p>Email</p>
            <input
              type="email"
              className="border border-black h-10 w-full p-2 my-2"
              value={registerPayload.email}
              onChange={(e) => {
                setRegisterPayload({
                  ...registerPayload,
                  email: e.target.value,
                });
              }}
              required
            />
            <p>Password</p>
            <input
              className="border border-black h-10 w-full p-2 my-2"
              type="password"
              value={registerPayload.password}
              onChange={(e) => {
                setRegisterPayload({
                  ...registerPayload,
                  password: e.target.value,
                });
              }}
              required
            />
            <button
              className="bg-black text-white p-2 w-full my-4"
              type="submit"
            >
              Register
            </button>
            <p>
              <NavLink to="/login">Have an account? Login...</NavLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
