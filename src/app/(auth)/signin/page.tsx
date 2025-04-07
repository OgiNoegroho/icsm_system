// app/(auth)/signin/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { signIn } from "~/app/actions/auth";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setFormErrors({});

    try {
      // Get form values
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      // Get user agent for session tracking
      const userAgent = window.navigator.userAgent;

      // Call the server action
      const result = await signIn({
        email,
        password,
        userAgent,
      });

      if (result.error) {
        // Field validation errors
        if (result.fieldErrors) {
          setFormErrors(result.fieldErrors);
        } else {
          // General error
          setError(result.error);
        }
        return;
      }

      // Redirect to beranda on success
      router.push("/beranda");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal masuk. Silakan coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-md">
        {/* Card Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Masuk
          </h2>
          <p className="mt-1 text-center text-sm text-gray-500">
            Masukkan email dan password untuk melanjutkan
          </p>
        </div>

        {/* Card Content */}
        <div className="px-6 py-4">
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-800">
              <AlertCircle className="h-4 w-4" />
              <div>{error}</div>
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@perusahaan.com"
                  disabled={isLoading}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              {formErrors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:bg-indigo-400"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        {/* Card Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="text-center text-sm text-gray-500">
            <Link
              href="/forgot-password"
              className="text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Lupa password?
            </Link>
          </div>

          <div className="mt-4 text-center text-sm">
            Belum punya akun?{" "}
            <Link
              href="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Daftar disini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
