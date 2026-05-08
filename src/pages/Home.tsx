import { motion } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { GraduationCap, Link as LinkIcon, BookOpen, ExternalLink, Mail } from 'lucide-react';
import { Loading } from '../components/Loading';

function useTeaching() {
  const [courses, setCourses] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/teaching')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch teaching courses');
        return res.json();
      })
      .then(setCourses)
      .catch(console.error);
  }, []);
  return courses;
}

export default function Home() {
  const { profile, loading } = useProfile();
  const teaching = useTeaching();

  if (loading || !profile) {
    return <Loading />;
  }

  const tags = profile.research_interests ? profile.research_interests.split(',').map(t => t.trim()) : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8 lg:p-14 bg-[#F4F7F6] min-h-full flex flex-col pt-12 md:pt-16"
    >
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-100/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-100/50 rounded-full blur-[120px] pointer-events-none"></div>

      <Helmet>
        <title>{`${profile.name} - ${profile.title}`}</title>
        <meta name="description" content={profile.bio?.substring(0, 160).replace(/\n/g, ' ')} />
        <meta name="keywords" content={`Profesor, Professor, Portfolio, Academic, Research, Universitas Islam Negeri, UIN Syekh Nurjati Cirebon, Cirebon, Indonesia, Pendidikan Islam, Islamic Education, ${profile.research_interests || ''}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${profile.name} - ${profile.title}`} />
        <meta property="og:description" content={profile.bio?.substring(0, 160).replace(/\n/g, ' ')} />
        {profile.photo_url && <meta property="og:image" content={profile.photo_url} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${profile.name} - ${profile.title}`} />
        <meta name="twitter:description" content={profile.bio?.substring(0, 160).replace(/\n/g, ' ')} />
        {profile.photo_url && <meta name="twitter:image" content={profile.photo_url} />}
        
        {/* GEO Tags for Cirebon, Indonesia */}
        <meta name="geo.region" content="ID-JB" />
        <meta name="geo.placename" content="Cirebon" />
        <meta name="geo.position" content="-6.732023;108.552316" />
        <meta name="ICBM" content="-6.732023, 108.552316" />
        
        {/* Profile Specific */}
        <meta property="profile:first_name" content="Anda" />
        <meta property="profile:last_name" content="Juanda" />
        {profile.email && <meta property="profile:username" content={profile.email} />}
      </Helmet>

      <div className="max-w-5xl mx-auto w-full relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left Column - Framed Photo */}
          <div className="lg:w-1/3 shrink-0">
            <div className="p-3 bg-white shadow-xl border border-slate-100 rounded-sm">
              <div className="aspect-[3/4] relative overflow-hidden bg-slate-100 border-[8px] border-[#006633]/5 rounded-sm">
                 {profile?.photo_url ? (
                    <img 
                      src={profile.photo_url} 
                      alt={`Profile photo of ${profile.name}, ${profile.title}`} 
                      className="w-full h-full object-cover"
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center">
                       <span className="font-serif italic text-6xl text-slate-300">AJ</span>
                    </div>
                 )}
              </div>
            </div>
            
            {/* Academic Links below photo */}
            <div className="mt-8 space-y-3">
              {profile.researchgate_url && (
                <a href={profile.researchgate_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-[#006633] transition-colors p-3 bg-white rounded-sm shadow-sm border border-slate-100 hover:border-[#006633]/30 text-sm font-medium">
                   <svg className="w-[18px] h-[18px] fill-[#006633]" viewBox="0 0 24 24"><path d="M19.48 4h-2.91v16h2.91V4zm-4.99 9.9c0-3.32-2.73-6-6.09-6-1.57 0-2.99.6-4.07 1.57L2.9 8.04 0 10.94l1.43 1.43c-1.39 1.4-2.26 3.32-2.26 5.43 0 4.23 3.42 7.65 7.65 7.65s7.65-3.42 7.65-7.65c0-1.85-.66-3.55-1.74-4.87l1.7-1.7-2.94-2.94zm-6.09 9.35c-3.05 0-5.52-2.47-5.52-5.52 0-1.57.65-2.98 1.7-4.01L7.7 17l1.41-1.41-3.21-3.21c.64-.32 1.36-.5 2.12-.5 2.15 0 4.02 1.25 5.06 3.07l-2.02.67c-.63-1.07-1.81-1.78-3.15-1.78-2.03 0-3.67 1.64-3.67 3.67s1.64 3.67 3.67 3.67 3.67-1.64 3.67-3.67h-2.15v1.94h4.15v2.96c-1.11 1.05-2.61 1.7-4.27 1.7z"/></svg> ResearchGate
                </a>
              )}
              {profile.scopus_url && (
                <a href={profile.scopus_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-[#006633] transition-colors p-3 bg-white rounded-sm shadow-sm border border-slate-100 hover:border-[#006633]/30 text-sm font-medium">
                   <LinkIcon size={18} className="text-[#006633]" /> Scopus
                </a>
              )}
              {profile.orcid_url && (
                <a href={profile.orcid_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-[#006633] transition-colors p-3 bg-white rounded-sm shadow-sm border border-slate-100 hover:border-[#006633]/30 text-sm font-medium">
                   <ExternalLink size={18} className="text-[#006633]" /> ORCID
                </a>
              )}
            </div>
          </div>

          {/* Right Column - Bio & Stats */}
          <div className="lg:w-2/3 flex flex-col">
            <div className="mb-10">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#006633] font-bold block mb-3">
                Biography
              </span>
              <h2 className="text-3xl lg:text-5xl font-serif text-slate-900 leading-tight mb-6">
                Educational Innovation & <br/>Literary Research
              </h2>
              <div className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-wrap font-sans text-justify">
                {profile?.bio || 'Professor at UIN Syekh Nurjati Cirebon...'}
              </div>
            </div>

            {/* Acknowledgements Section */}
            <div className="mb-10 p-6 bg-emerald-50/50 border-l-4 border-[#006633] rounded-r-md">
              <h3 className="font-serif italic text-xl text-slate-800 mb-3">Dari Nol hingga Guru Besar: Sebuah Perjalanan Cinta dan Doa.</h3>
              <p className="text-[15px] text-slate-600 leading-relaxed text-justify">
                &nbsp;&nbsp;&nbsp;&nbsp;Gelar Profesor ini saya persembahkan sepenuhnya untuk Istri tercinta dan anak-anakku: <strong className="text-[#006633]">Panji Kusumah, MMSI</strong>, <strong className="text-[#006633]">Puji Kusumastuti, M.T.P</strong>, serta <strong className="text-[#006633]">H. Casmara Iam Mihardja, M.Pd</strong>. Terima kasih telah menjadi sistem pendukung terbaik (support system) yang membuat perjalanan akademik yang sunyi ini menjadi penuh warna dan makna.
              </p>
            </div>

            
            {tags.length > 0 && (
              <div className="mb-10">
                <h3 className="text-[11px] font-bold text-[#006633] uppercase tracking-[0.2em] mb-4">Research Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-white text-slate-700 text-xs font-semibold rounded-sm border border-slate-200 hover:border-[#006633]/50 transition-colors shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-8 border-t border-slate-200">
               <h3 className="text-[11px] font-bold text-[#006633] uppercase tracking-[0.2em] mb-6">Teaching Experience</h3>
               
               <div className="mb-10 text-[15px] space-y-8">
                 <div>
                   <h4 className="text-xl font-serif font-bold text-slate-800 mb-1">Senior Lecturer — Islamic Education & Educational Management</h4>
                   <p className="text-slate-500 font-medium mb-3">IAIN Syekh Nurjati Cirebon, <span className="italic text-slate-400">Indonesia</span></p>
                   <p className="text-slate-600 leading-relaxed text-justify">
                     Experienced academic and educator with extensive involvement in higher education, research supervision, curriculum development, and academic mentoring in the fields of Islamic Education and Educational Management.
                   </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                     <h5 className="font-bold text-[#006633] mb-3 uppercase tracking-wider text-xs">Academic Responsibilities</h5>
                     <ul className="list-disc pl-5 space-y-2 text-slate-600">
                       <li>Teaching courses in:
                         <ul className="list-[circle] pl-5 mt-1 space-y-1 text-[14px]">
                           <li>Islamic Education</li>
                           <li>Educational Management</li>
                           <li>Curriculum Development</li>
                           <li>Research Methodology</li>
                           <li>Leadership in Education</li>
                         </ul>
                       </li>
                       <li>Supervising undergraduate and master’s thesis research</li>
                       <li>Serving as academic examiner and research reviewer</li>
                       <li>Guiding students in academic writing and publication</li>
                       <li>Participating in curriculum evaluation and academic development programs</li>
                     </ul>
                   </div>

                   <div>
                     <h5 className="font-bold text-[#006633] mb-3 uppercase tracking-wider text-xs">Research & Mentorship</h5>
                     <ul className="list-disc pl-5 space-y-2 text-slate-600">
                       <li>Supervising research projects related to:
                         <ul className="list-[circle] pl-5 mt-1 space-y-1 text-[14px]">
                           <li>Islamic educational management</li>
                           <li>Pesantren-based curriculum implementation</li>
                           <li>Learning innovation</li>
                           <li>Educational quality management</li>
                         </ul>
                       </li>
                       <li>Mentoring students in qualitative and quantitative research methods</li>
                       <li>Supporting collaborative academic and institutional research initiatives</li>
                     </ul>
                   </div>

                   <div>
                     <h5 className="font-bold text-[#006633] mb-3 uppercase tracking-wider text-xs">Academic Contributions</h5>
                     <ul className="list-disc pl-5 space-y-2 text-slate-600">
                       <li>Contributor to academic seminars and educational discussions</li>
                       <li>Active in the development of Islamic education practices and management strategies</li>
                       <li>Engaged in scholarly activities promoting educational quality improvement and innovation</li>
                     </ul>
                   </div>

                   <div>
                     <h5 className="font-bold text-[#006633] mb-3 uppercase tracking-wider text-xs">Areas of Expertise</h5>
                     <div className="flex flex-wrap gap-2">
                       {['Islamic Education', 'Educational Leadership', 'Curriculum Management', 'Educational Quality Management', 'Research Methodology', 'Pesantren-Based Education Systems'].map((area, idx) => (
                         <span key={idx} className="px-3 py-1.5 bg-emerald-50/50 text-[#006633] text-[13px] font-medium rounded-sm border border-emerald-100">
                           {area}
                         </span>
                       ))}
                     </div>
                   </div>
                 </div>
               </div>

               {teaching.length > 0 && (
                 <>
                   <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Specific Courses</h4>
                   <div className="space-y-4">
                     {teaching.map(course => (
                       <div key={course.id} className="p-5 border border-slate-200 rounded-sm hover:border-[#006633]/30 hover:shadow-sm transition-all bg-white">
                          <div className="flex items-start gap-4">
                            <div className="bg-emerald-50 p-2.5 rounded-full shrink-0">
                              <BookOpen size={18} className="text-[#006633]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 leading-snug mb-1">{course.course_name}</h4>
                              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <span>{course.program}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-[#006633]">{course.year}</span>
                              </div>
                            </div>
                          </div>
                       </div>
                     ))}
                   </div>
                 </>
               )}
            </div>

          </div>

        </div>
      </div>
    </motion.div>
  );
}
