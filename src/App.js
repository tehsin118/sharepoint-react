import React, { useState } from "react";
import { useAuth } from "./authProvider"; // Import the useAuth hook
import { Client } from "@microsoft/microsoft-graph-client"; // Graph Client

const App = () => {
  const { login, logout, user, accessToken } = useAuth();
  const [files, setFiles] = useState([]);

  // Set up the Microsoft Graph Client
  const graphClient = Client.init({
    authProvider: (done) => {
      done(null, accessToken); // Pass the access token to the Graph client
    },
  });

  // Fetch files from SharePoint
  const fetchFiles = async () => {
    if (!accessToken) {
      console.error("No access token available");
      return;
    }

    try {
      // Fetch files from the user's OneDrive or a specific SharePoint library
      const response = await graphClient
        .api("/me/drive/root/children") // For OneDrive files
        // .api("/sites/your-site-id/drives/your-drive-id/root/children") // For SharePoint site files
        .get();

      console.log("Files:", response.value);
      setFiles(response.value);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  return (
    <div>
      <h1>SharePoint Integration App</h1>

      {/* If user is not logged in, show login button */}
      {!user && <button onClick={login}>Login to SharePoint</button>}

      {/* If user is logged in, show logout button and user info */}
      {user && (
        <div>
          <p>Welcome, {user.username}</p>
          <button onClick={logout}>Logout</button>
          <p>Your Access Token: {accessToken}</p>

          {/* Button to fetch SharePoint files */}
          <button onClick={fetchFiles}>Fetch SharePoint Files</button>

          {/* Display fetched files */}
          <div>
            {files.length > 0 ? (
              <ul>
                {files.map((file) => (
                  <li key={file.id}>{file.name}</li>
                ))}
              </ul>
            ) : (
              <p>No files fetched yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
