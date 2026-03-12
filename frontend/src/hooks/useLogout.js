import React, { useContext, useEffect } from "react";
import { authContext } from "../context/AuthContext";
import axios from "../api/axios";

const useLogout = () => {
  const { setAuth } = useContext(authContext);
  const logout = async () => {
    setAuth({});
    try {
      await axios.get("/logout", { withCredentials: true });
    } catch (err) {
      console.error(err);
    }
  };
  return logout;
};

export default useLogout;
