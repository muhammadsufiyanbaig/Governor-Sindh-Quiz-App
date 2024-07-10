import React from "react";
import Quiz from "./components/Quiz";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/Signup";
import Key from "./components/key";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="testkey" element={<Key />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="quiz" element={<Quiz />} />
      </Routes>
    </div>
  );
};

export default App;
