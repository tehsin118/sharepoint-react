import React, { createContext, useContext, useState, useEffect } from "react";
import { PublicClientApplication } from "@azure/msal-browser";

// MSAL configuration

const msalConfig = {
  auth: {
    clientId: "dd6f3971-a714-442f-8a6c-80fbc1cb1b61", // Replace with your App's Client ID
    authority:
      "https://login.microsoftonline.com/5f4ee553-cbb6-4aad-80c0-3b756a05ea9b", // Replace with your Tenant ID
    // authority:
    //   "https://login.microsoftonline.com/common", // Replace with your Tenant ID
    redirectUri: "http://localhost:3000",
  },
};
// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Create an Authentication Context
const AuthContext = createContext();

// Create AuthProvider to use in your app
export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null); // Store access token
  const [user, setUser] = useState(null); // Store user info
  const [isMsalInitialized, setMsalInitialized] = useState(false); // Track MSAL initialization

  // Initialize MSAL instance on mount
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize(); // Initialize MSAL instance
        setMsalInitialized(true); // Flag as initialized
      } catch (error) {
        console.error("MSAL initialization error:", error);
      }
    };
    initializeMsal();
  }, []);

  // Login function
  const login = async () => {
    if (!isMsalInitialized) {
      console.error("MSAL is not initialized yet.");
      return;
    }

    try {
      const loginRequest = {
        scopes: ["Files.Read", "Sites.Read.All", "Sites.Manage.All"], // Request access to SharePoint files
      };
      // Perform login using popup
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      const tokenResponse = await msalInstance.acquireTokenSilent({
        account: loginResponse.account,
        scopes: loginRequest.scopes,
      });
      console.log(tokenResponse);
      // Save access token and user info
      setAccessToken(tokenResponse.accessToken);
      setUser(loginResponse.account);
      console.log("Token acquired:", tokenResponse.accessToken);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Logout function
  const logout = () => {
    if (!isMsalInitialized) {
      console.error("MSAL is not initialized yet.");
      return;
    }

    msalInstance.logout();
    setAccessToken(null);
    setUser(null);
  };

  // Provide the login, logout, and token to the whole app
  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext in any component
export const useAuth = () => {
  return useContext(AuthContext);
};
