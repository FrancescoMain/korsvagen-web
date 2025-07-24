import React from "react";
import { AuthProvider as AuthContextProvider } from "../../contexts/AuthContext";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <AuthContextProvider>{children}</AuthContextProvider>;
};
