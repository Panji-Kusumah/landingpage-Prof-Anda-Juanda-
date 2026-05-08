import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8 lg:p-14 min-h-full bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Decorative background blobs */}
      <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-red-100/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none"></div>

      <Helmet>
        <title>404 Not Found</title>
        <meta name="description" content="Page not found" />
      </Helmet>

      <div className="max-w-2xl mx-auto w-full relative z-10 text-center flex flex-col items-center">
        <div className="mb-6 bg-red-50 text-red-500 p-6 rounded-full inline-block shadow-inner border border-red-100">
          <AlertTriangle size={64} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-8xl font-serif text-slate-800 font-bold mb-4">404</h1>
        <h2 className="text-2xl lg:text-3xl font-serif text-slate-700 mb-6">Halaman Tidak Ditemukan</h2>
        
        <p className="text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
        </p>

        <Link 
          to="/" 
          className="flex items-center gap-3 px-8 py-4 bg-[#006633] text-white font-bold rounded-xl shadow-lg hover:bg-[#008844] hover:-translate-y-1 hover:shadow-xl transition-all uppercase tracking-wider text-sm"
        >
          <Home size={18} />
          Kembali ke Beranda
        </Link>
      </div>
    </motion.div>
  );
}
