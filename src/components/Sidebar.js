"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/");
  };

  return (
    <aside className="w-64 bg-white border-r shadow-md p-6">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">Admin Panel</h2>
      <nav className="flex flex-col space-y-4">
        <Link
          href="/dashboard/articles"
          className="text-blue-600 hover:underline"
        >
          Articles
        </Link>
        <Link
          href="/dashboard/categories"
          className="text-blue-600 hover:underline"
        >
          Category
        </Link>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:underline text-left"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
