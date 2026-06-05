import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useToast, ToastContainer } from "../hooks/useToast";
import { validateEmail, validatePassword, validateUsername } from "../utils/validation";

function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerPayload, setRegisterPayload] = useState({
    username: "",
    password: "",
    email: "",
  });
  const navigate = useNavigate();
  const { toasts, showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const usernameError = validateUsername(registerPayload.username);
    if (usernameError) {
      showToast(usernameError, "error");
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(registerPayload.email)) {
      showToast("Please provide a valid email address", "error");
      setIsSubmitting(false);
      return;
    }

    const passwordError = validatePassword(registerPayload.password);
    if (passwordError) {
      showToast(passwordError, "error");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("/register", registerPayload);
      showToast("Registration successful! Redirecting to login...", "success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      showToast(errorMsg, "error");
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="h-screen">
      <div className="flex flex-col gap-4 justify-center items-center h-full">
        <div className="border p-5 w-1/4">
          <div className="text-lg my-1 text-center">Register</div>
          <form onSubmit={handleSubmit}>
            <p>Username</p>
            <input
              type="text"
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
              disabled={isSubmitting}
              className="bg-black text-white p-2 w-full my-4 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
            <p>
              <NavLink to="/login">Have an account? Login...</NavLink>
            </p>
          </form>
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default Register;
