import React from 'react';

// Brand Logo for Telemetry: Modern geometric mark with deep navy (#203B53), muted teal (#398879), and amber (#DCA65A) accent
export const TelemetryLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const dim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dim} ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
        {/* Deep navy rounded container */}
        <rect width="40" height="40" rx="10" fill="#203B53" />
        
        {/* Subtle grid lines */}
        <line x1="8" y1="20" x2="32" y2="20" stroke="#2E506F" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="20" y1="8" x2="20" y2="32" stroke="#2E506F" strokeWidth="1" strokeDasharray="2 2" />

        {/* Telemetry tracking line in muted teal */}
        <path
          d="M10 24L16 24L20 14L24 28L28 20L31 20"
          stroke="#398879"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Muted amber milestone target marker */}
        <circle cx="28" cy="20" r="3" fill="#DCA65A" />
        <circle cx="28" cy="20" r="5" stroke="#DCA65A" strokeWidth="1" strokeOpacity="0.4" />
      </svg>
    </div>
  );
};

// Subtle modern pulse indicator
export const StatusPulse: React.FC<{ color?: string }> = ({ color = '#398879' }) => (
  <span className="relative flex h-2 w-2">
    <span
      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
      style={{ backgroundColor: color }}
    />
    <span
      className="relative inline-flex rounded-full h-2 w-2"
      style={{ backgroundColor: color }}
    />
  </span>
);
