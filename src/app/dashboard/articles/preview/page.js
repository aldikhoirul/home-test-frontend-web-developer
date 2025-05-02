import { Suspense } from "react";
import PreviewArticleClient from "./PreviewArticleClient";

export default function PreviewArticlePage() {
  return (
    <Suspense fallback={<div className="p-4">Memuat preview...</div>}>
      <PreviewArticleClient />
    </Suspense>
  );
}
