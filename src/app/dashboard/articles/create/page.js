"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/app/navbar/Navbar";
import useAdminAuth from "@/hooks/useAdminAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SweetAlert from "@/components/SweetAlert";

// Skema validasi dengan Zod
const articleSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  content: z.string().min(1, "Konten wajib diisi"),
  image: z.any().optional(),
});

export default function CreateArticle() {
  useAdminAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(articleSchema),
  });

  const imageFile = watch("image");

  // Ambil kategori dari API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://test-fe.mysellerpintar.com/api/categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [router]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      let imageUrl = "";

      // 1. Upload image dulu jika ada
      if (data.image && data.image.length > 0) {
        const imageData = new FormData();
        imageData.append("image", data.image[0]);

        const uploadRes = await axios.post(
          "https://test-fe.mysellerpintar.com/api/upload",
          imageData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        imageUrl = uploadRes.data.imageUrl;
      }

      await axios.post(
        "https://test-fe.mysellerpintar.com/api/articles",
        {
          title: data.title,
          content: data.content,
          categoryId: data.category,
          imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      SweetAlert.success("Sukses", "Artikel berhasil dibuat!");
      router.push("/dashboard/articles");
    } catch (err) {
      console.error("Gagal:", err);
      setError("Gagal membuat artikel");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const data = getValues();
    const file = data.image?.[0];

    // Jika ada gambar, buat URL sementara untuk preview
    const imagePreviewUrl = file ? URL.createObjectURL(file) : "";

    // Ambil nama kategori dari ID
    const selectedCategory = categories.find((cat) => cat.id === data.category);

    const previewData = {
      title: data.title,
      content: data.content,
      category: data.category,
      image: imagePreviewUrl,
      imageFile: file || null,
    };

    localStorage.setItem("previewArticleData", JSON.stringify(previewData));
    router.push("/dashboard/articles/preview?mode=create");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 mt-6 text-black">
        Tambah Artikel
      </h1>
      {error && <div className="text-red-500">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Judul
          </label>
          <input
            id="title"
            type="text"
            {...register("title")}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-500"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Kategori
          </label>
          <select
            id="category"
            {...register("category")}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-500"
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Konten
          </label>
          <textarea
            id="content"
            {...register("content")}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-500"
          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            Upload Gambar
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            {...register("image")}
            className="w-full text-gray-500"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {loading ? "Menyimpan..." : "Simpan Artikel"}
          </button>
          <button
            type="button"
            onClick={handlePreview}
            className="flex-1 py-2 text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
          >
            Preview Artikel
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/articles")}
            className="flex-1 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
