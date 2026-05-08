import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading = () => {
  return (
    <div className="flex-grow min-h-full flex items-center justify-center bg-[#F4F7F6]">
      <div className="flex flex-col items-center text-[#006633] py-20">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Loading...</p>
      </div>
    </div>
  );
};
