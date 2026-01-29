import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CreditCardForm from './CreditCardForm';
import UserProfile from './UserProfile';
import AboutUs from './AboutUs';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || 'User';
  
  const [activeSection, setActiveSection] = useState('creditCard');

  const handleLogout = () => {
    navigate('/');
  };

  const menuItems = [
    { id: 'creditCard', icon: '💳', label: 'Add Credit Card' },
    { id: 'userProfile', icon: '👤', label: 'User Profile' },
    { id: 'aboutUs', icon: 'ℹ️', label: 'About Us' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-white text-xl font-bold">Zapia Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {username}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-[calc(100vh-4rem)]">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition duration-300 ${
                      activeSection === item.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeSection === 'creditCard' && <CreditCardForm />}
          {activeSection === 'userProfile' && <UserProfile />}
          {activeSection === 'aboutUs' && <AboutUs />}


        </div>
      </div>
    </div>
  );
};

export default HomePage;