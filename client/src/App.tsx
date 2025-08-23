// src/App.tsx
import React from "react";
import { protectedRoutes, publicRoutes } from "./app/routes";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useValidateUserQuery } from "./features/userApi";

const App: React.FC = () => {
   const { data, isLoading, error } = useValidateUserQuery();
   const isAuthenticated = error ? false : !!data?.authToken;
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