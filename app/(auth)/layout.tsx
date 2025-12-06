"use client"

export default function AuthLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg"> {/* or max-w-xl */}
        {children}
      </div>
    </div>
  );
}