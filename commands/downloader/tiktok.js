export default {
  cmd: ["tiktok", "tt"],
  name: "tiktok",
  category: "downloader",
  description: "Download video dari TikTok",
  execute: async (m, { client, API }) => {
    if (!m.text) throw "Silakan masukkan URL TikTok yang ingin diunduh.";

    try {
      const response = await API.call("/download/tiktok", {
        url: m.text,
      });

      if (response && response.result) {
        const { video } = response.result;

        await m.reply(video.noWatermark, {
          caption: "Berikut video TikTok yang Anda minta!",
        });
      } else {
        throw "Gagal mengunduh video. Pastikan URL TikTok yang Anda masukkan benar.";
      }
    } catch (error) {
      console.error(error);
      await m.reply(`Terjadi kesalahan: ${error.message || error}`);
    }
  },
};
