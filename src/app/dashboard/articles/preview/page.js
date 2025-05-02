"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Navbar from "@/app/navbar/Navbar";
import useAdminAuth from "@/hooks/useAdminAuth";
import SweetAlert from "@/components/SweetAlert";

export default function PreviewArticle() {
  useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const articleId = searchParams.get("id");

  const [previewData, setPreviewData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil data preview dari localStorage dan ambil nama kategori dari id
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("previewArticleData"));
    if (!data) {
      SweetAlert.error("Data tidak ditemukan");
      router.push("/dashboard/articles");
    } else {
      setPreviewData(data);
    }

    // Ambil kategori
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://test-fe.mysellerpintar.com/api/categories",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      }
    };

    fetchCategories();
  }, [router]);

  const getCategoryName = (id) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : id;
  };

  const handleSave = async () => {
    if (!previewData) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      let imageUrl = previewData.image;

      // Jika ada file image baru, upload dulu
      if (previewData.imageFile instanceof File) {
        const formData = new FormData();
        formData.append("image", previewData.imageFile);

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

      const payload = {
        title: previewData.title?.trim(),
        content: previewData.content?.trim(),
        categoryId: previewData.category,
        imageUrl,
      };

      // Validasi sebelum kirim
      if (!payload.title || payload.title.length < 3) {
        SweetAlert.error("Judul artikel wajib diisi dan minimal 3 karakter.");
        setIsSubmitting(false);
        return;
      }

      if (!payload.content || payload.content.length < 10) {
        SweetAlert.error("Konten artikel wajib diisi dan minimal 10 karakter.");
        setIsSubmitting(false);
        return;
      }

      if (!payload.categoryId) {
        SweetAlert.error("Kategori artikel wajib dipilih.");
        setIsSubmitting(false);
        return;
      }

      if (mode === "edit") {
        await axios.put(
          `https://test-fe.mysellerpintar.com/api/articles/${articleId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        SweetAlert.success("Artikel berhasil diperbarui!");
      } else {
        await axios.post(
          "https://test-fe.mysellerpintar.com/api/articles",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        SweetAlert.success("Artikel berhasil dibuat!");
      }

      localStorage.removeItem("previewArticleData");
      router.push("/dashboard/articles");
    } catch (err) {
      console.error("ERROR SIMPAN:", err);
      if (err.response?.status === 400) {
        SweetAlert.error(
          "Gagal menyimpan artikel: " +
            (err.response.data?.message || "Data tidak valid.")
        );
      } else {
        SweetAlert.error(
          "Gagal menyimpan artikel, Terjadi kesalahan di server"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!previewData) return <div className="p-4">Memuat preview...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <h1 className="text-2xl font-bold text-black mb-6 mt-6">
        Preview Artikel ({mode === "edit" ? "Edit" : "Baru"})
      </h1>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-black">Judul</h2>
          <p className="text-gray-800">{previewData.title}</p>
        </div>

        <div>
          <h2 className="font-semibold text-black">Konten</h2>
          <p className="text-gray-800 whitespace-pre-line">
            {previewData.content}
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-black">Kategori</h2>
          <p className="text-gray-800">
            {getCategoryName(previewData.category)}
          </p>
        </div>

        {previewData.image && (
          <div>
            <h2 className="font-semibold text-black">Gambar</h2>
            <img
              src={previewData.image}
              alt="Preview"
              className="w-64 h-64 object-cover rounded"
            />
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => router.back()}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Kembali
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
