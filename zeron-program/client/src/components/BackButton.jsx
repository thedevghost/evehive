import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ fallback = '/', label = 'Back', className = '' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`fixed top-4 left-4 z-[70] inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors border border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/[0.08] hover:text-white ${className}`}
      aria-label={label}
      title={label}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}