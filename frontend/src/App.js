import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CaseList from './components/CaseList.js';
import CaseForm from './components/CaseForm.js';
import WelcomePage from './pages/WelcomePage.js';
import LoginPage from './components/Auth/login.js';
import Register from './components/Auth/register.js';
import LawFirmHomePage from './pages/WelcomePage.js';
import LawFirmDashboard from './pages/LawFirmDashboard.js';
import UserDashboard from './pages/userDasboard.js';


function App() {
  return (
    <Router>
      <div>
        {/* Simple Navbar */}
    

        {/* Routes */}
        <Routes>
          
          <Route path="/cases" element={<CaseList />} />
          <Route path="/add" element={<CaseForm />} />
          <Route path="/edit/:id" element={<CaseForm />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user-dashboard" element={<UserDashboard/>} />
          <Route path="/lawfirmdashboard" element={<LawFirmDashboard />} />
          <Route path="/create-case" element={<CaseForm />} />
          <Route path="/" element={<LawFirmHomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
