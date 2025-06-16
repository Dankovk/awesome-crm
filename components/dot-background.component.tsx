import { cn } from "@/lib/utils";
import React from "react";

interface DotBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function DotBackground({ children, className }: DotBackgroundProps) {
  return (
    <div className={cn("relative flex min-h-screen w-full items-center justify-center bg-white dark:bg-black", className)}>
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(circle_at_center,transparent_0.5px,transparent_0.5px)]",
        )}
        style={{
          backgroundImage: `
            radial-gradient(circle at center, transparent 0.5px, transparent 0.5px),
            linear-gradient(90deg, 
              rgba(236,72,153,0.4) 0%, 
              rgba(139,92,246,0.3) 50%, 
              rgba(6,182,212,0.4) 100%
            )
          `,
          maskImage: `
            radial-gradient(circle at center, black 0.5px, transparent 0.5px)
          `,
          WebkitMaskImage: `
            radial-gradient(circle at center, black 0.5px, transparent 0.5px)
          `,
          maskSize: '20px 20px',
          WebkitMaskSize: '20px 20px'
        }}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      
      {/* Content */}
      <div className=" z-20 w-full h-full">
        {children}
      </div>
    </div>
  );
} 