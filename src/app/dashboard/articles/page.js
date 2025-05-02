"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Pagination from "@/components/Pagination";
import Navbar from "@/app/navbar/Navbar";
import useAdminAuth from "@/hooks/useAdminAuth";
import SweetAlert from "@/components/SweetAlert";

export default function ArticleList() {
  useAdminAuth();
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDummyData, setIsDummyData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [filteredArticles, setFilteredArticles] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

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
        });

        const data = response.data;

        if (Array.isArray(data.data)) {
          setArticles(data.data);
          setTotalPages(
            isSearching ? 1 : Math.ceil(data.total / articlesPerPage)
          );
          setIsDummyData(false);
        } else {
          setError("Data artikel tidak valid.");
        }
      } catch (err) {
        const dummyData = Array.from({ length: 23 }, (_, i) => ({
          id: i + 1,
          title: `Artikel Dummy ${i + 1}`,
          category: { name: ["Teknologi", "Kesehatan", "Pendidikan"][i % 3] },
          createdAt: `2025-0${(i % 12) + 1}-01`,
        }));

        const start = (currentPage - 1) * articlesPerPage;
        const paginated = dummyData.slice(start, start + articlesPerPage);

        setArticles(paginated);
        setTotalPages(Math.ceil(dummyData.length / articlesPerPage));
        setIsDummyData(true);
        setError("Gagal memuat data asli. Menampilkan data dummy.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [router, currentPage, searchQuery, categoryFilter]);

  const handleEdit = (articleId) => {
    router.push(`/dashboard/articles/edit/${articleId}`);
  };

  const handleDelete = async (articleId) => {
    const confirmed = await SweetAlert.confirm(
      "Apakah Anda Yakin?",
      "Anda akan menghapus artikel ini. Tindakan ini tidak bisa dibatalkan."
    );
    if (confirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://test-fe.mysellerpintar.com/api/articles/${articleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Refetch current page
        setArticles((prevArticles) =>
          prevArticles.filter((article) => article.id !== articleId)
        );
      } catch (err) {
        setError("Failed to delete article");
      }
    }
  };

  const handleCreate = () => {
    router.push("/dashboard/articles/create");
  };

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
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 mt-6 text-black">
        Daftar Artikel
      </h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <input
          type="text"
          placeholder="Cari artikel..."
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
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
      </div>

      <button
        onClick={handleCreate}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 mb-4 rounded hover:bg-blue-700"
      >
        <Plus size={18} /> Buat Artikel
      </button>

      {isDummyData && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
          Menampilkan data dummy karena API tidak dapat dijangkau.
        </div>
      )}

      {error && <div className="text-red-500 mb-2">{error}</div>}

      {loading ? (
        <div className="text-center">
          <span className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 inline-block"></span>
        </div>
      ) : (
        <>
          {filteredArticles.length === 0 ? (
            <div className="text-center text-gray-500">
              No articles available
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Judul
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredArticles.map((article) => (
                    <tr key={article.id}>
                      <td className="px-6 py-4">
                        {article.imageUrl ? (
                          <img
                            src={article.imageUrl}
                            alt="thumb"
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {article.title}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {article.category?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>

                      <td className="px-6 py-4 space-x-4 text-sm">
                        <button
                          onClick={() => handleEdit(article.id)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && searchQuery === "" && categoryFilter === "" && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}
    </div>
  );
}
