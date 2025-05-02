"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Pagination from "../../components/Pagination";
import Navbar from "../navbar/Navbar";

export default function ArticleList() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("User");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const savedRole = localStorage.getItem("role") || "User";
    setRole(savedRole);

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/");
    } else if (role === "Admin") {
      router.push("/dashboard");
      return;
    }

    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role") || "User";

        const limit = role === "Admin" ? 10 : 9;

        const isSearching =
          searchQuery.trim().length > 0 || categoryFilter.trim().length > 0;
        const baseUrl = "https://test-fe.mysellerpintar.com/api/articles";
        const url = isSearching
          ? `${baseUrl}?limit=1000`
          : `${baseUrl}?page=${currentPage}&limit=${articlesPerPage}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000,
        });

        const data = response.data;

        console.log("API Response:", data); // Debugging
        console.log(`Mengambil artikel: role=${role}, limit=${limit}`);

        // Fungsi untuk mengekstrak array data dari berbagai format response
        const extractArticlesArray = (data) => {
          // Jika data langsung berupa array
          if (Array.isArray(data)) return data;

          // Jika data berupa object dengan properti tertentu
          if (typeof data === "object" && data !== null) {
            if (Array.isArray(data.articles)) return data.articles;
            if (Array.isArray(data.data)) return data.data;
            if (Array.isArray(data.items)) return data.items;
            if (Array.isArray(data.results)) return data.results;
          }

          // Jika format tidak dikenali, kembalikan array kosong
          return [];
        };

        const rawArticles = extractArticlesArray(response.data);

        if (rawArticles.length === 0) {
          throw new Error("Data artikel tidak ditemukan dalam response");
        }

        // Normalisasi data
        const normalizedData = rawArticles.map((item) => {
          // Fungsi untuk memformat tanggal
          const formatTanggal = (dateString) => {
            if (!dateString) return "Tanggal tidak tersedia";

            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Format tanggal tidak valid";

            const hari = date.getDate();
            const bulan = date.toLocaleString("id-ID", { month: "long" });
            const tahun = date.getFullYear();

            return `${bulan} ${hari}, ${tahun}`;
          };

          // Fungsi untuk memotong konten menjadi beberapa kalimat pertama
          const getShortContent = (text, maxSentences = 2) => {
            if (!text) return "Konten tidak tersedia";

            // Pisahkan teks menjadi kalimat-kalimat
            const sentences = text
              .split(/[.!?]+/)
              .filter((s) => s.trim().length > 0);

            // Ambil beberapa kalimat pertama dan gabungkan kembali
            const shortContent =
              sentences
                .slice(0, maxSentences)
                .map((s) => s.trim())
                .join(". ") + (sentences.length > maxSentences ? "..." : "");

            return shortContent || "Konten tidak tersedia";
          };

          // Dapatkan konten lengkap (sebelum dipotong)
          const fullContent =
            item.content ||
            item.body ||
            item.description ||
            item.articleContent ||
            item.text ||
            item.detail ||
            null;

          return {
            id: item.id || item._id || Math.random().toString(36).substr(2, 9),
            imageUrl: item.imageUrl || item.image || null,
            title: item.name || item.title || "Judul Tidak Tersedia",
            authorId: item.userId || item.authorId || "Unknown",
            createdAt: formatTanggal(item.createdAt),
            updatedAt: formatTanggal(item.updatedAt),
            category:
              item.category || item.type || item.tags?.[0] || "Uncategorized",
            fullContent: fullContent, // Simpan konten lengkap
            shortContent: getShortContent(fullContent, 2), // Hanya 2 kalimat pertama
            hasMoreContent:
              fullContent &&
              fullContent.split(/[.!?]+/).filter((s) => s.trim().length > 0)
                .length > 2,
          };
        });

        setArticles(normalizedData);
        setTotalPages(
          isSearching ? 1 : Math.ceil(data.total / articlesPerPage)
        );
      } catch (error) {
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          config: error.config,
        });
        setError(`Gagal memuat data: ${error.message}`);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [router, currentPage, searchQuery, categoryFilter]);

  useEffect(() => {
    const randomDelay = Math.floor(Math.random() * 201) + 300; // 300-500ms delay
    const delayDebounce = setTimeout(() => {
      const filtered = articles.filter((article) => {
        const matchesSearch = article.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          !categoryFilter ||
          article.category.name?.toLowerCase() === categoryFilter.toLowerCase();
        return matchesSearch && matchesCategory;
      });
      setFilteredArticles(filtered);
    }, randomDelay);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, categoryFilter, articles]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="fixed top-0 left-0 right-0 z-20 bg-white shadow-md">
        <Navbar />
      </div>

      {/* Jumbotron */}
      <div
        className="relative w-full h-64 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/gambar.jpg')" }}
      >
        <div className="flex items-center justify-center w-full h-full bg-opacity-50">
          <div className="text-center">
            <h1 className="text-white text-4xl font-bold drop-shadow-lg mb-4">
              Daftar Artikel
            </h1>
            {/* Form Search & Filter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
              <select
                className="w-full md:w-72 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500 z-30"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {[
                  ...new Set(
                    articles.map((a) =>
                      typeof a.category === "object" && a.category !== null
                        ? a.category.name
                        : a.category
                    )
                  ),
                ]
                  .filter((type) => type)
                  .map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
              </select>
              <input
                type="text"
                placeholder="Cari artikel..."
                className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-32 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchArticles}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {!loading && !error && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id || Math.random()}
                    article={article}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">
                    Tidak ada artikel yang tersedia
                  </p>
                </div>
              )}
            </div>
          )}

          {totalPages > 1 && searchQuery === "" && categoryFilter === "" && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Komponen Kartu Artikel
function ArticleCard({ article }) {
  const router = useRouter();
  // const [showFullContent, setShowFullContent] = useState(false);

  return (
    <div
      onClick={() => router.push(`/pages/list-article/${article.id}`)}
      className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 h-full"
    >
      <div className="px-6 py-5 h-full flex flex-col">
        {/* Gambar Artikel */}
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title || "Gambar Artikel"}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-2">
            <span>{article.updatedAt || "Tanggal tidak tersedia"}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {article.title || "Judul Tidak Tersedia"}
          </h3>
          <div className="mt-4 mb-4 text-gray-700">
            {/* {showFullContent ? ( */}
            <>
              <p>{article.shortContent}</p>
              {/* <button
                  onClick={() => setShowFullContent(false)}
                  className="text-blue-600 text-sm mt-2"
                >
                  Tampilkan lebih sedikit
                </button> */}
            </>
            {/* ) : (
              <>
                <p>{article.shortContent}</p>
                {article.hasMoreContent && (
                  <button
                    onClick={() => setShowFullContent(true)}
                    className="text-blue-600 text-sm mt-2"
                  >
                    Baca selengkapnya
                  </button>
                )}
              </>
            )} */}
          </div>
          {/* <p className="text-gray-600 mb-4">
            {article.content || "Deskripsi tidak tersedia"}
          </p> */}
        </div>
        <div className="mt-auto text-sm text-gray-500">
          {article.category && (
            <span className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {article.category.name || "Kategori Tidak Tersedia"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
