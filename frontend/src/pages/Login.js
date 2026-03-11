import { useContext, useState } from "react";
import { authContext } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";

function Login() {
  const [loginPayload, setLoginPayload] = useState({ email: "", password: "" });
  const [errMesg, setErrMesg] = useState("");

  const navigate = useNavigate();

  const { auth, setAuth } = useContext(authContext);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      let res = await fetch("http://localhost:4000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginPayload.email,
          password: loginPayload.password,
        }),
      });

      res = await res.json();

      setAuth((p) => {
        return { ...p, accessToken: res.accessToken };
      });

      if (res.status !== 200) {
        setErrMesg("Login Failed!");
      }

      navigate("/images");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="h-screen">
      <div className="flex flex-col gap-4 justify-center items-center h-full">
        {errMesg !== "" && (
          <div className="border border-red-800 w-1/4 p-3">
            <p className="text-red-600">{"Error : " + errMesg}</p>
          </div>
        )}
        <div className="border p-5 w-1/4">
          <div className="text-lg my-1 text-center ">Login</div>
          <form onSubmit={handleSubmit}>
            <p>Email</p>
            <input
              type="email"
              className="border border-black h-10 w-full p-2 my-2"
              value={loginPayload.email}
              onChange={(e) => {
                setLoginPayload({ ...loginPayload, email: e.target.value });
              }}
              required
            />
            <p>Password</p>
            <input
              className="border border-black h-10 w-full p-2 my-2"
              type="password"
              value={loginPayload.password}
              onChange={(e) => {
                setLoginPayload({ ...loginPayload, password: e.target.value });
              }}
            />
            <button
              className="bg-black text-white p-2 w-full my-4"
              type="submit"
            >
              Login
            </button>
            <p>
              <NavLink to='/register'>Don't have an account? Register...</NavLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
