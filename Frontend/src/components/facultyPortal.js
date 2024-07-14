import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HamburgerIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrossIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FacultyPortal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState('');
  const [faculty, setFaculty] = useState(null);

  const fetchKey = async () => {
    try {
      const response = await axios.get('http://localhost:5001/testkey');
      setCurrentKey(response.data.initialKey);
    } catch (error) {
      console.error('Error fetching the key:', error);
    }
  };

  const fetchFaculty = async () => {
    const storedFacultyId = localStorage.getItem('FacultyId');
    console.log(storedFacultyId);
    if (storedFacultyId) {
      try {
        const response = await axios.post(`http://localhost:5001/faculty`, { id: storedFacultyId }, { withCredentials: true });
        console.log(response);
        setFaculty(response.data);
      } catch (error) {
        console.error('Error fetching faculty data:', error);
      }
    }
  };

  useEffect(() => {
    fetchKey();
    fetchFaculty();

    const interval = setInterval(() => {
      fetchKey();
      fetchFaculty();
    }, 60 * 60 * 1000); //1 hour

    return () => clearInterval(interval);
  }, []);

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Mobile Navbar */}
      <div className="bg-gray-800 text-white flex justify-between items-center p-4 ">
        <button 
          className="text-white hover:text-gray-300 focus:outline-none"
          onClick={handleToggleMenu}
        >
          {isOpen ? <CrossIcon /> : <HamburgerIcon />}
        </button>
        <h1 className='font-bold text-xl'>Faculty Portal</h1>
        <div></div>
      </div>

      {/* Side Menu */}
      <div className={`fixed inset-y-0 left-0 bg-gray-800 text-white w-64 p-4 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button 
          className="absolute top-2 right-2 text-white hover:text-gray-300 focus:outline-none"
          onClick={handleToggleMenu}
        >
          <CrossIcon />
        </button>
        <h2 className="text-xl font-bold mb-4">Teacher Details</h2>
        {faculty ? (
          <>
            <p><strong>Name:</strong> {faculty.fullname}</p>
            <p><strong>Email:</strong> {faculty.email}</p>
            <p><strong>Qauter:</strong> {faculty.qauter}</p>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <h1 className='font-bold text-4xl mb-4'><strong className='font-black'>Current Key:</strong> {currentKey}</h1>
      </div>
    </div>
  );
};

export default FacultyPortal;
