# Menu Settings - Konfigurasi Copywriting Tiket Parkir

## Fitur Utama

### 1. Informasi Perusahaan

- **Nama Perusahaan**: Dapat diubah sesuai dengan nama tempat parkir
- **Alamat**: Alamat lengkap perusahaan/tempat parkir
- **Nomor Telepon**: Kontak yang dapat dihubungi

### 2. Pesan Footer

- **Pesan Baris 1**: Pesan pertama di bagian bawah tiket (default: "Terima kasih")
- **Pesan Baris 2**: Pesan kedua (default: "Simpan tiket ini")
- **Pesan Baris 3**: Pesan ketiga (default: "Tunjukkan saat keluar")

### 3. Opsi Tampilan

- **Tampilkan Tanggal & Waktu**: Toggle untuk menampilkan/menyembunyikan info waktu
- **Tampilkan Nomor Plat**: Toggle untuk menampilkan/menyembunyikan plat kendaraan
- **Tampilkan Tarif**: Toggle untuk menampilkan/menyembunyikan informasi tarif

## Cara Menggunakan

1. Buka aplikasi parkir
2. Klik tab "Settings" di bagian bawah
3. Ubah informasi sesuai kebutuhan:
   - Isi nama perusahaan, alamat, dan telepon
   - Sesuaikan pesan footer
   - Atur opsi tampilan dengan toggle switch
4. Klik tombol "Preview Tiket" untuk melihat hasil
5. Klik "Simpan Pengaturan" untuk menyimpan perubahan

## Fitur Tambahan

### Preview Tiket

- Menampilkan contoh tiket dengan pengaturan yang telah dipilih
- Membantu memastikan format tiket sesuai keinginan sebelum disimpan

### Reset Default

- Mengembalikan semua pengaturan ke nilai default
- Berguna jika ingin memulai dari awal

### Penyimpanan Otomatis

- Pengaturan tersimpan secara lokal di device
- Tidak hilang meskipun aplikasi ditutup
- Berlaku untuk semua tiket yang akan dicetak selanjutnya

## Catatan Penting

- Pastikan informasi perusahaan sudah benar sebelum menyimpan
- Pengaturan ini akan mempengaruhi semua tiket yang dicetak
- Jika ada masalah, gunakan fitur "Reset Default" untuk kembali ke pengaturan awal
- Format tiket tetap optimal untuk thermal printer 58mm

## Teknical Details

- Menggunakan AsyncStorage untuk penyimpanan lokal
- Konfigurasi tersimpan dalam format JSON
- Terintegrasi dengan sistem printing yang sudah ada
- Mendukung conditional rendering berdasarkan toggle settings
