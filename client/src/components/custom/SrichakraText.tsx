import React from 'react';
import { cn } from '@/lib/utils';

interface SrichakraTextProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  color?: string;
  decorative?: boolean;
  withBorder?: boolean;
}

/**
 * A component that renders "Srichakra" text in a Sanskrit-inspired style using the Samarkan font
 */
const SrichakraText: React.FC<React.PropsWithChildren<SrichakraTextProps>> = ({
  className,
  size = 'xl',
  color = 'text-amber-800',
  decorative = true,
  withBorder = false,
  children
}) => {
  const sizeClasses = {
    'sm': 'text-sm',
    'md': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
  };

  const decorationBefore = decorative ? "before:content-['॥'] before:mr-3 before:text-amber-600 before:opacity-80" : "";
  const decorationAfter = decorative ? "after:content-['॥'] after:ml-3 after:text-amber-600 after:opacity-80" : "";
  
  // Text border style using text-shadow (works better than Tailwind for text outlines)
  const textBorderStyle = withBorder ? { 
    textShadow: `
      -0.5px -0.5px 0 #fff,
      0.5px -0.5px 0 #fff,
      -0.5px 0.5px 0 #fff,
      0.5px 0.5px 0 #fff
    `
  } : {};
  
  return (
    <div 
      className={cn(
        'font-[Samarkan] tracking-wider relative inline-flex items-center justify-center', 
        sizeClasses[size],
        color,
        decorationBefore,
        decorationAfter,
        'before:font-normal before:not-italic after:font-normal after:not-italic',
        className
      )}
    >
      <div className="relative px-1">
        {/* Optional decorative line above the text */}
        {decorative && (
          <div className="absolute -top-1 left-0 right-0 h-[1px] bg-amber-600/30"></div>
        )}
        
        {/* Main text with Samarkan font */}
        <span className="tracking-wide leading-relaxed" style={textBorderStyle}>
          {children || 'श्रीचक्र'}
        </span>
        
        {/* Optional decorative line below the text */}
        {decorative && (
          <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-amber-600/30"></div>
        )}
      </div>
    </div>
  );
};

export default SrichakraText;