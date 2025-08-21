# 🤖 Bursa Perkebunan Discord Bot

Bot Discord multifungsi yang dirancang untuk menangani sistem **cooldown**, **estimasi produksi**, dan **transaksi order** dengan tampilan interaktif dan fitur QR Code. Cocok untuk komunitas Blox Fruit atau kebutuhan sistem toko berbasis pesanan.

---

## ✨ Fitur Utama

### 🎯 Cooldown Gacha
- Menampilkan status cooldown gacha pengguna.
- Reminder otomatis saat cooldown habis.
- Admin bisa melakukan reset cooldown.
- Format waktu dalam WIB (UTC+7).

### 🧮 Estimasi Produksi Order
- Input jumlah order dalam juta (M) lewat tombol interaktif.
- Menampilkan estimasi dari 3 toko berbeda dengan format:
  - ⏱ Normal Time dan Gamepass Time
  - 💰 Harga per M dan Total Harga
  - 🛍 Toko A: Apeng, Toko B: Erer, Toko C: Agus
- Estimasi disajikan dengan gaya pesan yang berbeda untuk setiap toko.

### 💸 Transaksi Order via QR
- Pengguna input jumlah order via tombol.
- Bot otomatis menampilkan:
  - Jumlah order
  - Total harga
  - QR Code untuk pembayaran

---

## 🖼 Contoh Tampilan

### 🔄 Cooldown Gacha
> `@User, cooldown kamu sudah habis! Ayo gacha lagi!`

### 🧾 Estimasi Produksi
Estimasi Normal: 8 jam 48 menit (Selesai: 21/8/2025, 17.50)
Dengan Gamepass: 5 jam 30 menit (Selesai: 21/8/2025, 14.32)
Harga/M: Rp1.000 | Total: Rp20.000

### 💰 Transaksi QR
Jumlah Order: 5
Harga Total: Rp5.000
[QR Code Otomatis Ditampilkan]

---

## ⚙️ Teknologi yang Digunakan
- `Node.js`
- `discord.js`
- QR Code Generator
- Button-based Interaction (Discord Components)
- JSON-based local data management

---

## 📁 Struktur Direktori (Contoh)
├── commands/
├── features/
├── utils/
├── index.js
├── .env
├── .gitignore
├── package.json

---

## 🚫 Catatan Keamanan
Pastikan file `.env` **tidak di-push ke GitHub**. Sudah ditambahkan ke `.gitignore`, dan token Discord harus tetap rahasia.

Jika token pernah ter-push, **ganti token segera dari Discord Developer Portal** dan lakukan re-init repo.

---

## 📌 Developer
- Dibuat oleh: **Apengjers**
- Dibangun dengan ❤️ untuk komunitas Discord Blox Fruit & Gacha Store.

---

## 📜 Lisensi
Proyek ini dibuat untuk keperluan pribadi dan komunitas. Gunakan dengan bijak.
