
import React from 'react';
import { Navigate } from 'react-router-dom';

const FacultyprotectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('FacultyId'); 

  return isAuthenticated ? children : <Navigate to="/faculty/auth/login" />;
};

export default FacultyprotectedRoute;
