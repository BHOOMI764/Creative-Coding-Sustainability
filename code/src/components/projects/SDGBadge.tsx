import React from 'react';
import { SDG } from '../../types';
import { Info } from 'lucide-react';

interface SDGBadgeProps {
  sdg: SDG;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SDGBadge: React.FC<SDGBadgeProps> = ({ 
  sdg, 
  showTooltip = true,
  size = 'md' 
}) => {
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };
  
  return (
    <div className="relative inline-block">
      <div 
        className={`
          rounded-full flex items-center justify-center font-bold
          transition-transform hover:scale-110
          ${sizeClasses[size]}
        `}
        style={{ backgroundColor: sdg.color, color: '#FFFFFF' }}
        onMouseEnter={() => showTooltip && setTooltipVisible(true)}
        onMouseLeave={() => showTooltip && setTooltipVisible(false)}
      >
        {sdg.number}
      </div>
      
      {showTooltip && tooltipVisible && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded py-2 px-3 shadow-lg">
          <div className="flex items-start mb-1">
            <Info size={12} className="mr-1 mt-0.5 flex-shrink-0" />
            <span className="font-semibold">{sdg.name}</span>
          </div>
          <p className="text-gray-300 text-xs">{sdg.description}</p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default SDGBadge;