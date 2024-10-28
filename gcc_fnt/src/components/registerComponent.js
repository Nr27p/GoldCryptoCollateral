import React, { useState } from 'react';
import axios from 'axios';
import { registerRoute } from './apiRoutes';

const Register = () => {
  const [userExistsMessage, setUserExistsMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userData = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      phoneNumber: formData.get('phone'),
      publickeymetamask: formData.get('pkeymeta'),
    };

    try {
      const response = await axios.post(registerRoute, userData);

      console.log('Signup successful:', response.data);

      // Handle successful registration here if needed
      setUserExistsMessage(''); // Clear any previous error message
    } catch (error) {
      console.error('Registration failed:', error.message);

      // Check if the error is related to user existence
      if (error.response && error.response.data && error.response.data.message === 'User already exists') {
        setUserExistsMessage(error.response.data.message);
      } else {
        setUserExistsMessage('Unknown error occurred during registration');
      }
    }
  };

  return (
    // <div>
    //   <h2>Register</h2>
    //   <form onSubmit={handleSubmit}>
    //     <label>Name:</label>
    //     <input type="text" name="name" required />

    //     <label>Email:</label>
    //     <input type="email" name="email" required />

    //     <label>Password:</label>
    //     <input type="password" name="password" required />

    //     <button type="submit">Register</button>

    //     {/* Display userExistsMessage if not empty */}
    //     {userExistsMessage && <p style={{ color: 'red' }}>{userExistsMessage}</p>}
    //   </form>
    // </div>
<div className="bg-white">
  <div className="relative isolate px-6 pt-14 lg:px-8">
    <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
    </div>

    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-14 lg:px-8 mt-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        /> */}
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Register for an account
      </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
              Username
            </label>
            <div className="mt-3">
              <input
                name="username"
                type="text"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between ">
              <label htmlFor="email" className=" mt-3 block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
            </div>
            <div className="mt-3">
              <input
                name="email"
                type="email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between ">
              <label htmlFor="password" className=" mt-3 block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
            </div>
            <div className="mt-3">
              <input
                name="password"
                type="password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
              Phone number
            </label>
            <div className="mt-3">
              <input
                name="phone"
                type="number"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pkeymeta" className="block text-sm font-medium leading-6 text-gray-900">
              Public key metamask
            </label>
            <div className="mt-3">
              <input
                name="pkeymeta"
                type="text"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className=" mt-6 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Register
            </button>
          </div>

          {userExistsMessage && <p style={{ color: 'red' }}>{userExistsMessage}</p>}
        </form>
      </div>
    </div>
  </div>
</div>

  );
};

export default Register;
