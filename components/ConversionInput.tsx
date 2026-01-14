import React from 'react';

interface ConversionInputProps {
  label: string;
  subLabel: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  active: boolean;
  prefix: string;
  accentColor: 'cyan' | 'purple';
}

export const ConversionInput: React.FC<ConversionInputProps> = ({
  label,
  subLabel,
  value,
  onChange,
  icon,
  active,
  prefix,
  accentColor
}) => {
  const borderColor = accentColor === 'cyan' ? 'border-cyan-500/50' : 'border-purple-500/50';
  const shadowColor = accentColor === 'cyan' ? 'shadow-cyan-500/20' : 'shadow-purple-500/20';
  // Sharper glow
  const textGlow = accentColor === 'cyan' ? 'drop-shadow-[0_0_5px_rgba(34,211,238,0.9)]' : 'drop-shadow-[0_0_5px_rgba(192,132,252,0.9)]';
  const textColor = accentColor === 'cyan' ? 'text-cyan-50' : 'text-purple-50';

  return (
    <div 
      className={`relative w-full rounded-2xl p-1 transition-all duration-500 ${
        active 
          ? `bg-gradient-to-b from-zinc-700 to-zinc-900 shadow-xl ${shadowColor} scale-[1.02] z-10` 
          : 'bg-zinc-900/50 hover:bg-zinc-800/50 z-0'
      }`}
    >
        <div className={`relative h-full bg-zinc-950 rounded-xl p-5 border ${active ? borderColor : 'border-zinc-800'}`}>
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-4">
                    <span className="text-3xl filter drop-shadow-lg grayscale opacity-80">{icon}</span>
                    <div>
                        <h3 className={`font-bold text-sm tracking-[0.2em] uppercase transition-colors ${active ? 'text-white text-shadow-sm' : 'text-zinc-500'}`}>
                        {label}
                        </h3>
                        <p className="text-xs text-zinc-600 font-mono uppercase mt-0.5">{subLabel}</p>
                    </div>
                </div>
            </div>
            
            <div className="relative group">
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-light transition-colors ${active ? 'text-zinc-400' : 'text-zinc-700'}`}>
                {prefix}
                </span>
                {/* Increased font size to text-6xl/7xl */}
                <input
                    type="number"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="0.0000"
                    className={`w-full bg-transparent py-2 pl-8 text-6xl md:text-7xl font-digital -skew-x-6 tracking-wider font-normal transition-all focus:outline-none placeholder-zinc-800 ${
                        active 
                        ? `${textColor} ${textGlow}` 
                        : 'text-zinc-600'
                    }`}
                />
            </div>
        </div>
    </div>
  );
};