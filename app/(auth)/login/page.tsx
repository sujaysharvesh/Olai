"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const { data: session, status } = useSession();
  
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // const [formData, setFormData] = useState<FormData>({
  //   email: "",
  //   password: "",
  // });

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.id]: e.target.value,
  //   });
  // };

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

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   try {
  //     const response = await fetch("/api/auth/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     if (!response.ok) {
  //       const data = await response.json();
  //       alert(data.error || "Login failed");
  //       return;
  //     }

  //     router.push("/dashboard");
  //   } catch (err) {
  //     console.error("Login error:", err);
  //     alert("Something went wrong");
  //   }
  // };

  const handleGoogleLogin = () => {
    signIn("google", {
      prompt: "select_account",
      callbackUrl: "/profile",
    });    
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full ">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-gray-900 mb-2">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-white transition-colors mb-6 bg-white"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.258c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
            <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.001c0 1.452.348 2.827.957 4.041l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-medium text-gray-700">Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-gray-50 text-gray-500">or</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm placeholder-gray-400 bg-white"
              required
            />
          </div>

          <div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm placeholder-gray-400 bg-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Sign in
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Don't have an account?{" "}
            <a 
              href="#" 
              className="text-gray-600 hover:text-gray-800 font-medium"
              onClick={(e) => {
                e.preventDefault();
                // Navigate to signup
                router.push("/register");
              }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}