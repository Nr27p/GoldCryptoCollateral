import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { friendsRoute, search, sentFriendRequests,getUserRequestId } from '../components/apiRoutes';

import PopupModal from '../components/notificationComponent';
import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'


const navigation = [


  { name: 'Dashboard', href: '/user-dashboard', current: true },
 // { name: 'Notifications', href: {openModal}, current: false },
  { name: 'Start chat', href: '#chat', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}



const UserDashboard = () => {
  const [retrievedRequestId, setRetrievedRequestId] = useState('');
  const [requestId, setRequestId] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

// For notification 

const [modalIsOpen, setModalIsOpen] = useState(false);

const openModal = () => {
  setModalIsOpen(true);
};

const closeModal = () => {
  setModalIsOpen(false);
};



  useEffect(() => {
    const fetchUserRequestId = async () => {
      try {
        const response = await axios.get(getUserRequestId, {
          headers: {
            Authorization: token,
          },
        });
        setRetrievedRequestId(response.data.requestId);
      } catch (error) {
        console.error('Error fetching user request ID:', error.message);
      }
    };

    fetchUserRequestId();
  }, [token]);
  
  
  useEffect(() => {



    const fetchFriendsList = async () => {
      try {
        
        const response = await axios.get(friendsRoute, {
          headers: {
            Authorization: token,
          },
        });
        setFriends(response.data);
      } catch (error) {
        console.error('Error fetching friends list:', error.message);
        setError('Error fetching friends list');
      }
    };
    fetchFriendsList();
  }, []);
  

  const handleSearch = async () => {
    try {
      
      const response = await axios.post(search, { requestId }, {
        headers: {
          Authorization: token,
        },});

      if (response.data.userId) {
        setUser(response.data);
        setError('');
      } else {
        setUser(null);
        setError('User not found');
      }
    } catch (error) {
      console.error('Error searching user:', error.message);
      setError('Internal Server Error');
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await axios.post(
        `${sentFriendRequests}/${user.userId}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setError('');
      setUser((prevUser) => ({ ...prevUser, friendRequestSent: true }));
    } catch (error) {
      console.error('Error sending friend request:', error.response.data.error);
      setError('Error sending friend request');
    }
  };

  return (
    <>
    <Disclosure as="nav" className="bg-gray-800">
    {({ open }) => (
      <>
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button*/}
              <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex flex-shrink-0 items-center">
                <img
                  className="h-8 w-auto"
                  src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                  alt="Your Company"
                />
              </div>
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'rounded-md px-3 py-2 text-sm font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </a>
                  ))}
                  <button onClick={openModal} className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                  Notification</button>
                  <PopupModal
                      isOpen={modalIsOpen}
                      onRequestClose={closeModal}
                      content={<p>This is the content of the modal</p>}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Disclosure.Panel className="sm:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => (
              <Disclosure.Button
                key={item.name}
                as="a"
                href={item.href}
                className={classNames(
                  item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'block rounded-md px-3 py-2 text-base font-medium'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </Disclosure.Button>
            ))}
          </div>
        </Disclosure.Panel>
      </>
    )}
  </Disclosure>

  <div className="bg-white shadow">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
    </div>
  </div>

<main>
  <div className="flex">
  <div className= "px-5 py-10 bg-gray-300 mt-10 ml-32 flex-2">
  <h3>User Request ID</h3>
  <p>Request ID: {retrievedRequestId}</p>
  </div>

  <div className="px-8 pt-10 mt-5 ml-20 mr-20 flex-1">
    <h3>Search User</h3>
      <div className="relative mt-2 rounded-md shadow-sm flex">
        <input
          type="text"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
        <button onClick={handleSearch} className='ml-3 inline-flex items-center rounded-md bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>Search</button>
        </div>
      {user && (
        <div className="absolute bg-gray p-6 pl-7 mt-10 ml-5 border-4 border-gray-300 w-72 h-44">
          <h4 className='font-bold text-xl text-slate-700'> User </h4>
          <p className='my-3 mt-5'> Name: <span className="text-indigo-600 font-bold">{user.username}</span></p>

          {user.friendRequestSent ? (
            <p >Friend request sent!</p>
          ) : (
              <button onClick={handleSendFriendRequest} className='float-right mt-4 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10'>
              Add Friend</button>
          )}
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
  </div>
</div>

  <div id='chat' className='my-1 border-4 w-96 float-right mr-36'>
    {friends.length > 0 && (
      <div className='my-5 mx-5 py-5 px-5'>
        <h4 className='font-bold text-xl text-slate-700 mb-5'>Friends List</h4>
          <ul>
            {friends.map((friend) => (
              <li key={friend.friend_id} className=' my-2 text-lg leading-6 text-gray-900'>
                <Link to={`/chat/${friend.friend_id}`}>{friend.friend_username}</Link>
              </li>
            ))}
          </ul>
      </div>
    )}
  </div>




</main>


</>
  );
};

export default UserDashboard;
