import { createContext, useEffect, useState } from "react";

const loadContext = createContext({});

export const LoadProvdier = ({ children }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(loading);
  }, [loading]);

  return (
    <loadContext.Provider value={{ loading, setLoading }}>
      {children}
    </loadContext.Provider>
  );
};

export default loadContext;
