"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Pagination from "@/components/Pagination";
import Navbar from "@/app/navbar/Navbar";
import useAdminAuth from "@/hooks/useAdminAuth";
import SweetAlert from "@/components/SweetAlert";

export default function AdminCategoryPage() {
  useAdminAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDummyData, setIsDummyData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const isSearching = searchQuery.trim().length > 0;
        const baseUrl = "https://test-fe.mysellerpintar.com/api/categories";
        const url = isSearching
          ? `${baseUrl}?limit=1000`
          : `${baseUrl}?page=${currentPage}&limit=${categoriesPerPage}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { data, totalPages } = response.data;

        if (Array.isArray(data)) {
          setCategories(data);
          setTotalPages(isSearching ? 1 : totalPages);
          setIsDummyData(false);
        } else {
          setError("Data kategori tidak valid.");
        }
      } catch (err) {
        const dummyData = Array.from({ length: 23 }, (_, i) => ({
          id: i + 1,
          title: `Artikel Dummy ${i + 1}`,
          category: { name: ["Teknologi", "Kesehatan", "Pendidikan"][i % 3] },
          createdAt: `2025-0${(i % 12) + 1}-01`,
        }));

        const start = (currentPage - 1) * categoriesPerPage;
        const paginated = dummyData.slice(start, start + categoriesPerPage);

        setCategories(paginated);
        setTotalPages(Math.ceil(dummyData.length / categoriesPerPage));
        setIsDummyData(true);
        console.error(err);
        setError("Gagal mengambil data asli. Menampilkan data dummy.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [router, currentPage, searchQuery]);

  const handleEdit = (categoryId) => {
    router.push(`/dashboard/categories/edit/${categoryId}`);
  };
  const handleDelete = async (categoryId) => {
    const confirmed = await SweetAlert.confirm(
      "Apakah Anda Yakin?",
      "Anda akan menghapus kategori ini. Tindakan ini tidak bisa dibatalkan."
    );
    if (confirmed) {
      try {
        const token = localStorage.getItem("token");

        await axios.delete(
          `https://test-fe.mysellerpintar.com/api/categories/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Filter kategori yang dihapus dari state
        setCategories((prev) =>
          prev.filter((category) => category.id !== categoryId)
        );
      } catch (err) {
        console.error(err);
        setError("Gagal menghapus kategori.");
      }
    }
  };

  const handleCreate = () => {
    router.push("/dashboard/categories/create");
  };

  useEffect(() => {
    const randomDelay = Math.floor(Math.random() * 201) + 300; // 300-500ms delay

    const delayDebounce = setTimeout(() => {
      const filtered = categories.filter((category) =>
        category.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }, randomDelay);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, categories]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Navbar />
      <div className="flex justify-between items-center mb-6 mt-4">
        <h1 className="text-3xl font-bold text-black">Daftar Kategori</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded w-full sm:w-1/2 text-gray-500"
          />

          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={18} />
            Buat Category
          </button>
        </div>
      </div>

      {isDummyData && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
          Menampilkan data dummy karena API tidak dapat dijangkau.
        </div>
      )}

      {error && <div className="text-red-500">{error}</div>}
      {loading && <div>Memuat data kategori...</div>}

      {!loading && !error && (
        <>
          {filteredCategories.length === 0 ? (
            <p className="text-gray-500">Belum ada kategori.</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 text-gray-500">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(category.createdAt).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 space-x-4 text-sm">
                        <button
                          onClick={() => handleEdit(category.id)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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
          {totalPages > 1 && searchQuery === "" && (
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
