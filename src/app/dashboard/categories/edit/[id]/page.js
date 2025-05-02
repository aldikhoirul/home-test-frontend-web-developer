"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditCategoryPage() {
  useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("ID dari useParams:", id);

        const response = await axios.get(
          `https://test-fe.mysellerpintar.com/api/categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const allCategories = response.data.data || [];

        // Cari kategori berdasarkan ID dari params
        const targetCategory = allCategories.find((cat) => cat.id === id);

        if (!targetCategory) {
          setError("Kategori tidak ditemukan.");
          return;
        }

        // Set nilai default untuk form setelah data berhasil diambil
        setValue("name", targetCategory.name);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Gagal mengambil data kategori.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCategory();
  }, [id, router, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://test-fe.mysellerpintar.com/api/categories/${id}`,
        { name: data.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      SweetAlert.success("Kategori berhasil diperbarui");
      router.push("/dashboard/categories");
    } catch (err) {
      console.error(err);
      SweetAlert.error("Gagal memperbarui kategori");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Memuat data kategori...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4 mt-4 text-black">Edit Kategori</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Nama Kategori
          </label>
          <input
            type="text"
            {...register("name")}
            className="w-full border px-3 py-2 rounded text-gray-500"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Simpan Perubahan
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/categories")}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
