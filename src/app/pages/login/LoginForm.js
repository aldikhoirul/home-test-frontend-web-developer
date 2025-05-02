"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";

// Validasi Zod
const schema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z
    .string()
    .min(1, "Password tidak boleh kosong")
    .min(6, "Password minimal 6 karakter"),
});

export default function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        "https://test-fe.mysellerpintar.com/api/auth/login",
        data
      );

      const token = res.data.token;
      const role = res.data.role;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("name", res.data.name || data.username);
        setMessage(res.data.message || "Login berhasil!");
        setMessageType("success");
        setTimeout(() => {
          if (role === "Admin") {
            router.push("/dashboard/");
          } else {
            router.push("/pages/list-article");
          }
        }, 1000);
      } else {
        setMessage(res.data.message || "Login gagal!");
        setMessageType("error");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Terjadi kesalahan saat login";
      setMessage(msg);
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        {/* Logo Section Inside Form */}
        <div className="text-center">
          <Logo />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-black"
              >
                Username
              </label>
              <input
                {...register("username")}
                id="username"
                name="username"
                type="text"
                placeholder="Input username"
                className="w-full text-black px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-black"
              >
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Input password"
                  className="w-full text-black px-4 py-2 mt-1 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
            >
              {isSubmitting ? "Loading..." : "Login"}
            </button>
          </div>
        </form>

        {message && (
          <div
            className={`text-center text-sm ${
              messageType === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <div className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a
            href="/pages/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
