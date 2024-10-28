// src/App.js
import React from 'react';
import { BrowserRouter as BrowserRouterRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/HomePage';
import Login from './components/loginComponent';
import Register from './components/registerComponent';
import GoldLoan from './pages/goldLoan';
// import NotificationComponent from './components/notificationComponent';
// import ChatComponent from './components/chatComponent'; // Make sure the import is correct
import UserDashboard from './pages/userDashboard';

function App() {
  return (
    <BrowserRouterRouter>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" exact element={<Home />} />
          <Route path="/user-dashboard" exact element={<UserDashboard />} />
          <Route path="/gold-loan" exact element={<GoldLoan />} />
          {/* <Route path="/chat/:friendId" element={<ChatComponent />} /> Ensure the element is correctly set */}
          {/* <Route path="/notifications" exact element={<NotificationComponent />} /> */}
        </Routes>
      </div>
    </BrowserRouterRouter>
  );
}

export default App;

// src/App.js
// import React from "react";

// function App() {
//   return (
//     <div className="flex items-center justify-center h-screen bg-blue-50">
//       <h1 className="text-4xl font-bold text-blue-600">Hello, Tailwind CSS!</h1>
//     </div>
//   );
// }

// export default App;
