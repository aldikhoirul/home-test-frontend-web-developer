"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/app/navbar/Navbar";
import useAdminAuth from "@/hooks/useAdminAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SweetAlert from "@/components/SweetAlert";

// Skema validasi Zod
const schema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
});

export default function CreateCategoryPage() {
  useAdminAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  // Proteksi akses hanya untuk admin
  useEffect(() => {}, [router]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://test-fe.mysellerpintar.com/api/categories",
        { name: data.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      SweetAlert.success("Kategori berhasil dibuat");
      router.push("/dashboard/categories");
    } catch (err) {
      console.error(err);
      setError("Gagal membuat kategori");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 mt-6 text-black">
        Tambah Kategori
      </h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-w-md mx-auto"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nama Kategori
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-500"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {loading ? "Menyimpan..." : "Simpan Kategori"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/categories")}
            className="flex-1 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
