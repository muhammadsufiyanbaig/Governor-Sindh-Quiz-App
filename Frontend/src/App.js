import React from "react";
import { Routes, Route } from "react-router-dom";
import Quiz from "./components/Quiz";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/Signup";
import Key from "./components/key";
import ProtectedRoute from "./ProtectedRoutes/ProtectedRoute";
import { AuthProvider } from "./ProtectedRoutes/AuthContext";
import FacultyPortal from "./components/Faculty/auth/facultyPortal";
import FacultyLogin from "./components/Faculty/auth/facultyLogin";
import FacultySignup from "./components/Faculty/facultySignup";
import FacultyprotectedRoute from "./ProtectedRoutes/FacultyProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route
          path="testkey"
          element={
            <ProtectedRoute>
              <Key />
            </ProtectedRoute>
          }
        />
        <Route
          path="quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="faculty"
          element={
            <FacultyprotectedRoute>
              <FacultyPortal />
            </FacultyprotectedRoute>
          }
        />
        <Route path="facultylogin" element={<FacultyLogin />} />
        <Route path="facultysignup" element={<FacultySignup />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
