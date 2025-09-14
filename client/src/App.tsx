// src/App.tsx
import React, { useEffect } from "react";
import { protectedRoutes, publicRoutes } from "./app/routes";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useValidateUserQuery } from "./features/userApi";
import { disconnectSocket, initSocket } from "./utils/socket";

const App: React.FC = () => {
  const { data, isLoading, error } = useValidateUserQuery();
  const isAuthenticated = error ? false : !!data?.authToken;
  useEffect(() => {
    if (isAuthenticated && data?.user?._id) {
      console.log("Attempting to initialize socket...");
      initSocket(data.user._id);

      // 🧹 Cleanup function
      return () => {
        console.log("Cleaning up socket connection...");
        disconnectSocket();
      };
    } else {
      console.log(
        "User not authenticated or data not available. Disconnecting socket."
      );
      disconnectSocket();
    }
  }, [isAuthenticated, data?.user?._id]); // Add data?.user?._id to dependencies

  if (!isLoading) {
    return (
      <Router>
        <Routes>
          {(isAuthenticated ? protectedRoutes : publicRoutes).map(
            ({ path, element }, ind) => {
              return (
                <Route
                  key={path}
                  path={path}
                  index={ind == 0}
                  element={element}
                />
              );
            }
          )}

          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to={"/"} />
              ) : (
                <Navigate to={"/login"} />
              )
            }
          />
        </Routes>
      </Router>
    );
  }
};

export default App;
