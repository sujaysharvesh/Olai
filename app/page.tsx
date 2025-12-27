"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="px-[14px] py-[6px] bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] border border-[rgba(2,6,23,0.08)] shadow-xs">
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center">
        {icon}
      </div>
      <div className="text-center flex justify-center flex-col text-[#37322F] text-xs font-medium leading-3 font-sans">
        {text}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [activeCard, setActiveCard] = useState(0);
  const [progress, setProgress] = useState(0);
  const mountedRef = useRef(true);
  const router = useRouter();

  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (!mountedRef.current) return;

      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) {
            setActiveCard((current) => (current + 1) % 3);
          }
          return 0;
        }
        return prev + 2; // 2% every 100ms = 5 seconds total
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleCardClick = (index: number) => {
    if (!mountedRef.current) return;
    setActiveCard(index);
    setProgress(0);
  };

  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-start items-center">
      <div className="relative flex flex-col justify-start items-center w-full">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen">
          <div className="w-[2px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="w-[2px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="self-stretch overflow-hidden border-b border-[rgba(55,50,47,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            {/* Navigation */}
            {/* <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
              <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]"></div>

              <div className="w-full max-w-[calc(100%-31px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[1000px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-[#F7F5F3] backdrop-blur-lg shadow-[0px_0px_0px_2px_gray] overflow-hidden flex justify-between items-center relative z-30">
                <div className="flex justify-center items-center">
                  <div className="flex justify-start items-center">
                    <div className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-2xl font-medium leading-5 font-serif">
                      Olai
                    </div>
                  </div>
                  <div className="pl-3 sm:pl-4 md:pl-5 lg:pl-5 flex justify-start items-start sm:flex flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-4">
                    <div className="flex justify-start items-center">
                      <div className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium leading-[14px] font-sans">
                        Products
                      </div>
                    </div>
                    <div className="flex justify-start items-center">
                      <div className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium leading-[14px] font-sans">
                        Pricing
                      </div>
                    </div>
                    <div className="flex justify-start items-center">
                      <div className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium leading-[14px] font-sans">
                        Docs
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-8 sm:h-9 md:h-10 flex justify-start items-start gap-2 sm:gap-3">
                  <div className="h-full px-4 sm:px-5 md:px-6 lg:px-7 py-2 sm:py-2.5 bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] overflow-hidden rounded-full flex justify-center items-center">
                    <button
                      onClick={() => router.push("/login")}
                      className="flex flex-col justify-center text-[#37322F] text-sm sm:text-sm md:text-[15px] font-medium leading-5 font-sans"
                    >
                      Log in
                    </button>
                  </div>
                </div>
              </div>
            </div> */}
            <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[50px] pb-10 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-1 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
              <div className="self-stretch border-b border-t border-[#a6a5a3] flex justify-center items-center gap-0">
                <div className="flex-1 h-20 relative overflow-hidden self-stretch">
                  <div className="absolute inset-0">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div
                        key={`middle-${i}`}
                        className="absolute w-px bg-black/15 rotate-[35deg] origin-top-left"
                        style={{
                          left: `${i * 8}px`,
                          top: `-${30 + i * 0.3}px`,
                          height: `${150 + i * 1}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="h-20 border-l border-black/15" />
                <div className="px-8 py-2 flex-shrink-0">
                  <h1 className="text-6xl font-light font-caslon text-gray-900 whitespace-nowrap tracking-wide">
                    Olai
                  </h1>
                </div>

                <div className="h-20 border-l border-black/15" />

                <div className="px-8 py-2 flex-shrink-0 group relative">
                  <h1 className="text-xl font-semibold font-caslon  text-gray-700 whitespace-nowrap hover: text-gray-900 transition-all duration-300 cursor-pointer tracking-wide">
                    Features
                  </h1>
                  <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-black/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>
                <div className="h-20 border-l border-black/15" />
                <div className="flex-1 h-20 relative overflow-hidden">
                  <div className="absolute inset-0">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div
                        key={`middle-${i}`}
                        className="absolute w-px bg-black/15 rotate-[35deg] origin-top-left"
                        style={{
                          left: `${i * 8}px`,
                          top: `-${30 + i * 0.3}px`,
                          height: `${150 + i * 1}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="h-20 border-l border-black/15" />

                <div className="px-8 py-2 flex-shrink-0 group relative">
                  <button
                    onClick={(e) => router.push("/login")}
                    className="text-xl font-semibold font-caslon  text-gray-700 whitespace-nowrap hover:text-gray-900 transition-all duration-300 cursor-pointer tracking-wide"
                  >
                    Login
                  </button>
                  <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-black/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>

                <div className="h-20 border-l border-black/15" />

                <div className="flex-1 h-20 relative overflow-hidden">
                  <div className="absolute inset-0">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div
                        key={`right-${i}`}
                        className="absolute w-px bg-black/15 rotate-[35deg] origin-top-left"
                        style={{
                          left: `${i * 8}px`,
                          top: `-${30 + i * 0.3}px`,
                          height: `${150 + i * 1}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full max-w-[800px] lg:w-[800px] text-center flex justify-center mt-20 flex-col text-[#37322F] text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[50px] font-caslon leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-medium px-2 sm:px-4 md:px-0">
                Designed as a free, flexible space where ideas evolve naturally
                over time.
              </div>

              <div className="w-full mt-10 max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-xl font-bold text-xl">
                Designed as a free, flexible space
                <br className="hidden sm:block" />
                where ideas evolve naturally over time.
              </div>

              {/* <div className="w-full max-w-[497px] lg:w-[497px] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
                <div className="backdrop-blur-[8.25px] flex justify-start items-center gap-4">
                  <div className="h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px] relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center">
                    <div className="pointer-events-none w-20 sm:w-24 hover:bg-white md:w-28 lg:w-44 h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>

                    <button
                      onClick={() => router.push("/register")}
                      className="relative z-10 text-white text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans"
                    >
                      Start for free
                    </button>
                  </div>
                </div>
              </div> */}
              <div className="absolute top-[232px] sm:top-[248px] md:top-[264px] lg:top-[320px] left-1/2 transform -translate-x-1/2 z-0 pointer-events-none">
                <img
                  src="/mask-group-pattern.svg"
                  alt=""
                  className="w-[936px] sm:w-[1404px] md:w-[2106px] lg:w-[2808px] h-auto opacity-30 sm:opacity-40 md:opacity-50 mix-blend-multiply"
                  style={{
                    filter: "hue-rotate(15deg) saturate(0.7) brightness(1.2)",
                  }}
                />
              </div>

              <div className="mt-10 gap-2 w-full flex flex-col justify-center z-10 items-center">
              <button onClick={(e) => router.push('/register')} 
              className="">
                start for free
              </button>
              </div>
              
              <div className="w-full max-w-[960px] lg:w-[960px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-8 sm:my-12 md:my-16 lg:my-16 mb-0 lg:pb-0">
                <div className="w-full max-w-[960px] lg:w-[960px] h-[200px] sm:h-[280px] md:h-[450px] lg:h-[695.55px] bg-white shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] overflow-hidden rounded-[6px] sm:rounded-[8px] lg:rounded-[9.06px] flex flex-col justify-start items-start">
                  {/* Dashboard Content */}
                  <div className="self-stretch flex-1 flex justify-start items-start">
                    {/* Main Content */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="relative w-full h-full overflow-hidden">
                        {/* Product Image 1 - Plan your schedules */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                            activeCard === 0
                              ? "opacity-100 scale-100 blur-0"
                              : "opacity-0 scale-95 blur-sm"
                          }`}
                        >
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dsadsadsa.jpg-xTHS4hGwCWp2H5bTj8np6DXZUyrxX7.jpeg"
                            alt="Schedules Dashboard - Customer Subscription Management"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Image 2 - Data to insights */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                            activeCard === 1
                              ? "opacity-100 scale-100 blur-0"
                              : "opacity-0 scale-95 blur-sm"
                          }`}
                        >
                          <img
                            src="/analytics-dashboard-with-charts-graphs-and-data-vi.jpg"
                            alt="Analytics Dashboard"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Image 3 - Data visualization */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                            activeCard === 2
                              ? "opacity-100 scale-100 blur-0"
                              : "opacity-0 scale-95 blur-sm"
                          }`}
                        >
                          <img
                            src="/data-visualization-dashboard-with-interactive-char.jpg"
                            alt="Data Visualization Dashboard"
                            className="w-full h-full object-contain" // Changed from object-cover to object-contain to preserve landscape aspect ratio
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-stretch border-b border-t border-[#E0DEDB] flex justify-center items-start">
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  {/* Left decorative pattern */}
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 px-0 sm:px-2 md:px-0 flex flex-col md:flex-row justify-center items-stretch gap-0">
                  <FeatureCard
                    title="Plan your schedules"
                    description="Streamline customer subscriptions and billing with automated scheduling tools."
                    isActive={activeCard === 0}
                    progress={activeCard === 0 ? progress : 0}
                    onClick={() => handleCardClick(0)}
                  />
                  <FeatureCard
                    title="Analytics & insights"
                    description="Transform your business data into actionable insights with real-time analytics."
                    isActive={activeCard === 1}
                    progress={activeCard === 1 ? progress : 0}
                    onClick={() => handleCardClick(1)}
                  />
                  <FeatureCard
                    title="Collaborate seamlessly"
                    description="Keep your team aligned with shared dashboards and collaborative workflows."
                    isActive={activeCard === 2}
                    progress={activeCard === 2 ? progress : 0}
                    onClick={() => handleCardClick(2)}
                  />
                </div>

                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  {/* Right decorative pattern */}
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  isActive,
  progress,
  onClick,
}: {
  title: string;
  description: string;
  isActive: boolean;
  progress: number;
  onClick: () => void;
}) {
  return (
    <div
      className={`w-full md:flex-1 self-stretch px-6 py-5 overflow-hidden bg-slate-50 flex flex-col justify-start items-start gap-2 cursor-pointer relative border-b md:border-b-0 last:border-b-0 ${
        isActive
          ? "bg-white shadow-[0px_0px_0px_0.75px_#E0DEDB_inset]"
          : "border-l-0 border-r-0 md:border border-[#E0DEDB]/80"
      }`}
      onClick={onClick}
    >
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-[rgba(50,45,43,0.08)]">
          <div
            className="h-full bg-[#322D2B] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="self-stretch flex justify-center flex-col text-[#49423D] text-sm md:text-sm font-semibold leading-6 md:leading-6 font-sans">
        {title}
      </div>
      <div className="self-stretch text-[#605A57] text-[13px] md:text-[13px] font-normal leading-[22px] md:leading-[22px] font-sans">
        {description}
      </div>
    </div>
  );
}
