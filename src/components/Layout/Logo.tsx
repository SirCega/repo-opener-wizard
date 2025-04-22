
import React from 'react';
import { Wine } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary/20 p-1.5 rounded-md">
        <Wine className={`text-primary ${iconSizes[size]}`} />
      </div>
      {showText && (
        <span className={`font-bold ${textSizes[size]}`}>
          Liqui<span className="text-primary">Stock</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
