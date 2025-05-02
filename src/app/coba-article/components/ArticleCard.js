"use client";

export default function ArticleCard({ article, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <h3 className="text-lg font-semibold mb-1 text-gray-900">
        {article.title}
      </h3>
      <p className="text-sm text-gray-500">
        {new Date(article.updatedAt).toLocaleDateString("id-ID")}
      </p>
      <p className="text-sm text-gray-700 line-clamp-2 mt-2">
        {article.content.slice(0, 100)}...
      </p>
    </div>
  );
}
