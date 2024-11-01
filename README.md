---

<h1 align="center">AR BASE WHATSAPP BOT</h1>

<p align="center">
<img src="" alt="AR-BASE Thumbnail">
</p>

--- 

# AR-BASE

**AR-BASE** adalah bot WhatsApp yang dirancang untuk membalas secara otomatis. Bot ini menggunakan library **Baileys** untuk berinteraksi dengan API WhatsApp Web dan mudah diatur serta digunakan.

## Fitur

- Performa ringan dan efisien.
- Sistem perintah yang mendukung berbagai fungsi.

## Table of Contents

- [Configurasi](#Configurasi)
- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Directory Structure](#directory-structure)
- [Dependencies](#dependencies)
- [Author](#author)
- [License](#license)


## Configurasi 

Untuk mengonfigurasi bot, Anda perlu membuat file `.env` di direktori utama proyek. File ini berisi semua variabel lingkungan yang diperlukan untuk menjalankan bot dengan benar. Anda dapat menggunakan file `.env.example` sebagai panduan.

### Langkah-langkah:

1. **Salin file `.env.example`:**
   Di dalam direktori utama proyek, temukan file bernama `.env.example`. Salin file ini dan beri nama `.env`.
   
```bash
cp .env.example .env
```

2. **Isi variabel lingkungan:**
   Buka file `.env` yang baru saja Anda buat dan isi nilai-nilai yang ada di file
   

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Arifzyn19/AR-BASE.git
   cd AR-BASE
   ```

2. Install the dependencies:

```bash
npm install
```

### Usage

To start the bot, use the following command:

```bash
npm start
```

Alternatively, you can use PM2 for process management:

```bash
npm run pm2
```

## Scripts

`start:` Starts the bot with a specified memory limit.

```bash
npm start
```

`pm2:` Starts the bot using PM2 with a specified name and memory limit.

```bash
npm run pm2
```

`restart:pm2:` Restarts the bot managed by PM2.

```bash
npm run restart:pm2
```

`stop:pm2:` Stops the bot managed by PM2.

```bash
npm run stop:pm2
```

### Directory Structure

```
.
├── LICENSE
├── README.md
├── package-lock.json
├── package.json
├── src
│   ├── commands
│   │   ├── menu.js
│   │   └── ping.js
│   ├── configs
│   │   └── config.js
│   ├── events
│   │   ├── connectionUpdate.js
│   │   ├── groupEvents.js
│   │   └── messageHandler.js
│   ├── handler.js
│   ├── index.js
│   └── lib
│       ├── client.js
│       ├── color.js
│       ├── commands.js
│       ├── database.js
│       ├── emoji.js
│       ├── function.js
│       ├── loadDB.js
│       ├── serialize.js
│       └── sticker.js
└── temp
    └── database.json
```

### License

This project is licensed under the MIT License. See the LICENSE file for details.

Feel free to replace `ArifzynXD` in the installation instructions with your actual GitHub username or the correct repository link. You can also customize any sections as needed to better fit your project's specifics!
