"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", {
      prompt: "select_account",
      callbackUrl: "/dashboard",
    });    
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-[#f7f5f3] flex flex-col">
      <header className="w-full border-b border-[#37322f]/6">
        <div className="max-w-[1060px] mx-auto px-4 py-4">
          <Link href="/" className="text-[#37322f] font-serif text-2xl hover:text-[#37322f]/80">
            Olai
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[420px]">
          {/* Form Container */}
          <div className="flex rounded-2xl shadow-sm p-8 border flex-col gap-4">
          
            {/* Heading */}
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-serif text-[#37322f]">
                Welcome back
              </h1>
              <p className="text-[#37322f]/70 text-sm font-medium">
                Sign in to your account
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#37322f]/20 rounded-lg hover:bg-white transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#37322f]/50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.258c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.001c0 1.452.348 2.827.957 4.041l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Continue with Google
              </span>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#37322f]/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[#f7f5f3] text-[#37322f]/70">or</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-3.5">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#37322f]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="px-4 py-2.5 rounded-lg border border-[#37322f]/12 bg-white text-[#37322f] placeholder:text-[#37322f]/50 focus:outline-none focus:ring-2 focus:ring-[#37322f]/50 focus:border-transparent text-sm"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#37322f]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-[#37322f]/12 bg-white text-[#37322f] placeholder:text-[#37322f]/50 focus:outline-none focus:ring-2 focus:ring-[#37322f]/50 focus:border-transparent text-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#37322f]/50 hover:text-[#37322f]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-[#37322f]/70 hover:text-[#37322f] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button with hover effect */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#37322f] hover:bg-white hover:text-[#37322f] hover:border-2 hover:border-[#37322f]/70 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2 focus:outline-none focus:ring-2 focus:ring-[#37322f]/70"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Sign up link */}
            <div className="text-center text-sm text-[#37322f]/70">
              Don't have an account?{" "}
              <Link 
                href="/register" 
                className="font-semibold text-[#37322f] hover:text-[#37322f]/80 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}