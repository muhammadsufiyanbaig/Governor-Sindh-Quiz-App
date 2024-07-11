import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const Quiz = () => {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState([]);
  const [currQuesNo, setCurrQuesNo] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [quizEnded, setQuizEnded] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [userResponses, setUserResponses] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState();

  useEffect(() => {
    fetchQuizData();
    // eslint-disable-next-line
  }, []);

  const fetchQuizData = async () => {
    try {

      const response = await axios.get("http://localhost:5001/quiz", {
        withCredentials: true,
      });
      const data = response.data.questions;
      setQuizData(data);

      const startTime = new Date(response.data.timestamp).getTime();
      startTimer(startTime);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    }
  };

  const startTimer = (startTime) => {
    const duration = 45 * 60 * 1000;
    const endTime = startTime + duration;

    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        clearInterval(timerInterval);
        setQuizEnded(true);
      } else {
        setRemainingTime(distance);
      }
    }, 1000);
  };

  const nextQuestion = () => {
    setErrorMessage("");
    const userAns = Array.from(
      document.querySelectorAll("input[name=option]:checked")
    ).map((input) => input.value);

    if (userAns.length === 0) {
      setErrorMessage("Please select an option.");
      return;
    }

    setUserResponses((prevResponses) => [
      ...prevResponses,
      { questionId: quizData[currQuesNo].id, userAnswer: userAns },
    ]);

    const inputFields = document.querySelectorAll(
      "input[name=option]:checked"
    );
    inputFields.forEach((inputField) => {
      inputField.checked = false;
    });

    if (currQuesNo < quizData.length - 1) {
      setCurrQuesNo(currQuesNo + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const previousQuestion = () => {
    if (currQuesNo > 0) {
      setCurrQuesNo((prev) => prev - 1);
    }
  };

  const endQuiz = () => {
    navigate("/login");
    document.cookie.replace("token", "");
    localStorage.clear();
  };

  useEffect(() => {
    const storedAnswers = localStorage.getItem(`answers_${currQuesNo}`);
    if (storedAnswers) {
      const parsedAnswers = JSON.parse(storedAnswers);
      parsedAnswers.forEach((answer) => {
        const input = document.getElementById(answer);
        if (input) {
          input.checked = true;
        }
      });
    }
  }, [currQuesNo]);

  useEffect(() => {
    if (quizCompleted) {
      submitAllAnswers();
    }
    // eslint-disable-next-line
  }, [quizCompleted]);

  const submitAllAnswers = async () => {
    const user =  localStorage.getItem('userId');
    try {
      const response = await axios.post("http://localhost:5001/quiz", {
        userResponses,
        user
      });
      if (response.data.success) {
        setQuizEnded(true);
        setScore(response.data.score);
      } else {
        console.error("Error submitting all answers:", response.data.error);
      }
    } catch (error) {
      console.error("Error submitting all answers:", error);
    }
  };
  
  const formatTime = (ms) => {
    let minutes = Math.floor(ms / (1000 * 60));
    let seconds = Math.floor((ms % (1000 * 60)) / 1000);
    seconds = seconds > 9 ? seconds : `0${seconds}`;
    minutes = minutes > 9 ? minutes : `0${minutes}`;
    return `${minutes}:${seconds}`;
  };

  const getFullScreenElement = () => {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullscreenElement ||
      document.msFullscreenElement
    );
  };

  const checkFullscreen = () => {
    if (!getFullScreenElement()) {
      navigate('/testkey');
    }
  };
  const handleKeyDown = (event) => {
    const { key, shiftKey, ctrlKey, altKey, metaKey } = event;

    if (
      key === "Escape" ||
      shiftKey ||
      ctrlKey ||
      altKey ||
      metaKey ||
      key === "Esc"
    ) {
      navigate("/testkey");
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    document.addEventListener("mozfullscreenchange", checkFullscreen);
    document.addEventListener("msfullscreenchange", checkFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
      document.removeEventListener("mozfullscreenchange", checkFullscreen);
      document.removeEventListener("msfullscreenchange", checkFullscreen);
    };
     // eslint-disable-next-line
  }, []);
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="mb-4 text-center">
        <p className="text-green-500 font-bold text-4xl text-end pr-5">
          {formatTime(remainingTime)}
        </p>
      </div>
      <div className="flex justify-center items-center pt-16 lg:pt-28">
        {!quizEnded && (
          <div className="bg-white px-3 py-4 w-full md:w-1/2 lg:w-1/3 shadow-lg rounded-lg">
            <h1 className="text-green-500 text-center font-bold text-3xl mb-6">
              Question
            </h1>

            {quizData.length > currQuesNo && quizData[currQuesNo] && (
              <div>
                <div id="question" className="text-center mb-6">
                  <h3 className="font-bold text-2xl ">
                    <b>{quizData[currQuesNo].question}</b>
                  </h3>
                </div>
                <div id="box" className="flex flex-col mb-6">
                  <div id="options">
                    {quizData[currQuesNo].options.map((option, index) => (
                      <div key={index} className="space-x-2 mb-2">
                        <input
                          type={
                            quizData[currQuesNo].answersQuantity === "multiple"
                              ? "checkbox"
                              : "radio"
                          }
                          name="option"
                          value={option}
                          id={option}
                        />
                        <label className="cursor-pointer" htmlFor={option}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-red-600 font-bold text-xl text-center">
                    {errorMessage}
                  </p>
                </div>
                <div className={`flex items-center justify-between`}>
                  <button
                    className={
                      currQuesNo === 0
                        ? "invisible"
                        : " text-gray-700 bg-gray-200 hover:bg-gray-300 px-4 text-left py-2 rounded"
                    }
                    onClick={previousQuestion}
                  >
                    Back
                  </button>
                  <button
                    className="bg-green-500 hover:bg-green-600 font-bold text-white px-4 text-left py-2 rounded"
                    onClick={nextQuestion}
                  >
                    {currQuesNo === quizData.length - 1 ? "Finish" : "Next"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {quizEnded && (
          <div className="bg-white items-center px-3 py-4 w-full md:w-1/2 lg:w-1/3 shadow-lg rounded-lg">
            <h1 className="text-center text-xl font-bold text-green-500">
              Your Score: {score}/{quizData.length}
            </h1>
            <div className="flex justify-center">
              <button
                className="bg-green-500 mt-10 font-bold text-white px-4 text-left py-2 rounded"
                onClick={endQuiz}
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;

