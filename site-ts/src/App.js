import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ArtisansCouvreurSite from "./ArtisansCouvreurSite";
import AdminDashboard from "./AdminDashboard";
import LoginAdmin from "./LoginAdmin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ArtisansCouvreurSite />} />
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
