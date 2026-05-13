import React, { useState, useEffect } from 'react';
import { Accessibility, Type, Contrast, Monitor, Link2, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
//test
export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  
  // Focus button on mount
  useEffect(() => {
    // Adding a short timeout ensures it happens after all rendering
    const timer = setTimeout(() => {
      btnRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // States for accessibility features
  const [textSize, setTextSize] = useState<0 | 1 | 2>(0); // 0: normal, 1: large, 2: xl
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);

  // Apply classes to body element
  useEffect(() => {
    const root = document.documentElement;
    
    // Text size
    root.classList.remove('a11y-large-text', 'a11y-xl-text');
    if (textSize === 1) root.classList.add('a11y-large-text');
    else if (textSize === 2) root.classList.add('a11y-xl-text');

    // High Contrast
    if (highContrast) root.classList.add('a11y-high-contrast');
    else root.classList.remove('a11y-high-contrast');

    // Grayscale
    if (grayscale) root.classList.add('a11y-grayscale');
    else root.classList.remove('a11y-grayscale');

    // Highlight Links
    if (highlightLinks) root.classList.add('a11y-highlight-links');
    else root.classList.remove('a11y-highlight-links');

    // Dyslexic Font
    if (dyslexicFont) root.classList.add('a11y-dyslexic');
    else root.classList.remove('a11y-dyslexic');

  }, [textSize, highContrast, grayscale, highlightLinks, dyslexicFont]);

  const resetAll = () => {
    setTextSize(0);
    setHighContrast(false);
    setGrayscale(false);
    setHighlightLinks(false);
    setDyslexicFont(false);
  };

  const cycleTextSize = () => {
    setTextSize(prev => (prev + 1) % 3 as 0 | 1 | 2);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          ref={btnRef}
          className="bg-[#006633] text-white p-4 rounded-full shadow-lg hover:bg-[#008844] transition-all transform hover:scale-105 flex items-center justify-center focus:ring-4 focus:ring-[#006633] focus:outline-none animate-pulse"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Accessibility Menu"
        >
          <Accessibility size={28} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 w-72 overflow-hidden flex flex-col"
            >
              <div className="bg-[#006633] text-white p-4 flex justify-between items-center">
                <h3 className="font-bold font-serif flex items-center gap-2">
                  <Accessibility size={18} /> Aksesibilitas
                </h3>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-4 flex flex-col gap-3">
                <button 
                  onClick={cycleTextSize}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${textSize > 0 ? 'bg-emerald-50 border-emerald-200 text-[#006633]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  <Type size={20} />
                  <div className="text-left">
                    <div className="text-sm font-bold">Ukuran Teks</div>
                    <div className="text-xs opacity-70">
                      {textSize === 0 ? 'Normal' : textSize === 1 ? 'Besar' : 'Sangat Besar'}
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setHighContrast(!highContrast)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${highContrast ? 'bg-emerald-50 border-emerald-200 text-[#006633]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  <Contrast size={20} />
                  <div className="text-left">
                    <div className="text-sm font-bold">Kontras Tinggi</div>
                    <div className="text-xs opacity-70">Balikkan warna</div>
                  </div>
                </button>

                <button 
                  onClick={() => setGrayscale(!grayscale)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${grayscale ? 'bg-emerald-50 border-emerald-200 text-[#006633]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  <Monitor size={20} />
                  <div className="text-left">
                    <div className="text-sm font-bold">Monokrom</div>
                    <div className="text-xs opacity-70">Skala abu-abu</div>
                  </div>
                </button>

                <button 
                  onClick={() => setHighlightLinks(!highlightLinks)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${highlightLinks ? 'bg-emerald-50 border-emerald-200 text-[#006633]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  <Link2 size={20} />
                  <div className="text-left">
                    <div className="text-sm font-bold">Sorot Tautan</div>
                    <div className="text-xs opacity-70">Perjelas semua link</div>
                  </div>
                </button>

                <button 
                  onClick={() => setDyslexicFont(!dyslexicFont)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${dyslexicFont ? 'bg-emerald-50 border-emerald-200 text-[#006633]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                  <div className="font-serif text-lg font-bold w-5 text-center">A</div>
                  <div className="text-left">
                    <div className="text-sm font-bold">Font Disleksia</div>
                    <div className="text-xs opacity-70">Lebih mudah dibaca</div>
                  </div>
                </button>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={resetAll}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <RotateCcw size={16} /> Reset Pengaturan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
