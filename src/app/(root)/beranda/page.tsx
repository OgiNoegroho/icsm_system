"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  TrendingUp,
  Calendar,
  Package,
  Clipboard,
  Users,
  AlertTriangle,
  CheckCircle,
  Bell,
  Search,
  Menu,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export default function BerandaPage() {
  const [userName, setUserName] = useState("User");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Dummy data for stats
  const stats = [
    {
      title: "Total Produksi",
      value: "1,234",
      change: "+12%",
      isPositive: true,
      icon: <Package className="h-6 w-6 text-blue-600" />,
    },
    {
      title: "Pesanan Aktif",
      value: "28",
      change: "+3",
      isPositive: true,
      icon: <Clipboard className="h-6 w-6 text-green-600" />,
    },
    {
      title: "Material Menipis",
      value: "5",
      change: "-2",
      isPositive: true,
      icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
    },
    {
      title: "Tenaga Kerja",
      value: "42",
      change: "0",
      isPositive: true,
      icon: <Users className="h-6 w-6 text-purple-600" />,
    },
  ];

  // Dummy data for activities
  const activities = [
    {
      id: 1,
      title: "Pesanan #1234 selesai",
      time: "10 menit yang lalu",
      status: "success",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    {
      id: 2,
      title: "Material Bahan A menipis",
      time: "1 jam yang lalu",
      status: "warning",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    },
    {
      id: 3,
      title: "Pesanan baru #1242 diterima",
      time: "3 jam yang lalu",
      status: "info",
      icon: <Package className="h-5 w-5 text-blue-500" />,
    },
    {
      id: 4,
      title: "Laporan produksi Maret disetujui",
      time: "5 jam yang lalu",
      status: "success",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    {
      id: 5,
      title: "Pemeliharaan mesin A1 dijadwalkan",
      time: "1 hari yang lalu",
      status: "info",
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
    },
  ];

  // Dummy schedules
  const schedules = [
    { id: 1, title: "Meeting dengan supplier", time: "09:00", type: "meeting" },
    {
      id: 2,
      title: "Inspeksi kualitas produk batch #123",
      time: "11:30",
      type: "task",
    },
    {
      id: 3,
      title: "Deadline pengiriman pesanan #1230",
      time: "15:00",
      type: "deadline",
    },
    {
      id: 4,
      title: "Maintenance peralatan produksi",
      time: "16:30",
      type: "maintenance",
    },
  ];

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);

      // Get user data (in real app, would be from context or API)
      const storedName = localStorage.getItem("user_name");
      if (storedName) {
        setUserName(storedName);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Color class based on status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-amber-100 text-amber-800";
      case "danger":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Schedule type colors
  const getScheduleTypeClass = (type: string) => {
    switch (type) {
      case "meeting":
        return "border-l-blue-500";
      case "task":
        return "border-l-green-500";
      case "deadline":
        return "border-l-red-500";
      case "maintenance":
        return "border-l-amber-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mr-2 rounded p-2 hover:bg-gray-100 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <BarChart className="h-8 w-8 text-indigo-600" />
            <h1 className="hidden text-xl font-bold text-gray-800 md:block">
              Sistem Produksi
            </h1>
          </div>

          <div className="relative mx-4 hidden flex-1 md:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Cari pesanan, produk, atau material..."
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 hover:bg-gray-100">
              <Bell className="h-6 w-6 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            <div className="relative">
              <button
                className="flex items-center rounded-full bg-gray-100 p-1 pr-3 hover:bg-gray-200"
                onClick={() => {}}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="ml-2 hidden text-sm font-medium md:block">
                  {userName}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-[73px] left-0 z-20 h-[calc(100vh-73px)] w-64 -translate-x-full transform overflow-y-auto bg-white shadow-lg transition-transform duration-300 md:translate-x-0 ${isMenuOpen ? "translate-x-0" : ""} `}
        >
          <nav className="p-4">
            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center rounded-lg bg-indigo-50 px-4 py-3 text-indigo-700"
              >
                <BarChart className="mr-3 h-5 w-5" />
                <span className="font-medium">Beranda</span>
              </Link>

              <Link
                href="/dashboard/produksi"
                className="flex items-center rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <Package className="mr-3 h-5 w-5" />
                <span>Produksi</span>
              </Link>

              <Link
                href="/dashboard/laporan"
                className="flex items-center rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <TrendingUp className="mr-3 h-5 w-5" />
                <span>Laporan</span>
              </Link>

              <Link
                href="/dashboard/jadwal"
                className="flex items-center rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <Calendar className="mr-3 h-5 w-5" />
                <span>Penjadwalan</span>
              </Link>

              <Link
                href="/dashboard/profile"
                className="flex items-center rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <User className="mr-3 h-5 w-5" />
                <span>Profil</span>
              </Link>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-4">
              <button
                onClick={() => {
                  // Handle logout in real app
                  console.log("Logout clicked");
                }}
                className="flex w-full items-center rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Keluar</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Sidebar overlay for mobile */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/20 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <main className="flex-1 md:ml-64">
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            {/* Welcome header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Selamat datang, {userName}!
              </h1>
              <p className="mt-1 text-gray-500">
                Berikut ringkasan aktivitas produksi hari ini,{" "}
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Stats cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {isLoading
                ? // Skeleton loaders for stats
                  Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-lg bg-white p-5 shadow"
                      >
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                          <div className="ml-4 flex-1">
                            <div className="h-4 w-24 rounded bg-gray-200"></div>
                            <div className="mt-2 h-8 w-16 rounded bg-gray-200"></div>
                          </div>
                        </div>
                        <div className="mt-4 h-4 w-full rounded bg-gray-200"></div>
                      </div>
                    ))
                : stats.map((stat, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-md"
                    >
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="rounded-full bg-gray-50 p-3">
                            {stat.icon}
                          </div>
                          <div className="ml-4">
                            <h2 className="text-sm font-medium text-gray-500">
                              {stat.title}
                            </h2>
                            <p className="text-2xl font-bold text-gray-900">
                              {stat.value}
                            </p>
                            <p
                              className={`mt-1 flex items-center text-sm ${stat.isPositive ? "text-green-600" : "text-red-600"}`}
                            >
                              <span>{stat.change}</span>
                              <span className="ml-1 text-xs text-gray-500">
                                dari bulan lalu
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Activities section */}
              <div className="lg:col-span-2">
                <div className="rounded-lg bg-white shadow">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Aktivitas Terbaru
                    </h2>
                  </div>

                  <div className="p-4">
                    {isLoading ? (
                      // Skeleton loaders for activities
                      Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="flex animate-pulse items-center py-3"
                          >
                            <div className="h-9 w-9 rounded-full bg-gray-200"></div>
                            <div className="ml-3 flex-1">
                              <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                              <div className="mt-2 h-3 w-1/4 rounded bg-gray-200"></div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="space-y-3">
                        {activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-center rounded-md py-3 hover:bg-gray-50"
                          >
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                              {activity.icon}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity.time}
                              </p>
                            </div>
                            <div className="ml-auto">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(activity.status)}`}
                              >
                                {activity.status === "success"
                                  ? "Selesai"
                                  : activity.status === "warning"
                                    ? "Perhatian"
                                    : "Info"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 text-center">
                      <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        Lihat semua aktivitas →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chart section */}
                <div className="mt-6 rounded-lg bg-white shadow">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Performa Produksi
                    </h2>
                  </div>

                  <div className="p-6">
                    {isLoading ? (
                      <div className="h-64 w-full animate-pulse rounded bg-gray-200"></div>
                    ) : (
                      <div className="h-64 w-full rounded bg-gray-50 p-4">
                        <div className="flex h-full w-full items-center justify-center">
                          <p className="text-center text-gray-500">
                            Chart produksi akan ditampilkan di sini
                            <br />
                            <span className="text-sm text-gray-400">
                              (Data visualisasi akan terintegrasi dengan data
                              produksi)
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Side panels */}
              <div className="space-y-6">
                {/* Today's schedule */}
                <div className="rounded-lg bg-white shadow">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900">
                        Jadwal Hari Ini
                      </h2>
                      <span className="text-sm text-gray-500">
                        {new Date().toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    {isLoading ? (
                      // Skeleton loaders for schedules
                      Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="mb-3 flex animate-pulse">
                            <div className="mr-3 h-14 w-14 rounded bg-gray-200"></div>
                            <div className="flex-1">
                              <div className="h-4 w-full rounded bg-gray-200"></div>
                              <div className="mt-2 h-3 w-1/3 rounded bg-gray-200"></div>
                            </div>
                          </div>
                        ))
                    ) : schedules.length > 0 ? (
                      <div className="space-y-3">
                        {schedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className={`flex items-center rounded-md border-l-4 p-3 hover:bg-gray-50 ${getScheduleTypeClass(schedule.type)}`}
                          >
                            <div className="mr-3 rounded bg-gray-100 px-3 py-2 text-center">
                              <span className="block text-xs font-medium text-gray-500">
                                JAM
                              </span>
                              <span className="text-lg font-bold text-gray-900">
                                {schedule.time}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {schedule.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {schedule.type === "meeting"
                                  ? "Rapat"
                                  : schedule.type === "task"
                                    ? "Tugas"
                                    : schedule.type === "deadline"
                                      ? "Tenggat"
                                      : "Pemeliharaan"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-gray-500">
                        <Calendar className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                        <p>Tidak ada jadwal untuk hari ini</p>
                      </div>
                    )}

                    <div className="mt-4 text-center">
                      <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        Lihat kalender lengkap →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="rounded-lg bg-white shadow">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Aksi Cepat
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4">
                    <button className="flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                      <Package className="mb-2 h-6 w-6 text-indigo-600" />
                      <span className="text-center text-sm font-medium">
                        Tambah Produksi
                      </span>
                    </button>
                    <button className="flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                      <Clipboard className="mb-2 h-6 w-6 text-indigo-600" />
                      <span className="text-center text-sm font-medium">
                        Buat Laporan
                      </span>
                    </button>
                    <button className="flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                      <Calendar className="mb-2 h-6 w-6 text-indigo-600" />
                      <span className="text-center text-sm font-medium">
                        Jadwalkan
                      </span>
                    </button>
                    <button className="flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                      <Users className="mb-2 h-6 w-6 text-indigo-600" />
                      <span className="text-center text-sm font-medium">
                        Kelola Tim
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
