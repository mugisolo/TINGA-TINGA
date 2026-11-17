import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel?: string;
}

function extractDriveFileId(url?: string): string | null {
  if (!url) return null;
  const thumbMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (thumbMatch) return thumbMatch[1];
  const lh3Match = url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/);
  if (lh3Match) return lh3Match[1];
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (fileMatch) return fileMatch[1];
  return null;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
  ...rest
}) => {
  const [attempt, setAttempt] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setHasError(false);
  }, [src]);

  const driveId = extractDriveFileId(src);

  const resolvedSrc = React.useMemo(() => {
    if (!src) return '';
    if (!driveId) return src;
    if (attempt === 0) {
      return `https://lh3.googleusercontent.com/d/${driveId}=w1600`;
    }
    if (attempt === 1) {
      return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`;
    }
    return src;
  }, [src, driveId, attempt]);

  if (hasError || !resolvedSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#226B3E] via-[#287A47] to-[#1A1612] text-[#FAF7F2]/90 p-6 text-center ${className}`}
        role="img"
        aria-label={alt || fallbackLabel || 'Uganda Safari'}
      >
        <Compass className="w-8 h-8 text-[#D99B26] mb-2 opacity-90" />
        <span className="font-serif text-sm tracking-wide text-[#FAF7F2]">
          {fallbackLabel || alt || 'WildLife & Tingatinga Safaris Uganda'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt || 'WildLife Safaris Uganda'}
      referrerPolicy="no-referrer"
      onError={() => {
        if (driveId && attempt < 1) {
          setAttempt((prev) => prev + 1);
        } else {
          setHasError(true);
        }
      }}
      className={className}
      {...rest}
    />
  );
};
