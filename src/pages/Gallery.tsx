import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { X, ZoomIn } from 'lucide-react';
import { Loading } from '../components/Loading';

interface GalleryImage {
  id: number;
  image_url: string;
  caption: string;
  created_at: string;
}

const DEFAULT_IMAGES: GalleryImage[] = [
  { 
    id: -1, 
    image_url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80', 
    caption: 'Kampus UIN Siber Syekh Nurjati Cirebon', 
    created_at: new Date().toISOString() 
  },
  { 
    id: -2, 
    image_url: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&q=80', 
    caption: 'Seminar Nasional Pendidikan', 
    created_at: new Date().toISOString() 
  },
  { 
    id: -3, 
    image_url: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80', 
    caption: 'Diskusi Panel Mahasiswa', 
    created_at: new Date().toISOString() 
  }
];

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setImages(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load gallery", err);
        setLoading(false);
      });
  }, []);

  const displayImages = images.length > 0 ? images : DEFAULT_IMAGES;

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="p-8 lg:p-14 min-h-full bg-[#F4F7F6] flex flex-col relative"
      >
        {/* Decorative background blob for glassmorphism effect */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#006633]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#006633]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <Helmet>
          <title>Gallery - Prof. Dr. H. Anda Juanda, M.Pd.</title>
          <meta name="description" content="Gallery of Prof. Dr. H. Anda Juanda, M.Pd., showing academic events, seminars, and university activities." />
        </Helmet>

        <div className="max-w-5xl mx-auto w-full relative z-10">
          <div className="mb-10 backdrop-blur-md bg-white/40 border border-white/60 p-8 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
             <span className="text-[11px] uppercase tracking-[0.2em] text-[#006633] font-bold block mb-3">Kegiatan & Dokumentasi</span>
             <h2 className="text-3xl lg:text-4xl font-serif text-slate-900 leading-none">Photo Gallery</h2>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {displayImages.map((img, i) => (
              <motion.div 
                key={img.id} 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (i % 3) * 0.1, duration: 0.5, ease: "easeOut" }}
                className="break-inside-avoid relative group rounded-2xl shadow-sm overflow-hidden border border-white/50 bg-white/30 backdrop-blur-sm p-2 cursor-pointer"
                onClick={() => setSelectedImage(img)}
              >
                <div className="overflow-hidden rounded-xl relative">
                  <img src={img.image_url} alt={img.caption || 'Academic activity'} className="w-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <ZoomIn className="text-white w-10 h-10 opacity-80" />
                  </div>
                </div>
                <div className="absolute inset-2 rounded-xl bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                {img.caption && (
                  <div className="absolute bottom-2 left-2 right-2 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
                    <p className="text-white font-medium text-sm drop-shadow-md">{img.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Lightbox / Zoom Overlay */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors z-50"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X size={24} />
            </button>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage.image_url} 
                alt={selectedImage.caption || 'Zoomed view'} 
                className="max-w-full max-h-[85vh] object-contain rounded-sm"
              />
              {selectedImage.caption && (
                <div className="mt-4 text-white text-center text-lg font-medium tracking-wide">
                  {selectedImage.caption}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
