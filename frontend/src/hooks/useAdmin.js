import { useState } from "react";
import { NAV } from "../data/adminData";

export const useAdmin = () => {
  const [active, setActive] = useState("dashboard");

  const userName = localStorage.getItem("userName") || "Administrador";
  const initials = userName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();

  const PAGE_TITLES = Object.fromEntries(NAV.map(n => [n.key, n.label]));

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/"; // o usar navigate si se pasa
  };

  // Group nav by section
  const sections = [...new Set(NAV.map(n => n.section))];

  return {
    active,
    setActive,
    userName,
    initials,
    PAGE_TITLES,
    handleLogout,
    sections,
    NAV,
  };
};