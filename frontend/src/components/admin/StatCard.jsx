import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, bgColor, progress, link, iconColor, compact }) => {
  const navigate = useNavigate();

  // Determine if we should use solid color style or class
  const isSolidColor = bgColor && (bgColor.startsWith('#') || bgColor.startsWith('rgb'));
  
  // High-end UI: If it's a white/light card, use dark text. If it's a solid brand color, use white text.
  const isLightCard = bgColor === 'bg-white' || (isSolidColor && (bgColor.toLowerCase() === '#ffffff' || bgColor.toLowerCase() === 'white'));

  return (
    <motion.div 
        whileHover={link ? { y: -5, scale: 1.01, transition: { duration: 0.2 } } : { y: -3, transition: { duration: 0.2 } }}
        whileTap={link ? { scale: 0.98 } : {}}
        onClick={() => link && navigate(link)}
        style={isSolidColor ? { backgroundColor: bgColor } : {}}
        className={`relative ${compact ? 'p-2 sm:p-4' : 'p-3 sm:p-6'} rounded-xl sm:rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden group border border-slate-100 ${!isSolidColor ? bgColor : ''} ${link ? 'cursor-pointer' : ''}`}
    >
        <div className="flex items-center gap-3 relative z-10">
            {/* ICON CIRCLE */}
            <div className={`shrink-0 ${compact ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-12 sm:h-12'} rounded-lg sm:rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${iconColor || 'bg-white/20 text-white'}`}>
                {React.cloneElement(icon, { size: compact ? 14 : 18, strokeWidth: 2.5, className: "sm:w-[22px] sm:h-[22px]" })}
            </div>

            <div className="flex-grow min-w-0">
                <p className={`${compact ? 'text-[6px] sm:text-[8px]' : 'text-[7px] sm:text-[10px]'} font-black uppercase tracking-widest mb-0.5 truncate ${isLightCard ? 'text-slate-400' : 'text-white/80'}`}>
                    {title}
                </p>
                <div className="flex items-baseline gap-2">
                    <h3 className={`${compact ? 'text-xs sm:text-lg' : 'text-sm sm:text-2xl'} font-black tracking-tight leading-none truncate ${isLightCard ? 'text-slate-800' : 'text-white'}`}>
                        {value}
                    </h3>
                </div>
            </div>
        </div>

        {/* PROGRESS BAR SECTION */}
        <div className={`${compact ? 'mt-1.5 sm:mt-3' : 'mt-3 sm:mt-6'} flex flex-col gap-1 sm:gap-1.5 relative z-10`}>
            <div className={`h-1 sm:h-1.5 w-full rounded-full overflow-hidden ${isLightCard ? 'bg-slate-100' : 'bg-white/20'}`}>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress || 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${isLightCard ? 'bg-indigo-600' : 'bg-white'}`}
                />
            </div>
            {!compact && (
                <div className="flex items-center justify-between">
                    <span className={`text-[6px] sm:text-[9px] font-black uppercase tracking-widest truncate ${isLightCard ? 'text-slate-400' : 'text-white/70'}`}>
                        {progress || 0}% Increase
                    </span>
                </div>
            )}
        </div>
        
        {/* Subtle background decoration */}
        <div className={`absolute -right-4 -bottom-4 ${compact ? 'w-12 h-12' : 'w-24 h-24'} rounded-full blur-2xl opacity-10 ${isLightCard ? 'bg-indigo-500' : 'bg-white'}`}></div>
    </motion.div>
  );
};

export default StatCard;