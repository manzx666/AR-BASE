import axios from "axios";
import baileys from "@whiskeysockets/baileys";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs";

export async function sendUrlPreview(m) {
  try {
    const url = "https://api.akanebot.xyz";

    // Fungsi untuk mengambil gambar dan mengubahnya menjadi buffer
    async function getImageBuffer(imageUrl) {
      try {
        const response = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });
        return Buffer.from(response.data, "binary");
      } catch (error) {
        console.error("Error getting image:", error);
        return null;
      }
    }

    // Dapatkan thumbnail image (ganti URL sesuai dengan thumbnail yang diinginkan)
    const thumbnailUrl = "https://cdn.arifzyn.tech/f/c5ibbe3z.jpg"; // Ganti dengan URL thumbnail Anda
    const thumbnailBuffer = await getImageBuffer(thumbnailUrl);

    const message = {
      extendedTextMessage: {
        text: url,
        matchedText: url,
        canonicalUrl: url,
        description:
          "Akane Bot menyediakan fitur fitur yang dapat anda gunakan secara gratis.",
        title: "Bot WhatsApp Gratis | Akane Bot",
        previewType: 0,
        jpegThumbnail: thumbnailBuffer, // Tambahkan thumbnail di sini
        thumbnailHeight: 512,
        thumbnailWidth: 1024,
        inviteLinkGroupTypeV2: 0,
      },
    };

    // Jika Anda menggunakan baileys v4 atau lebih baru
    const waMessage = await baileys.generateWAMessageFromContent(
      m.chat,
      message,
      {
        quoted: m.quoted,
      },
    );

    return await this.relayMessage(m.chat, waMessage.message, {
      messageId: waMessage.key.id,
    });
  } catch (error) {
    console.error("Error sending URL preview:", error);
    throw error;
  }
}

// Versi alternatif menggunakan local file
export async function sendUrlPreviewLocal(m) {
  try {
    const url = "https://api.akanebot.xyz";

    // Baca file thumbnail local
    const readFileAsync = promisify(readFile);
    const thumbnailBuffer = await readFileAsync("./thumbnail.jpg");

    const message = {
      extendedTextMessage: {
        text: url,
        matchedText: url,
        canonicalUrl: url,
        description:
          "Akane Bot menyediakan fitur fitur yang dapat anda gunakan secara gratis.",
        title: "Bot WhatsApp Gratis | Akane Bot",
        previewType: 0,
        jpegThumbnail: thumbnailBuffer,
        thumbnailHeight: 512,
        thumbnailWidth: 1024,
        inviteLinkGroupTypeV2: 0,
      },
    };

    const waMessage = await baileys.generateWAMessageFromContent(
      m.chat,
      message,
      {
        quoted: m.quoted,
      },
    );

    return await this.relayMessage(m.chat, waMessage.message, {
      messageId: waMessage.key.id,
    });
  } catch (error) {
    console.error("Error sending URL preview:", error);
    throw error;
  }
}

// Versi dengan thumbnail dari URL yang di-download
export async function sendUrlPreviewDownload(m) {
  try {
    const url = "https://api.akanebot.xyz";
    const thumbnailUrl = "https://cdn.arifzyn.tech/f/c5ibbe3z.jpg"; // Ganti dengan URL thumbnail Anda

    // Download dan simpan thumbnail
    const response = await axios.get(thumbnailUrl, {
      responseType: "arraybuffer",
    });

    // Konversi ke buffer
    const thumbnailBuffer = Buffer.from(response.data, "binary");

    const message = {
      extendedTextMessage: {
        text: url,
        matchedText: url,
        canonicalUrl: url,
        description:
          "Akane Bot menyediakan fitur fitur yang dapat anda gunakan secara gratis.",
        title: "Bot WhatsApp Gratis | Akane Bot",
        previewType: 0,
        jpegThumbnail: thumbnailBuffer,
        thumbnailHeight: 512,
        thumbnailWidth: 1024,
        inviteLinkGroupTypeV2: 0,
      },
    };

    const waMessage = await baileys.generateWAMessageFromContent(
      m.chat,
      message,
      {
        quoted: m.quoted,
      },
    );

    return await this.relayMessage(m.chat, waMessage.message, {
      messageId: waMessage.key.id,
    });
  } catch (error) {
    console.error("Error sending URL preview:", error);
    throw error;
  }
}
