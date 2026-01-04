"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const MAX_USERNAME_LENGTH = 30;
  const MAX_EMAIL_LENGTH = 100;
  const MAX_PASSWORD_LENGTH = 128;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let limitedValue = value;
    if (name === 'username' && value.length > MAX_USERNAME_LENGTH) {
      limitedValue = value.slice(0, MAX_USERNAME_LENGTH);
    } else if (name === 'email' && value.length > MAX_EMAIL_LENGTH) {
      limitedValue = value.slice(0, MAX_EMAIL_LENGTH);
    } else if ((name === 'password' || name === 'confirmPassword') && value.length > MAX_PASSWORD_LENGTH) {
      limitedValue = value.slice(0, MAX_PASSWORD_LENGTH);
    }

    setFormData({
      ...formData,
      [name]: limitedValue,
    });
        if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log(data)

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      router.push("/login");
    
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", {
      callbackUrl: "/",
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
      
      {/* Main Content - Moved up with reduced padding */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[420px]">
          {/* Form Container */}
          <div className="flex rounded-2xl shadow-sm p-8 border flex-col gap-4">
          
            {/* Heading */}
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-serif text-[#37322f]">
                Create your account
              </h1>
              <p className="text-[#37322f]/70 text-sm font-medium">
                Join Brillance and streamline your billing
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              type="button"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[#37322f]/20 rounded-lg hover:bg-white transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#37322f]"
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-[#37322f]"
                  >
                    Username
                  </label>
                 
                </div>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={MAX_USERNAME_LENGTH}
                  className="px-4 py-2.5 rounded-lg border border-[#37322f]/12 bg-white text-[#37322f] placeholder:text-[#37322f]/50 focus:outline-none focus:ring-2 focus:ring-[#37322f]/50 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-[#37322f]"
                  >
                    Email address
                  </label>
    
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={MAX_EMAIL_LENGTH}
                  className="px-4 py-2.5 rounded-lg border border-[#37322f]/12 bg-white text-[#37322f] placeholder:text-[#37322f]/50 focus:outline-none focus:ring-2 focus:ring-[#37322f]/50 focus:border-transparent text-sm"
                />
              </div>

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
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    maxLength={MAX_PASSWORD_LENGTH}
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

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-[#37322f]"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    maxLength={MAX_PASSWORD_LENGTH}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#37322f]/12 bg-white text-[#37322f] placeholder:text-[#37322f]/50 focus:outline-none focus:ring-2 focus:ring-[#37322f]/50 focus:border-transparent text-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#37322f]/50 hover:text-[#37322f]"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <p className={`text-xs ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.password === formData.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#37322f] hover:bg-white hover:text-[#37322f] hover:border-2 hover:border-[#37322f]/70 text-white rounded-lg font-medium text-sm  mt-2 focus:outline-none focus:ring-2 focus:ring-[#37322f]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            {/* Sign in link */}
            <div className="text-center text-sm text-[#37322f]/70">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="font-semibold text-[#37322f] hover:text-[#37322f]/80 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}