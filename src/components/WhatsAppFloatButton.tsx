import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl, WHATSAPP_NUMBER } from '../data/seedData';

export const WhatsAppFloatButton: React.FC = () => {
  return (
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with Enganda Safaris Entebbe office on WhatsApp (${WHATSAPP_NUMBER})`}
      title={`WhatsApp Entebbe Office: ${WHATSAPP_NUMBER}`}
      className="fixed bottom-20 right-4 sm:right-6 z-40 inline-flex items-center gap-2 bg-[#2D6A4F] hover:bg-[#23533D] text-white px-3.5 py-2.5 rounded-md shadow-lg border border-white/20 text-xs font-semibold transition-transform hover:scale-102"
    >
      <MessageCircle className="w-4 h-4 text-[#FAF7F2]" />
      <span className="hidden sm:inline">WhatsApp Entebbe</span>
    </a>
  );
};
