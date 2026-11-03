import React, { useState } from 'react';
import { Compass } from 'lucide-react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#226B3E] via-[#287A47] to-[#1A1612] text-[#FAF7F2]/90 p-6 text-center ${className}`}
        role="img"
        aria-label={alt || fallbackLabel || 'Uganda Safari'}
      >
        <Compass className="w-8 h-8 text-[#D99B26] mb-2 opacity-90" />
        <span className="font-serif text-sm tracking-wide text-[#FAF7F2]">
          {fallbackLabel || alt || 'Enganda Safaris Uganda'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Enganda Safaris Uganda'}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};
