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
        return prev + 2;
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

          <div className="w-[2px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(47,55,49,0.25)] shadow-[1px_0px_0px_white] z-0"></div>

          <div className="self-stretch overflow-hidden border-b border-[rgba(91,215,84,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[50px] pb-10 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-1 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
              <div className="self-stretch border-b border-t border-[#bab9b7] flex justify-center items-center gap-0">
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
                Think freely. Organize naturally.
              </div>

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

              <div className="mt-10 flex justify-center items-center gap-4 z-10">
  <button
  onClick={(e) => window.open("https://github.com/sujaysharvesh/Olai", "_blank")}
    className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
  >
    {/* GitHub Logo */}
    <svg 
      className="w-4 h-4" 
      fill="currentColor" 
      viewBox="0 0 24 24" 
      aria-hidden="true"
    >
      <path 
        fillRule="evenodd" 
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" 
        clipRule="evenodd" 
      />
    </svg>
    GitHub Repo
  </button>
  <button
    onClick={(e) => router.push("/register")}
    className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
  >
    Start for free
    {/* Arrow Icon */}
    <svg 
      className="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M14 5l7 7m0 0l-7 7m7-7H3" 
      />
    </svg>
  </button>
</div>

              <div className="w-full max-w-[960px] lg:w-[960px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-8 sm:my-12 md:my-16 lg:my-16 mb-0 lg:pb-0">
                <div className="w-full max-w-[960px] lg:w-[960px] h-[200px] sm:h-[280px] md:h-[450px] lg:h-[455.55px] shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] overflow-hidden rounded-[6px] sm:rounded-[8px] lg:rounded-[9.06px] flex flex-col justify-start items-start">
                  <div className="self-stretch flex-1 flex justify-start items-start">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="relative w-full h-full overflow-hidden">
                        <div className="absolute inset-0 transition-all duration-500 ease-in-out">
                          <img
                            src="./home.png"
                            alt="Schedules Dashboard - Customer Subscription Management"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-stretch border-b border-t border-[#E0DEDB] flex justify-center items-start">
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                      ></div>
                    ))}
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="w-full dark:border-neutral-800 py-2 px-4 relative">
            <div className="max-w-[1000px] mx-auto flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-medium">Currently in Beta</span>
              </div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center max-w-md">
                This product is in active development and testing phase. Features may change and some functionality may be limited.
              </p>
              <div className="text-xs text-neutral-400 dark:text-neutral-500">
                © 2026 Olai. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}