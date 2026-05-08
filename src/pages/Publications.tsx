import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Book } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Loading } from '../components/Loading';

interface Publication {
  id: number;
  title: string;
  authors: string;
  journal: string;
  year: number;
  url: string;
  type: string;
  file_path?: string;
}

export default function Publications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterJournal, setFilterJournal] = useState<string>('all');

  const [activeTab, setActiveTab] = useState<'all' | 'journals' | 'books'>('all');

  useEffect(() => {
    fetch('/api/publications')
      .then(res => res.json())
      .then(data => {
        setPublications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch publications', err);
        setLoading(false);
      });
  }, []);

  const years = useMemo(() => {
    const yrSet = new Set(publications.map(p => p.year).filter(y => y !== null && y !== undefined));
    return Array.from(yrSet).sort((a, b) => Number(b) - Number(a));
  }, [publications]);

  const journalNames = useMemo(() => {
    const jSet = new Set(publications.filter(p => p.type === 'journal' && p.journal).map(p => p.journal));
    return Array.from(jSet).sort();
  }, [publications]);

  const filteredData = useMemo(() => {
    return publications.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.authors.toLowerCase().includes(search.toLowerCase());
      const matchYear = filterYear === 'all' || (p.year && p.year.toString() === filterYear);
      const matchJournal = filterJournal === 'all' || (p.type === 'journal' ? p.journal === filterJournal : true);
      return matchSearch && matchYear && matchJournal;
    });
  }, [publications, search, filterYear, filterJournal]);

  if (loading) {
     return <Loading />;
  }

  const books = filteredData.filter(p => p.type === 'book');
  const journals = filteredData.filter(p => p.type === 'journal');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8 lg:p-14 min-h-full bg-slate-50 flex flex-col relative"
    >
      {/* Decorative background blobs */}
      <div className="absolute top-[5%] left-[5%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[5%] right-[5%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px] pointer-events-none"></div>
      
      <Helmet>
        <title>Publications & Books - Prof. Dr. H. Anda Juanda, M.Pd.</title>
        <meta name="description" content="Explore the academic publications and authored books of Prof. Dr. H. Anda Juanda, M.Pd. in Islamic Education, Educational Management, and Curriculum Development." />
        <meta name="keywords" content="Publications, Books, Academic Journals, Research, Prof. Dr. H. Anda Juanda, M.Pd., Islamic Education, Cirebon" />
      </Helmet>

      <div className="max-w-4xl w-full mx-auto relative z-10">
        <div className="mb-10 backdrop-blur-md bg-white/40 border border-white/60 p-8 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
           <span className="text-[11px] uppercase tracking-[0.2em] text-[#006633] font-bold block mb-3">Research Output</span>
           <h2 className="text-3xl lg:text-4xl font-serif text-slate-900 leading-none">Publications & Books</h2>
        </div>

        {/* Tabs Controls */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          {(['all', 'journals', 'books'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[13px] font-bold uppercase tracking-[0.1em] border-b-2 transition-colors ${
                activeTab === tab
                  ? 'text-[#006633] border-[#006633]'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {tab === 'all' ? 'All Publications' : tab}
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-10 p-4 backdrop-blur-md bg-white/30 border border-white/50 rounded-2xl shadow-sm">
          <input 
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow px-4 py-2.5 bg-white/50 border border-slate-200/50 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-[#006633] outline-none backdrop-blur-sm"
          />
          {(activeTab === 'all' || activeTab === 'journals') && (
            <select 
              value={filterJournal}
              onChange={(e) => setFilterJournal(e.target.value)}
              className="w-full sm:w-auto min-w-[200px] px-4 py-2.5 bg-white/50 border border-slate-200/50 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-[#006633] outline-none backdrop-blur-sm"
            >
              <option value="all">All Journals</option>
              {journalNames.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          )}
          <select 
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 bg-white/50 border border-slate-200/50 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-[#006633] outline-none backdrop-blur-sm"
          >
            <option value="all">All Years</option>
            {years.map(y => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </select>
        </div>

        {(activeTab === 'all' || activeTab === 'books') && books.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-100/50 rounded-xl">
                <Book className="text-[#006633]" size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-serif text-slate-800 leading-tight">Authored Books</h3>
                <p className="text-sm text-slate-500">Books and monographs</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {books.map(book => (
                <div key={book.id} className="p-6 backdrop-blur-md bg-white/40 border border-white/60 rounded-2xl shadow-sm hover:-translate-y-1 transform transition-all duration-300 hover:shadow-lg hover:border-emerald-300 group overflow-hidden relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-l-sm transition-all duration-300 group-hover:w-2 group-hover:bg-blue-500"></div>
                  <h4 className="font-bold text-slate-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors duration-300 flex items-start gap-2">
                    <span>{book.title}</span>
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">{book.authors}</p>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                    <span>{book.year} • {book.journal}</span>
                    <div className="flex gap-4">
                      {book.file_path && (
                         <a href={book.file_path} download target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 font-bold tracking-widest flex items-center gap-1"><FileText size={14} /> PDF</a>
                      )}
                      {book.url && (
                         <a href={book.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-bold tracking-widest flex items-center gap-1"><ExternalLink size={14} /> READ</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'journals') && (
        <div className="mb-12">
          {activeTab === 'all' && <div className="w-full h-px bg-emerald-800/10 mb-12"></div>}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-100/50 rounded-xl">
              <FileText className="text-[#006633]" size={28} />
            </div>
            <div>
               <h3 className="text-2xl font-serif text-slate-800 leading-tight">Academic Journals</h3>
               <p className="text-sm text-slate-500">Peer-reviewed publications and articles</p>
            </div>
          </div>
          {journals.length === 0 ? (
            <div className="p-8 backdrop-blur-md bg-white/40 border border-white/60 shadow-sm rounded-2xl text-center">
              <p className="text-slate-500 italic">No journals found matching your filter criteria.</p>
            </div>
          ) : (
             <div className="space-y-4">
               {journals.map(journal => (
                 <div key={journal.id} className="relative p-6 backdrop-blur-md bg-white/40 border border-white/60 shadow-sm rounded-2xl transition-all duration-300 hover:-translate-y-1 transform hover:shadow-lg hover:border-emerald-200 group overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110 pointer-events-none"></div>
                   <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                     <div className="flex-grow">
                        <h4 className="font-bold text-slate-900 text-lg mb-2 leading-snug group-hover:text-[#006633] transition-colors duration-300">{journal.title}</h4>
                        <p className="text-sm text-slate-600 mb-2">{journal.authors}</p>
                        <p className="text-xs font-serif italic text-slate-500">{journal.journal}</p>
                     </div>
                     <div className="flex flex-col items-end shrink-0">
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-[#006633] border border-[#006633]/20 text-xs font-bold rounded-full mb-4">
                          {journal.year}
                        </span>
                        <div className="flex flex-col gap-2 items-end">
                          {journal.file_path && (
                            <a href={journal.file_path} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 transition-colors">
                              <FileText size={14} /> Download PDF
                            </a>
                          )}
                          {journal.url && (
                            <a href={journal.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-[#006633] border border-emerald-200 rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors mt-1">
                              <ExternalLink size={14} /> View Article
                            </a>
                          )}
                        </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
        )}
      </div>
    </motion.div>
  );
}
