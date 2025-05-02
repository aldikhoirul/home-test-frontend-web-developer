"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import axios from "axios";
import Logo from "@/components/Logo";
import Link from "next/link";

const schema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z
    .string()
    .min(1, "Password tidak boleh kosong")
    .min(6, "Password minimal 6 karakter"),
  role: z.enum(["Admin", "User"], {
    errorMap: () => ({ message: "Pilih peran (role)" }),
  }),
});

export default function RegisterForm() {
  const [message, setMessage] = useState(null);

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
        "https://test-fe.mysellerpintar.com/api/auth/register",
        data
      );
      setMessage({
        text: res.data.message || "Registrasi berhasil!",
        type: "success",
      });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Terjadi kesalahan saat registrasi";
      setMessage({ text: msg, type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 space-y-8">
        {/* Header with Logo */}
        <div className="text-center">
          <Logo />
        </div>

        {/* Form Content */}
        <div className="mt-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-black mb-1"
              >
                Username
              </label>
              <input
                {...register("username")}
                id="username"
                name="username"
                type="text"
                placeholder="Input username"
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
                className="block text-sm font-medium text-black mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                {...register("password")}
                placeholder="Input password"
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-black mb-1"
              >
                Role
              </label>
              <select
                {...register("role")}
                id="role"
                name="role"
                className="w-full text-black px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
              >
                {isSubmitting ? "Loading..." : "Register"}
              </button>

              {message && (
                <p
                  className={`text-xs mt-1 ${
                    message.type === "success"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {message.text}
                </p>
              )}
            </div>
          </form>

          <div className="text-center text-sm text-gray-600 pt-2">
            Already have an account?{" "}
            <Link
              href="/"
              className="font-medium text-blue-600 hover:text-blue-500 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
