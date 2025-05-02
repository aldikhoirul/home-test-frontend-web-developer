"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../navbar/Navbar";
import useAdminAuth from "@/hooks/useAdminAuth";

export default function AdminHome() {
  useAdminAuth();
  const router = useRouter();

  useEffect(() => {}, [router]);

  return (
    <div>
      <Navbar />
      <h1 className="text-3xl font-bold text-gray-900 mt-5">
        Selamat Datang di Dashboard Admin
      </h1>
      <p className="mt-4 text-gray-700">
        Pilih menu di sidebar untuk mengelola konten.
      </p>
    </div>
  );
}
