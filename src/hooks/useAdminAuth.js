"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAdminAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "Admin") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/");
    }
  }, []);
}
