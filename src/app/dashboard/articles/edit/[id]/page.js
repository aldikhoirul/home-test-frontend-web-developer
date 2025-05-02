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
  title: z.string().min(1, "Judul wajib diisi"),
  content: z.string().min(1, "Konten wajib diisi"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  image: z.any().optional(),
});

export default function EditArticlePage() {
  useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [categories, setCategories] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      image: undefined,
    },
  });

  // Ambil data artikel dan kategori saat komponen mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [articleRes, categoryRes] = await Promise.all([
          axios.get(`https://test-fe.mysellerpintar.com/api/articles/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://test-fe.mysellerpintar.com/api/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const article = articleRes.data.data || articleRes.data;
        const categoryList = categoryRes.data.data || [];

        reset({
          title: article.title || article.name || "",
          content: article.content || "",
          category: article.category?.id || "",
        });

        setPreviewImage(article.imageUrl || "");
        setCategories(categoryList);
      } catch (err) {
        console.error("DETAIL ERROR:", err);
        setError("Gagal memuat data artikel atau kategori");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, reset]);

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");
      let imageUrl = previewImage;

      if (data.image && data.image.length > 0) {
        const formData = new FormData();
        formData.append("image", data.image[0]);

        const uploadRes = await axios.post(
          "https://test-fe.mysellerpintar.com/api/upload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        imageUrl = uploadRes.data.imageUrl;
      }

      await axios.put(
        `https://test-fe.mysellerpintar.com/api/articles/${id}`,
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

      SweetAlert.success("Berhasil", "Artikel berhasil diperbarui.");
      router.push("/dashboard/articles");
    } catch (err) {
      console.error(err);
      SweetAlert.error("Terjadi Kesalahan", "Ada kesalahan dalam operasi ini.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setValue("image", e.target.files);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handlePreview = () => {
    const formData = getValues();
    const previewData = {
      ...formData,
      image: imageFile ? URL.createObjectURL(imageFile) : previewImage,
      imageFile: imageFile || null,
      mode: "edit",
      id,
    };
    localStorage.setItem("previewArticleData", JSON.stringify(previewData));
    router.push(`/dashboard/articles/preview?mode=edit&id=${id}`);
  };

  if (loading) {
    return <div className="p-4">Memuat data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <h1 className="text-2xl font-bold text-black mb-6 mt-6">Edit Artikel</h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-black">Judul</label>
          <input
            type="text"
            {...register("title")}
            className="w-full border px-3 py-2 rounded text-black"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium text-black">Konten</label>
          <textarea
            {...register("content")}
            className="w-full border px-3 py-2 rounded text-black"
            rows={6}
          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium text-black">Kategori</label>
          <select
            {...register("category")}
            className="w-full border px-3 py-2 rounded text-black"
            required
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
          <label className="block mb-1 font-medium text-black">
            Gambar (Opsional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border px-3 py-2 rounded text-black"
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="mt-2 w-40 h-40 object-cover rounded"
            />
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handlePreview}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Preview
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {loading ? "Menyimpan..." : "Simpan Artikel"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/articles")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
