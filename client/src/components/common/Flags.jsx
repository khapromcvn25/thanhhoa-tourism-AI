// Cờ dạng SVG: emoji cờ không hiển thị trên Windows nên dùng SVG chuẩn cho mọi thiết bị.

export function FlagVN({ className = '' }) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden="true" focusable="false">
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        fill="#FFFF00"
        points="15,4 16.35,8.15 20.71,8.15 17.18,10.71 18.53,14.85 15,12.29 11.47,14.85 12.82,10.71 9.29,8.15 13.65,8.15"
      />
    </svg>
  );
}

export function FlagGB({ className = '' }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden="true" focusable="false">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0 60 40M60 0 0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0 60 40M60 0 0 40" stroke="#C8102E" strokeWidth="3" />
      <path d="M30 0V40M0 20H60" stroke="#fff" strokeWidth="13" />
      <path d="M30 0V40M0 20H60" stroke="#C8102E" strokeWidth="8" />
    </svg>
  );
}

export function FlagJP({ className = '' }) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden="true" focusable="false">
      <rect width="30" height="20" fill="#FFFFFF" />
      <circle cx="15" cy="10" r="6" fill="#BC002D" />
    </svg>
  );
}

export function FlagKR({ className = '' }) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden="true" focusable="false">
      <rect width="30" height="20" fill="#FFFFFF" />
      <path d="M15 5a5 5 0 0 1 0 10 2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 0 0-5Z" fill="#CD2E3A" />
      <path d="M15 15a5 5 0 0 1 0-10 2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 0 0 5Z" fill="#0047A0" />
      <g stroke="#111111" strokeWidth="1.2">
        <line x1="5" y1="6.5" x2="8.5" y2="3.5" />
        <line x1="6.3" y1="7.8" x2="9.8" y2="4.8" />
        <line x1="21.5" y1="3.5" x2="25" y2="6.5" />
        <line x1="20.2" y1="4.8" x2="23.7" y2="7.8" />
        <line x1="5" y1="13.5" x2="8.5" y2="16.5" />
        <line x1="6.3" y1="12.2" x2="9.8" y2="15.2" />
        <line x1="21.5" y1="16.5" x2="25" y2="13.5" />
        <line x1="20.2" y1="15.2" x2="23.7" y2="12.2" />
      </g>
    </svg>
  );
}

export function FlagCN({ className = '' }) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden="true" focusable="false">
      <rect width="30" height="20" fill="#DE2910" />
      <polygon
        fill="#FFDE00"
        points="6,3.2 6.85,5.8 9.6,5.8 7.38,7.4 8.22,10 6,8.4 3.78,10 4.62,7.4 2.4,5.8 5.15,5.8"
      />
      <circle cx="11.5" cy="3.2" r="0.8" fill="#FFDE00" />
      <circle cx="13.2" cy="5.2" r="0.8" fill="#FFDE00" />
      <circle cx="13.2" cy="7.8" r="0.8" fill="#FFDE00" />
      <circle cx="11.5" cy="9.8" r="0.8" fill="#FFDE00" />
    </svg>
  );
}

export function FlagFR({ className = '' }) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden="true" focusable="false">
      <rect width="10" height="20" x="0" fill="#002395" />
      <rect width="10" height="20" x="10" fill="#FFFFFF" />
      <rect width="10" height="20" x="20" fill="#ED2939" />
    </svg>
  );
}

export const FLAG_BY_LANG = {
  vi: FlagVN,
  en: FlagGB,
  ja: FlagJP,
  ko: FlagKR,
  zh: FlagCN,
  fr: FlagFR,
};
