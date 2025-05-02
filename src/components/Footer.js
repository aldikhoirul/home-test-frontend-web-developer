// Footer.js
export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6 border-t">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-gray-600 gap-2 text-center">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Logoipsum"
            className="h-6 w-auto object-contain"
          />
          <p className="text-sm">© 2025 Blog genzet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
