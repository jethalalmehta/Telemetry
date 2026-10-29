import React from 'react';
import { TelemetryLogo } from './DecorativeElements';

interface FooterProps {
  onNavigateHome: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateHome }) => {
  return (
    <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand info */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 text-left group cursor-pointer focus-visible:outline-none"
            title="Telemetry Home"
          >
            <TelemetryLogo size="sm" className="transition-transform group-hover:scale-105" />
            <div>
              <p className="font-bold text-base text-[#203B53]">Telemetry</p>
              <p className="text-xs text-[#758392]">Placement Preparation & Tracking System</p>
            </div>
          </button>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-xs font-medium text-[#263746]">
            <button
              onClick={onNavigateHome}
              className="hover:text-[#398879] transition-colors cursor-pointer"
            >
              Home
            </button>
            <a
              href="#features"
              onClick={onNavigateHome}
              className="hover:text-[#398879] transition-colors"
            >
              Features
            </a>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#758392] gap-2">
          <p>© {new Date().getFullYear()} Telemetry. Placement Preparation & Tracking System.</p>
          <p>Built with Python, Flask, HTML5, CSS3, JavaScript, and SQLite.</p>
        </div>
      </div>
    </footer>
  );
};
