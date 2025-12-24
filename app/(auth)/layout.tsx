"use client"

export default function AuthLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col">
 {/* or max-w-xl */}
        {children}
      </div>
  );
}