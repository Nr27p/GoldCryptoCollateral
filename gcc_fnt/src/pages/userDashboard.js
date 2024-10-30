import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { authCheck, logout } from '../components/apiRoutes';
import '../index.css';

const UserDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true); // Loading state added

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const response = await axios.get(authCheck, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          // Check response here
          if (response.data.isAuthenticated) {
            setIsAuthenticated(true);
            setUsername(response.data.user.username);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error.message);
      } finally {
        setLoading(false); // Set loading to false after auth check
      }
    };
    checkAuthentication();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(logout);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  // If still loading, prevent redirect
  if (loading) {
    return <div>Loading...</div>; // Display loading or spinner here
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome, <span className="text-indigo-600">{username}!</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Follow the steps below to buy gold or take a loan.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={handleLogout}
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600"
            >
              Logout
            </button>
            <Link to="/buy-gold">
              <button className="text-sm font-semibold leading-6 text-gray-900">
                Buy Gold Token
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
