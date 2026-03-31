import { privateAxios } from "../api/axios";
import { authContext } from "../context/AuthContext";
import { useContext, useEffect, useRef } from "react";
import useRefreshToken from "./useRefreshToken";
import loadContext from "../context/LoadingContext";

const useAxiosPrivate = () => {
  const { auth, setAuth } = useContext(authContext);
  const { loading, setLoading } = useContext(loadContext)
  const refresh = useRefreshToken();

  useEffect(() => {
    console.log(auth);
  }, [auth]);

  useEffect(() => {
    const reqInterceptors = privateAxios.interceptors.request.use(
      (config) => {
        console.log("ADD ACCESS TOKEN FOR REQUEST")
        console.log(auth?.accessToken);
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${auth?.accessToken}`;
        }
        setLoading(true);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    const resInterceptors = privateAxios.interceptors.response.use(
      (response) => {
        setLoading(false)
        return response
      },
      async (error) => {
        let prevRequest = error?.config;
        if (error?.response?.status == 403 && !prevRequest?.sent) {
          console.log("ACCESS TOKEN EXIPRED")
          prevRequest.sent = true;
          const accessToken = await refresh();
          prevRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          console.log(`NEW ACCESS TOKEN ${accessToken}`)
          setLoading(false)
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
