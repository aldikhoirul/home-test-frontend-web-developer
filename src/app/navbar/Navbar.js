"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [username, setUsername] = useState("User");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) setUsername(name);
  }, []);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Logoipsum</h1>
          </div>

          {/* User Info & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <span>{username || "User"}</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                <button
                  onClick={() => {
                    router.push("/pages/profile");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-500"
                >
                  My Account
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
