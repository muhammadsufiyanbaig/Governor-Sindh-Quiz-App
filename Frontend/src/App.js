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
import NoPage from "./components/NoPage";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="auth" element={<Login />} />
        <Route path="auth/login" element={<Login />} />
        <Route path="auth/signup" element={<SignUp />} />
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
          path="faculty/portal"
          element={
            <FacultyprotectedRoute>
              <FacultyPortal />
            </FacultyprotectedRoute>
          }
        />
        <Route path="*" element={<NoPage />} />
        <Route path="faculty" element={<FacultyLogin />} />
        <Route path="faculty/auth" element={<FacultyLogin />} />
        <Route path="faculty/auth/login" element={<FacultyLogin />} />
        <Route path="faculty/auth/signup" element={<FacultySignup />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
