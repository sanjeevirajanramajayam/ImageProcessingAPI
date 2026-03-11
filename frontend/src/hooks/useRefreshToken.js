import React, { useContext } from "react";
import { authContext } from "./../context/AuthContext";
import axios from "../api/axios";

const useRefreshToken = () => {
  const { setAuth } = useContext(authContext);

  const refresh = async () => {
    const res = await axios.get("/refresh", { withCredentials: true });
    // while using axios.get you must set your server to allow 
    // only certain domains to send data with credentions
    // bank website -> credentitals
    // evil.com <- credentials
    // only allow bank website with credentials
    // console.log(res.data);
    setAuth((prev) => {
      console.log(`OLD ACCESS TOKEN ${prev.accessToken}`);
      console.log(`NEW ACCESS TOKEN ${res.data.accessToken}`);
      return { ...prev, accessToken: res.data.accessToken };
    });
    // console.log(res.data)
    return res?.data?.accessToken;
  };

  return refresh;
};

export default useRefreshToken;
