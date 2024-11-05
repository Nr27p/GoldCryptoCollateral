// src/App.js
import React from 'react';
import { BrowserRouter as BrowserRouterRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/HomePage';
import Login from './components/loginComponent';
import Register from './components/registerComponent';
import PurchaseGold from './pages/purchaseGold';
import UserDashboard from './pages/userDashboard';
// import LenderDashboard from './pages/lender';
import LenderPage from './pages/LenderPage';
import BorrowerPage from './pages/BorrowerPage';
// import BorrowerDashboard from './pages/borrower';


function App() {
  return (
    <BrowserRouterRouter>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" exact element={<Home />} />
          <Route path="/user-dashboard" exact element={<UserDashboard />} />
          <Route path="/buy-gold" exact element={<PurchaseGold />} />
          <Route path="/lender-dashboard" exact element={<LenderPage />} />
          <Route path="/borrower-dashboard" exact element={<BorrowerPage />} />
          {/* <Route path="/borrower-dashboard" exact element={<BorrowerDashboard />} /> */}
          </Routes>
      </div>
    </BrowserRouterRouter>
  );
}

export default App;