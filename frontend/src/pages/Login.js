import { useContext, useState } from "react";
import { authContext } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import loadContext from "../context/LoadingContext";
import { useToast, ToastContainer } from "../hooks/useToast";
import { validateEmail } from "../utils/validation";

function Login() {
  const [loginPayload, setLoginPayload] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const { auth, setAuth } = useContext(authContext);
  const { loading, setLoading } = useContext(loadContext);
  const { toasts, showToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateEmail(loginPayload.email)) {
      showToast("Please provide a valid email address", "error");
      setIsSubmitting(false);
      return;
    }

    if (!loginPayload.password) {
      showToast("Password is required", "error");
      setIsSubmitting(false);
      return;
    }

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

      if (res.status !== 200) {
        const data = await res.json();
        showToast(data.message || "Login failed", "error");
      } else {
        res = await res.json();

        setAuth((p) => {
          return { ...p, accessToken: res.accessToken };
        });

        showToast("Login successful!", "success");
        navigate("/images");
      }
    } catch (err) {
      showToast("Login error. Please try again.", "error");
      console.error(err);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="h-screen">
      <div className="flex flex-col gap-4 justify-center items-center h-full">
        {loading ? (
          <p>Loading...</p>
        ) : (
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
                  setLoginPayload({
                    ...loginPayload,
                    password: e.target.value,
                  });
                }}
              />
              <button
                disabled={isSubmitting}
                className="bg-black text-white p-2 w-full my-4 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
              <p>
                <NavLink to="/register">
                  Don't have an account? Register...
                </NavLink>
              </p>
            </form>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default Login;
