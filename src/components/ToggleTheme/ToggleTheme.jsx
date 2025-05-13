/* eslint-disable no-undef */
// src/components/ThemeToggle.jsx
import { useEffect, useState } from "react";
import "./ToggleTheme.css";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="theme-toggle" onClick={toggleTheme} title="Cambiar tema">
      <div className={`toggle-thumb ${theme === "dark" ? "right" : "left"}`}>
        {theme === "dark" ? "🌙" : "☀️"}
      </div>
    </div>
  );
}
