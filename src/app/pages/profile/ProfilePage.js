"use client";

import Navbar from "@/app/navbar/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    // Jika tidak login, redirect ke login
    if (!token) {
      router.push("/");
    } else {
      setUserData({
        username: name || "Unknown",
        password: "••••••••", // tidak menampilkan password asli
        role: role || "User",
      });
    }
  }, [router]);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
          </div>

          {/* Profile Info */}
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-700">Username</span>
                <span className="text-gray-900">{userData.username}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-700">Password</span>
                <span className="text-gray-900">{userData.password}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="font-medium text-gray-700">Role</span>
                <span className="text-gray-900">{userData.role}</span>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={
                  userData.role === "Admin"
                    ? "/dashboard"
                    : "/pages/list-article"
                }
                className="inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition"
              >
                {userData.role === "Admin" ? "Dashboard" : "Back to home"}
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
