import React from 'react';

interface UpaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const UpaLogo: React.FC<UpaLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  // Size mappings
  const dimensions = {
    sm: { height: 'h-7', textUpa: 'text-lg', text24h: 'text-lg', cross: 'text-sm', sub: 'text-[7px]' },
    md: { height: 'h-10', textUpa: 'text-2xl', text24h: 'text-2xl', cross: 'text-lg', sub: 'text-[9px]' },
    lg: { height: 'h-14', textUpa: 'text-4xl', text24h: 'text-4xl', cross: 'text-2xl', sub: 'text-[11px]' },
    xl: { height: 'h-20', textUpa: 'text-6xl', text24h: 'text-6xl', cross: 'text-4xl', sub: 'text-xs' }
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Main Logo Text Row */}
      <div className="flex items-center font-black tracking-tighter leading-none">
        {/* GREEN UPA */}
        <div className={`flex items-center text-emerald-600 dark:text-emerald-500 font-extrabold ${dimensions.textUpa}`}>
          <span>UPA</span>
        </div>

        {/* BLUE 24h WITH RED CROSS */}
        <div className={`flex items-center text-blue-700 dark:text-sky-400 font-extrabold ml-1 ${dimensions.text24h}`}>
          <span>24</span>
          <span className="relative inline-flex items-center">
            <span>h</span>
            {/* Red Cross */}
            <span className="text-red-600 font-black ml-0.5 inline-block animate-pulse">
              +
            </span>
          </span>
        </div>
      </div>

      {/* SUBTITLE: UNIDADE DE PRONTO ATENDIMENTO */}
      {showSubtitle && (
        <span className={`text-slate-700 dark:text-slate-300 font-bold uppercase tracking-widest mt-1 text-center ${dimensions.sub}`}>
          Unidade de Pronto Atendimento
        </span>
      )}
    </div>
  );
};
