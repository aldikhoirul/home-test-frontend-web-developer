"use client";

import { useRouter } from "next/navigation";

export default function LogOut() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/pages/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}
