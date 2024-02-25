/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  let initial;
  try {
    initial = JSON.parse(localStorage.getItem("isAuthenticated")) || false;
  } catch (error) {
    console.error("Error retrieving isAuthenticated from localStorage:", error);
    initial = false;
  }
  const [isAuthenticated, setAuthenticated] = useState(initial);

  const handleSetAuthenticated = (newValue) => {
    if (typeof newValue === "boolean") {
      setAuthenticated(newValue);
    } else {
      console.error("Error: isAuthenticated must be set to a boolean value.");
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
    } catch (error) {
      console.error("Error setting isAuthenticated to localStorage:", error);
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setAuthenticated: handleSetAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  else return context;
};
