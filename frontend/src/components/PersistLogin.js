import { Outlet } from "react-router";
import useRefreshToken from "../hooks/useRefreshToken";

import React, { useContext, useEffect, useState } from "react";
import { authContext } from "../context/AuthContext";

const PersistLogin = () => {
  const [isLoading, setLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth } = useContext(authContext);
  useEffect(() => {
    const refreshToken = async () => {
      try {
        await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    !auth?.accessToken ? refreshToken() : setLoading(false);
  }, []);
  return isLoading ? <p>Loading</p> : <Outlet />;
};

export default PersistLogin;
