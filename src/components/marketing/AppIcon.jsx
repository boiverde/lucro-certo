import React from 'react';
import { DollarSign } from 'lucide-react';

export default function AppIcon() {
  return (
    <div 
      className="w-[512px] h-[512px] bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center rounded-[80px]"
      style={{ imageRendering: 'pixelated' }} // Prevents blurring when user saves
    >
      <DollarSign className="w-80 h-80 text-white" strokeWidth={1.5} />
    </div>
  );
}