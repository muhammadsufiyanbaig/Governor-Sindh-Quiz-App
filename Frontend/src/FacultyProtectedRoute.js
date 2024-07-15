// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const FacultyprotectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('FacultyId'); // Check if the faculty ID is in local storage

  return isAuthenticated ? children : <Navigate to="/facultylogin" />;
};

export default FacultyprotectedRoute;
