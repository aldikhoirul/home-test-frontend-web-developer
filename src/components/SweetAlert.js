// components/SweetAlert.js
import Swal from "sweetalert2";

const SweetAlert = {
  success: (title, text) => {
    Swal.fire({
      icon: "success",
      title: title || "Berhasil",
      text: text || "Operasi berhasil dilakukan!",
      confirmButtonText: "OK",
    });
  },

  error: (title, text) => {
    Swal.fire({
      icon: "error",
      title: title || "Terjadi Kesalahan",
      text: text || "Ada kesalahan dalam operasi ini.",
      confirmButtonText: "Tutup",
    });
  },

  warning: (title, text) => {
    Swal.fire({
      icon: "warning",
      title: title || "Peringatan",
      text: text || "Harap hati-hati dengan tindakan ini.",
      confirmButtonText: "OK",
    });
  },

  info: (title, text) => {
    Swal.fire({
      icon: "info",
      title: title || "Informasi",
      text: text || "Ini adalah informasi penting.",
      confirmButtonText: "Got it!",
    });
  },

  confirm: async (title, text) => {
    const result = await Swal.fire({
      title: title || "Apakah Anda Yakin?",
      text: text || "Tindakan ini tidak dapat dibatalkan.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Lanjutkan",
      cancelButtonText: "Batal",
    });
    return result.isConfirmed; // Akan mengembalikan true/false
  },
};

export default SweetAlert;
