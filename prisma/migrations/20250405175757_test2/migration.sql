/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PeranPengguna" AS ENUM ('Admin_Produksi', 'Admin_Gudang', 'Bendahara', 'Pemasaran', 'Pimpinan');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('Lunas', 'Menunggu', 'Jatuh_Tempo');

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "pengguna" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "peran" "PeranPengguna" NOT NULL,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produk" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT,
    "komposisi" TEXT,
    "deskripsi" TEXT,
    "harga" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gambar_produk" (
    "id" SERIAL NOT NULL,
    "produk_id" INTEGER NOT NULL,
    "url_gambar" TEXT NOT NULL,
    "id_publik_gambar" TEXT NOT NULL,
    "nama_file_gambar" TEXT,
    "utama" BOOLEAN NOT NULL DEFAULT false,
    "diunggah_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gambar_produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "produk_id" INTEGER NOT NULL,
    "kuantitas" INTEGER NOT NULL,
    "tanggal_kadaluarsa" TIMESTAMP(3) NOT NULL,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outlet" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "nomor_telepon" TEXT,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stok_outlet" (
    "id" SERIAL NOT NULL,
    "outlet_id" INTEGER NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "kuantitas" INTEGER NOT NULL,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stok_outlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribusi" (
    "id" SERIAL NOT NULL,
    "outlet_id" INTEGER NOT NULL,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distribusi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_distribusi" (
    "id" SERIAL NOT NULL,
    "distribusi_id" INTEGER NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "kuantitas_terjual" INTEGER NOT NULL,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detail_distribusi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penjualan" (
    "id" SERIAL NOT NULL,
    "outlet_id" INTEGER NOT NULL,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penjualan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_penjualan" (
    "id" SERIAL NOT NULL,
    "penjualan_id" INTEGER NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "kuantitas_terjual" INTEGER NOT NULL,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detail_penjualan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faktur" (
    "id" SERIAL NOT NULL,
    "penjualan_id" INTEGER NOT NULL,
    "nomor_faktur" TEXT NOT NULL,
    "status_pembayaran" "StatusPembayaran" NOT NULL,
    "tanggal_faktur" TIMESTAMP(3) NOT NULL,
    "tanggal_jatuh_tempo" TIMESTAMP(3) NOT NULL,
    "jumlah_tagihan" DECIMAL(10,2) NOT NULL,
    "jumlah_dibayar" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faktur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengembalian" (
    "id" SERIAL NOT NULL,
    "outlet_id" INTEGER NOT NULL,
    "tanggal_pengembalian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengembalian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_pengembalian" (
    "id" SERIAL NOT NULL,
    "pengembalian_id" INTEGER NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "kuantitas" INTEGER NOT NULL,
    "alasan" TEXT,
    "dibuat_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detail_pengembalian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "faktur_nomor_faktur_key" ON "faktur"("nomor_faktur");

-- AddForeignKey
ALTER TABLE "gambar_produk" ADD CONSTRAINT "gambar_produk_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch" ADD CONSTRAINT "batch_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_outlet" ADD CONSTRAINT "stok_outlet_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_outlet" ADD CONSTRAINT "stok_outlet_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribusi" ADD CONSTRAINT "distribusi_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_distribusi" ADD CONSTRAINT "detail_distribusi_distribusi_id_fkey" FOREIGN KEY ("distribusi_id") REFERENCES "distribusi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_distribusi" ADD CONSTRAINT "detail_distribusi_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penjualan" ADD CONSTRAINT "penjualan_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penjualan" ADD CONSTRAINT "detail_penjualan_penjualan_id_fkey" FOREIGN KEY ("penjualan_id") REFERENCES "penjualan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penjualan" ADD CONSTRAINT "detail_penjualan_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faktur" ADD CONSTRAINT "faktur_penjualan_id_fkey" FOREIGN KEY ("penjualan_id") REFERENCES "penjualan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengembalian" ADD CONSTRAINT "pengembalian_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pengembalian" ADD CONSTRAINT "detail_pengembalian_pengembalian_id_fkey" FOREIGN KEY ("pengembalian_id") REFERENCES "pengembalian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pengembalian" ADD CONSTRAINT "detail_pengembalian_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
