import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./welcome";
import UserDashboard from "./user";
import AdminDashboard from "./admin";
import CasePriorityDashboard from "./CasePriorityDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/Priority-dashboard" element={<CasePriorityDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
