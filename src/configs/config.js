require("dotenv").config();

module.exports = {
  owner: ["62895347198105", "6285691464024"],
  pairingNumber: "212781342585",
  self: true,
  autoReadStory: true,
  autoReadStoryEmoji: true,
  autoOnline: true,
  storyReadInterval: 1000,
  autoRestart: "350 MB",
  autoReadMessage: false,
  writeStore: true,
  session: process.env.SESSION,
  database: process.env.DATABASE,
  commands: "commands",

  msg: {
    owner: "Fitur ini hanya dapat diakses oleh pemilik!",
    group: "Fitur ini hanya dapat diakses di dalam grup!",
    private: "Fitur ini hanya dapat diakses di chat pribadi!",
    admin: "Fitur ini hanya dapat diakses oleh admin grup!",
    botAdmin: "Bot bukan admin, tidak dapat menggunakan fitur ini!",
    bot: "Fitur ini hanya dapat diakses oleh bot",
    premium: "Fitur ini hanya dapat diakses oleh pengguna premium",
    media: "Balas ke media...",
    query: "Tidak ada query?",
    error:
      "Sepertinya terjadi kesalahan yang tidak terduga, silakan ulangi perintah Anda beberapa saat lagi",
    quoted: "Balas ke pesan...",
    wait: "Tunggu sebentar...",
    urlInvalid: "URL tidak valid",
    notFound: "Hasil tidak ditemukan!",
    register:
      "Anda belum terdaftar, silakan lakukan pendaftaran terlebih dahulu untuk menggunakan fitur ini.",
    limit:
      "Limit kamu sudah habis, silahkan ketik .claim atau membeli premium.",
  },
};
