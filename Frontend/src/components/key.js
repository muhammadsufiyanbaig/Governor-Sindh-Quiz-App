import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Guidelines = () => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold mb-2">Exam Guidelines:</h3>
      <ul className="list-disc pl-5">
        <li>Time: 45 minutes</li>
        <li>In some questions, you can choose 1 or more answers.</li>
        <li>You can't minimize your full screen. If you do, your quiz will end.</li>
      </ul>
    </div>
  );
};

const Key = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    navigate("/login");
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsPopupOpen(false);
    document.documentElement.requestFullscreen().catch((e) => {
      console.log(e);
    });
    navigate("/quiz");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full md:w-1/2 lg:w-1/3">
            <Guidelines />
            <h2 className="text-lg font-bold mb-4">Enter Test Key:</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={inputValue}
                onChange={handleInputChange}
                className="w-full p-2 mb-4 border rounded"
                placeholder="Enter your test key here..."
              />
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