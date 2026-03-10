import { privateAxios } from "../api/axios";
import { authContext } from "../context/AuthContext";
import { useContext, useEffect, useRef } from "react";
import useRefreshToken from "./useRefreshToken";

const useAxiosPrivate = () => {
  const { auth, setAuth } = useContext(authContext);
  const refresh = useRefreshToken();

  useEffect(() => {
    console.log(auth);
  }, [auth]);

  useEffect(() => {
    const reqInterceptors = privateAxios.interceptors.request.use(
      (config) => {
        console.log(auth);
        console.log(auth?.accessToken);
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${auth?.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    const resInterceptors = privateAxios.interceptors.response.use(
      (response) => response,
      async (error) => {
        let prevRequest = error?.config;
        if (error?.response?.status == 403 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const accessToken = await refresh();
          prevRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          return privateAxios(prevRequest);
        }
        return Promise.reject(error); // any other error it goes to ui in catch block
      },
    );

    return () => {
      privateAxios.interceptors.response.eject(resInterceptors);
      privateAxios.interceptors.request.eject(reqInterceptors);
    };
  }, [auth, refresh]);

  return privateAxios;
};

export default useAxiosPrivate;
