
import React from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useApi } from '../hooks/useApi';
import { Announcement } from '../types';
import { useTheme } from '../hooks/useTheme';
import StructuredData from '../components/StructuredData';
import PartnerUniversities from '../components/PartnerUniversities';

const Hero: React.FC = () => {
    const { theme } = useTheme();

    // Use a solid, dark background for the hero section to replace the image.
    // FIX: Removed check for non-existent 'highContrast' theme.
    const heroBg = theme.name === 'faith' ? 'bg-blue-900' : 'bg-gray-800';
    
    // Ensure accent color has enough contrast on the dark hero background.
    const heroAccent = 
        theme.name === 'light' ? 'text-blue-400' :
        // FIX: Removed check for non-existent 'highContrast' theme.
        theme.name === 'modern' ? 'text-cyan-400' :
        theme.accent;

    // Define a secondary button style that works on a dark background for all themes.
    const secondaryButtonClass = `border-2 border-white text-white hover:bg-white hover:text-gray-800`;

    return (
    <div className={`${heroBg} text-white`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-48 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
            Excellence in Education.
        </h1>
        <h2 className={`${heroAccent} text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mt-2`}>
            Innovation in Practice.
        </h2>
        <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-gray-200">
            Join Crestview College and embark on a journey of discovery, growth, and professional success in health, administration, and technology.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/apply" className={`${theme.button.primary.background} ${theme.button.primary.text} font-bold py-3 px-8 rounded-full text-lg ${theme.button.primary.hover} transition-all duration-300 transform hover:scale-105`}>
            Apply Now
            </Link>
            <Link to="/courses" className={`${secondaryButtonClass} font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105`}>
            Explore Courses
            </Link>
        </div>
        </div>
    </div>
    );
};

const MissionVision: React.FC = () => {
    const { theme } = useTheme();
    const sectionBg = theme.name === 'light' ? 'bg-white' : theme.name === 'modern' ? 'bg-neutral-100' : theme.card.background;
    return (
        <div className={`py-16 sm:py-24 ${sectionBg}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className={`text-3xl font-bold ${theme.text} tracking-tight`}>Our Mission</h2>
                        <p className={`${theme.textMuted} text-lg`}>
                            To provide an inclusive and innovative learning environment that equips students with the knowledge, skills, and ethical values necessary to excel in their chosen careers and contribute meaningfully to society.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <h2 className={`text-3xl font-bold ${theme.text} tracking-tight`}>Our Vision</h2>
                        <p className={`${theme.textMuted} text-lg`}>
                            To be a leading institution in Africa, recognized for academic excellence, impactful research, and the development of professionals who will drive progress and solve challenges in health, administration, and technology.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LatestNews: React.FC = () => {
  const { theme } = useTheme();
  const { data: announcements, loading, error } = useApi<Announcement[]>('/api/announcements');

  if (loading || error || !announcements || announcements.length === 0) {
    return null;
  }
  
  const sectionBg = theme.name === 'light' ? 'bg-gray-50' : theme.name === 'modern' ? 'bg-neutral-100' : theme.card.background;
  const dateBg = theme.name === 'modern' ? 'bg-white' : theme.name === 'faith' ? 'bg-white/10' : 'bg-white';
  const dateTextColor = theme.name === 'modern' ? 'text-cyan-600' : theme.name === 'faith' ? 'text-yellow-400' : 'text-blue-600';

  return (
    <div className={`${sectionBg} py-16 sm:py-24`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h2 className={`text-4xl font-extrabold ${theme.text} sm:text-5xl tracking-tight`}>Latest News</h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-x-8 gap-y-12">
          {announcements.slice(0, 2).map(announcement => (
            <div key={announcement.id} className="group flex items-start space-x-6">
               <div className={`flex-shrink-0 text-center ${dateBg} p-3 rounded-lg shadow-sm`}>
                    <p className={`${dateTextColor} font-bold text-3xl leading-none`}>{new Date(announcement.createdAt).getDate()}</p>
                    <p className={`${theme.textMuted} text-sm uppercase font-semibold`}>{new Date(announcement.createdAt).toLocaleString('default', { month: 'short' })}</p>
                </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${theme.text} mb-2 group-hover:${theme.accent} transition-colors duration-300`}>{announcement.title}</h3>
                <p className={`${theme.textMuted} text-sm line-clamp-2`}>{announcement.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
            <Link to="/news" className={`${theme.button.primary.background} ${theme.button.primary.text} font-bold py-3 px-8 rounded-full text-lg ${theme.button.primary.hover} transition-all duration-300 transform hover:scale-105`}>
                View All News
            </Link>
        </div>
      </div>
    </div>
  );
};


const QuickLinkCard: React.FC<{ to: string, title: string, description: string, icon: React.ReactNode }> = ({ to, title, description, icon }) => {
    const { theme } = useTheme();
    
    const iconContainerClasses = theme.name === 'light' ? 'bg-blue-600 text-white group-hover:bg-blue-700' :
                               theme.name === 'faith' ? `bg-yellow-400 text-blue-900` :
                               `bg-cyan-500 text-white`;

    return (
        <Link to={to} className={`group block p-8 ${theme.card.transition} ${theme.card.hover} ${theme.card.background} ${theme.card.border} ${theme.card.shadow} ${theme.card.rounded}`}>
            <div className={`flex items-center justify-center h-16 w-16 rounded-full mb-6 transition-colors duration-300 ${iconContainerClasses}`}>
                {icon}
            </div>
            <h3 className={`text-2xl font-bold ${theme.card.text} mb-2`}>{title}</h3>
            <p className={`${theme.card.textMuted}`}>{description}</p>
            <p className={`mt-4 font-semibold ${theme.accent} transition-colors duration-300`}>Learn More &rarr;</p>
        </Link>
    );
};

const QuickLinks: React.FC = () => {
    const { theme } = useTheme();
    const sectionBg = theme.name === 'light' ? 'bg-gray-50' : theme.name === 'modern' ? 'bg-neutral-100' : theme.card.background;
    return (
        <PageWrapper title="Start Your Journey" bgClass={sectionBg}>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
                <QuickLinkCard 
                    to="/apply"
                    title="Apply Now"
                    description="Find out how to apply, admission requirements, and important dates for prospective students."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" focusable="false"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                />
                <QuickLinkCard
                    to="/courses"
                    title="Our Courses"
                    description="Explore our wide range of programs across health, administration, and technology."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" focusable="false"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                />
                <QuickLinkCard
                    to="/contact"
                    title="Contact Us"
                    description="Get in touch with our team for enquiries, support, or to schedule a campus visit."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" focusable="false"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                />
            </div>
        </PageWrapper>
    );
};

const HomePage: React.FC = () => {
    const { theme } = useTheme();
    const partnersBg = theme.name === 'light' ? 'bg-white' : theme.name === 'modern' ? 'bg-neutral-100' : theme.card.background;

    const homePageSchema = {
        "@context": "https://schema.org",
        "@type": "CollegeOrUniversity",
        "name": "Crestview College",
        "url": "https://crestview.edu.ng",
        "logo": "https://crestview.edu.ng/logo.png",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+234-801-234-5678",
            "contactType": "customer service"
        },
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 College Road, Victoria Island",
            "addressLocality": "Lagos",
            "addressCountry": "NG"
        },
        "sameAs": [
            "https://www.facebook.com/crestviewcollege",
            "https://www.twitter.com/crestviewcollege"
        ]
    };

  return (
    <>
      <StructuredData data={homePageSchema} id="homepage-schema" />
      <Hero />
      <MissionVision />
      <LatestNews />
      <QuickLinks />
      <PageWrapper title="Our Partner Universities" subtitle="We collaborate with leading institutions to provide world-class education and opportunities." bgClass={partnersBg}>
        <PartnerUniversities />
      </PageWrapper>
    </>
  );
};

export default HomePage;
