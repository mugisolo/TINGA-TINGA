import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Award, Info, X } from 'lucide-react';
import { ShortlistProviderType } from '../types';

export interface ServiceProviderVerifiedBadgeProps {
  providerType: ShortlistProviderType;
  badgeLabel?: string;
  utbLicenseNumber?: string;
  uwaAccreditationId?: string;
  authorityNotes?: string[];
  variant?: 'emerald' | 'gold' | 'dark' | 'light';
  size?: 'sm' | 'md';
  showLicenseInline?: boolean;
  className?: string;
}

const PROVIDER_TYPE_AUTHORITY: Record<
  ShortlistProviderType,
  {
    defaultBadge: string;
    authorityTitle: string;
    verificationSummary: string;
  }
> = {
  guide: {
    defaultBadge: 'Enganda Verified Specialist',
    authorityTitle: 'UTB, UWA & USAGA Licensed Safari Guide',
    verificationSummary:
      'Identity, field first-aid certification, Uganda Safari Guides Association (USAGA) rank, and UWA park credentials audited by Entebbe Operations Desk.',
  },
  operator: {
    defaultBadge: 'UTB & UWA Licensed Operator',
    authorityTitle: 'Official Licensed East African Tour Operator',
    verificationSummary:
      'Active Uganda Tourism Board (UTB) Tour Operator License and Uganda Wildlife Authority (UWA) direct gorilla/chimpanzee permit escrow authorization.',
  },
  driver: {
    defaultBadge: 'UTB Verified 4x4 Fleet',
    authorityTitle: 'Licensed Safari Driver-Guide & Inspected 4x4 Vehicle',
    verificationSummary:
      'Commercial PSV safari endorsement, comprehensive passenger insurance, and mechanical 4x4 inspection verified for national park corridors.',
  },
  hotel: {
    defaultBadge: 'Enganda Verified Partner',
    authorityTitle: 'UTB Registered Partner Accommodation',
    verificationSummary:
      'Direct Safari Wallet room-voucher settlement, audited hospitality standards, and verified regional conservation partnership.',
  },
};

export const ServiceProviderVerifiedBadge: React.FC<ServiceProviderVerifiedBadgeProps> = ({
  providerType,
  badgeLabel,
  utbLicenseNumber,
  uwaAccreditationId,
  authorityNotes = [],
  variant = 'emerald',
  size = 'sm',
  showLicenseInline = true,
  className = '',
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const meta = PROVIDER_TYPE_AUTHORITY[providerType];
  const displayLabel = badgeLabel || meta.defaultBadge;

  const variantClasses: Record<NonNullable<ServiceProviderVerifiedBadgeProps['variant']>, string> = {
    emerald:
      'bg-emerald-950/95 text-emerald-200 border-emerald-500/40 hover:border-emerald-400 shadow-sm',
    gold:
      'bg-amber-950/95 text-amber-200 border-amber-500/45 hover:border-amber-400 shadow-sm',
    dark:
      'bg-stone-900/95 text-amber-300 border-amber-500/35 hover:border-amber-400 shadow-sm',
    light:
      'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100/80',
  };

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2.5 py-1 gap-1.5'
      : 'text-xs px-3 py-1.5 gap-2';

  const iconColor =
    variant === 'light'
      ? 'text-emerald-700'
      : variant === 'gold' || variant === 'dark'
      ? 'text-amber-400'
      : 'text-emerald-400';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPopover((prev) => !prev);
        }}
        title={`${meta.authorityTitle} — Click to view license & verification credentials`}
        className={`inline-flex items-center rounded-full border font-semibold backdrop-blur-md transition-all cursor-pointer select-none ${variantClasses[variant]} ${sizeClasses}`}
      >
        <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />
        <span className="tracking-tight font-bold">{displayLabel}</span>
        {showLicenseInline && utbLicenseNumber && (
          <span
            className={`hidden sm:inline-block font-mono text-[10px] pl-1.5 border-l ${
              variant === 'light'
                ? 'border-emerald-300 text-emerald-800'
                : 'border-white/20 text-amber-300'
            }`}
          >
            {utbLicenseNumber}
          </span>
        )}
        <Info className="w-3 h-3 opacity-75 shrink-0" />
      </button>

      {showPopover && (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-stone-950 text-white rounded-2xl p-4 border border-amber-500/40 shadow-2xl z-50 text-left space-y-2.5"
        >
          <div className="flex items-start justify-between gap-2 border-b border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-900/70 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Enganda Compliance Seal
                </div>
                <div className="text-xs font-bold text-white leading-snug">
                  {meta.authorityTitle}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPopover(false)}
              className="text-stone-400 hover:text-white p-1 cursor-pointer"
              aria-label="Close verification details"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-stone-300 leading-relaxed">
            {meta.verificationSummary}
          </p>

          {(utbLicenseNumber || uwaAccreditationId) && (
            <div className="bg-stone-900 rounded-xl p-2.5 border border-stone-800 space-y-1 text-[11px] font-mono">
              {utbLicenseNumber && (
                <div className="flex items-center justify-between text-amber-300">
                  <span className="text-stone-400">UTB License:</span>
                  <span className="font-bold">{utbLicenseNumber}</span>
                </div>
              )}
              {uwaAccreditationId && (
                <div className="flex items-center justify-between text-emerald-300">
                  <span className="text-stone-400">UWA Accreditation:</span>
                  <span className="font-bold">{uwaAccreditationId}</span>
                </div>
              )}
            </div>
          )}

          {authorityNotes.length > 0 && (
            <div className="space-y-1 pt-1">
              {authorityNotes.slice(0, 3).map((note) => (
                <div
                  key={note}
                  className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{note}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-1 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
            <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
              <Award className="w-3 h-3" />
              Safari Wallet Escrow Protected
            </span>
            <span>2026/2027 Active</span>
          </div>
        </div>
      )}
    </div>
  );
};
