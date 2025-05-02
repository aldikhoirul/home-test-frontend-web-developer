"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import ArticleCard from "../../../coba-article/components/ArticleCard";
import Navbar from "@/app/navbar/Navbar";
import Footer from "@/components/Footer";

export default function DetailArtikel() {
  const { id } = useParams();
  const router = useRouter();
  const [artikel, setArtikel] = useState(null);
  const [otherArticles, setOtherArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/");
    } else if (role === "Admin") {
      router.push("/dashboard/");
    }

    const fetchArtikel = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://test-fe.mysellerpintar.com/api/articles/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setArtikel(res.data);
      } catch (err) {
        setError("Gagal memuat artikel");
      } finally {
        setLoading(false);
      }
    };

    fetchArtikel();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!artikel || !artikel.category) return;

    const fetchOthers = async () => {
      try {
        const res = await axios.get(
          `https://test-fe.mysellerpintar.com/api/articles`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const rawArticles = Array.isArray(res.data)
          ? res.data
          : res.data.data || res.data.articles || res.data.items || [];

        const filtered = rawArticles.filter(
          (item) =>
            item.id !== artikel.id &&
            (item.category?.name || item.category || "").toLowerCase() ===
              (artikel.category?.name || artikel.category || "").toLowerCase()
        );

        setOtherArticles(filtered.slice(0, 3));
      } catch (err) {
        console.error("Gagal memuat artikel lain:", err);
      }
    };

    fetchOthers();
  }, [artikel]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!artikel) return <p className="p-4">Artikel tidak ditemukan</p>;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar fixed at the top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <Navbar />
      </div>

      <div className="flex-grow pt-24 px-16 sm:px-20 lg:px-36">
        <div className="text-sm text-center text-gray-600 mt-4 flex justify-center items-center space-x-2">
          {/* Judul dan Tanggal */}
          <p className="text-sm text-center text-gray-500 mb-4 mt-4">
            {new Date(artikel.updatedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p>
            Created By <span className="font-semibold">Admin</span>
          </p>
        </div>

        <h1 className="text-4xl text-center font-extrabold text-gray-900 mb-4 leading-tight">
          {artikel.title}
        </h1>

        {/* Gambar Artikel */}
        {artikel.imageUrl && (
          <img
            src={artikel.imageUrl}
            alt={artikel.title || "Gambar Artikel"}
            className="w-full h-64 md:h-80 object-cover rounded-xl mb-6 shadow"
          />
        )}

        {/* Konten */}
        <article className="prose prose-gray max-w-none mb-12 text-justify text-gray-800">
          <p>{artikel.content}</p>
        </article>

        {/* Artikel Lainnya */}
        {otherArticles.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Artikel Lainnya
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {otherArticles.map((item) => (
                <ArticleCard
                  key={item.id}
                  article={item}
                  onClick={() => router.push(`/pages/list-article/${item.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
