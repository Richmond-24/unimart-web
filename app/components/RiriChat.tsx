
"use client";

import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  Minimize2,
  Maximize2,
  Headset,
  Copy,
  Check,
} from 'lucide-react';

type LogoAnimationType = 'bounce' | 'float' | 'pulse' | 'wiggle' | 'none';
type LogoAnimationSpeed = 'slow' | 'normal' | 'fast';

interface RiriChatProps {
  onClose: () => void;
  init?: any;
  /** Animation style for the header icon. Default: 'bounce' */
  logoAnimationType?: LogoAnimationType;
  /** How fast the logo animates. Default: 'normal' */
  logoAnimationSpeed?: LogoAnimationSpeed;
  /** Turn the logo animation off entirely. Default: true */
  logoAnimated?: boolean;
}

const SPEED_DURATIONS: Record<LogoAnimationSpeed, string> = {
  slow: '2.4s',
  normal: '1.6s',
  fast: '0.9s',
};

// ---- Edit these to match your real contact details ----
// Single number used for all contact channels (calls + WhatsApp)
const CONTACT_NUMBER = '+233 20 123 4567';
const WHATSAPP_NUMBER = CONTACT_NUMBER.replace(/[^\d]/g, '').replace(/^0/, '233'); // digits only, no +

const CALL_LINES = [
  { label: 'Customer Support', number: CONTACT_NUMBER, hours: 'Mon–Fri, 8am–6pm' },
];

const SUPPORT_EMAIL = 'support@unimart.example';
const OFFICE_ADDRESS = 'UENR Campus, Sunyani, Ghana';

// No brand-icon dependency — just a short label + a distinct color per platform
const SOCIALS = [
  { label: 'Instagram', short: 'IG', href: 'https://instagram.com/unimart', bg: '#E1306C' },
  { label: 'Facebook', short: 'FB', href: 'https://facebook.com/unimart', bg: '#1877F2' },
  { label: 'Twitter / X', short: 'X', href: 'https://twitter.com/unimart', bg: '#111111' },
];
// ---------------------------------------------------------

export default function RiriChat({
  init = {},
  onClose,
  logoAnimationType = 'bounce',
  logoAnimationSpeed = 'normal',
  logoAnimated = true,
}: RiriChatProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const animationClass =
    logoAnimated && logoAnimationType !== 'none' ? `riri-logo-${logoAnimationType}` : '';

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch (e) {
      // clipboard not available — silently ignore
    }
  };

  const isBusinessHoursNow = () => {
    const now = new Date();
    const day = now.getDay(); // 0 Sun - 6 Sat
    const hour = now.getHours();
    if (day === 0) return false; // closed Sunday
    if (day === 6) return hour >= 9 && hour < 14; // Sat 9-2
    return hour >= 8 && hour < 18; // Mon-Fri 8-6
  };
  const openNow = isBusinessHoursNow();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full max-w-lg md:max-w-xl lg:max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
          isExpanded ? 'h-[80vh] max-h-[700px]' : 'h-[500px] max-h-[600px]'
        } border border-white/20`}
        style={{ minHeight: '400px' }}
      >
        {/* Header */}
        <div className="relative px-4 sm:px-6 py-4 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${animationClass}`}
                style={{ animationDuration: SPEED_DURATIONS[logoAnimationSpeed] }}
              >
                <Headset className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 text-white" />
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  openNow ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
                }`}
              />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg tracking-tight">Customer Service</h2>
              <p className="text-white/70 text-xs">
                {openNow ? "We're online — reach out anytime" : 'Currently offline — leave us a message'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white/50">
          {/* Call lines */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-gray-800">Call us</span>
            </div>
            <div className="flex flex-col gap-2">
              {CALL_LINES.map((line) => (
                <div
                  key={line.number}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-gray-100/80 hover:border-teal-200 hover:shadow-sm transition-all duration-200"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{line.label}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {line.hours}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${line.number.replace(/\s+/g, '')}`}
                      className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors whitespace-nowrap"
                    >
                      {line.number}
                    </a>
                    <button
                      onClick={() => copyToClipboard(line.number, line.number)}
                      className="p-1.5 rounded-lg border border-gray-200/80 text-gray-500 hover:bg-gray-50 transition-colors"
                      title="Copy number"
                    >
                      {copiedField === line.number ? (
                        <Check className="w-3.5 h-3.5 text-teal-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* WhatsApp + Email */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-gray-100/80 hover:border-green-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">WhatsApp</p>
                <p className="text-xs text-gray-400 truncate">Chat with us directly</p>
              </div>
            </a>

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-gray-100/80 hover:border-teal-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-teal-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">Email support</p>
                <p className="text-xs text-gray-400 truncate">{SUPPORT_EMAIL}</p>
              </div>
            </a>
          </section>

          {/* Office / hours */}
          <section className="p-3.5 rounded-xl bg-white border border-gray-100/80">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">Office</p>
                <p className="text-xs text-gray-500 mt-0.5">{OFFICE_ADDRESS}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Mon–Fri: 8am–6pm
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Sat: 9am–2pm
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Sun: Closed
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Socials */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-800">Follow us</span>
            </div>
            <div className="flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  style={{ backgroundColor: s.bg }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold hover:opacity-90 hover:shadow-sm transition-all duration-200"
                >
                  {s.short}
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100/80 bg-white/50 backdrop-blur-sm rounded-b-2xl">
          <p className="text-center text-xs text-gray-400">
            We typically respond within a few hours during business hours.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ririBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ririFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(3deg); }
        }
        @keyframes ririPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.85; }
        }
        @keyframes ririWiggle {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        .riri-logo-bounce { animation-name: ririBounce; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .riri-logo-float { animation-name: ririFloat; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .riri-logo-pulse { animation-name: ririPulse; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .riri-logo-wiggle { animation-name: ririWiggle; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        @media (prefers-reduced-motion: reduce) {
          .riri-logo-bounce, .riri-logo-float, .riri-logo-pulse, .riri-logo-wiggle {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}