import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
const Guidelines = () => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold mb-2">Exam Guidelines:</h3>
      <ul className="list-disc pl-5">
        <li>Time: 45 minutes</li>
        <li>In some questions, you can choose 1 or more answers.</li>
        <li>
          You can't minimize your full screen. If you do, your quiz will end.
        </li>
      </ul>
    </div>
  );
};

const Key = () => {
  const [show, setShow] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userId =  localStorage.getItem('userId');
  // console.log(userId);
  
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    navigate("/login");
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    try {
      const response = await axios.post("http://localhost:5001/testkey", {
        key: inputValue,
        userId
      });
      if (response.data.success) {
        setIsPopupOpen(false);
        document.documentElement.requestFullscreen().catch((e) => {
          console.log(e);
        });
        navigate("/quiz");
      } else {
        setError("Wrong Key");
      }
    } catch (error) {
      setError("An error occurred while validating the key. Please try again.");
      console.error(error);
    }
  };
  const togglePasswordVisibility = () => {
    setShow(!show);
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full md:w-1/2 lg:w-1/3">
            <Guidelines />
            <h2 className="text-lg font-bold mb-4">Enter Test Key:</h2>
            <form onSubmit={handleSubmit}>
              <div className="my-5 relative">
                <input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  className="block w-full px-3 border-2 border-gray-500 py-1.5 text-gray-900 sm:text-sm"
                  value={inputValue}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 mt-3 mr-3"
                  onClick={togglePasswordVisibility}
                >
                  {!show ? (
                    <FiEyeOff className="text-green-500" />
                  ) : (
                    <FiEye className="text-green-500" />
                  )}
                </button>
              </div>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleClosePopup}
                  className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Key;
