import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ArtisansCouvreurSite from "./ArtisansCouvreurSite";
import AdminDashboard from "./AdminDashboard";
import LoginAdmin from "./LoginAdmin";

function App() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin");
  };

  return (
    <Routes>
      <Route path="/" element={<ArtisansCouvreurSite />} />
      <Route path="/admin" element={<LoginAdmin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard onLogout={handleLogout} />} />
    </Routes>
  );
}

export default App;
