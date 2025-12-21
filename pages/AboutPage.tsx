
import React, { useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../hooks/useTheme';
import PartnerUniversities from '../components/PartnerUniversities';
import { useApi } from '../hooks/useApi';
import { Testimonial } from '../types';
import SkeletonLoader from '../components/SkeletonLoader';

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
    const { theme } = useTheme();
    return (
        <div className={`flex-shrink-0 w-full sm:w-[50%] lg:w-[33.33%] snap-center p-4`}>
            <div className={`h-full flex flex-col justify-between p-6 rounded-lg ${theme.card.background} ${theme.card.shadow} ${theme.card.border}`}>
                <blockquote className="flex-grow">
                  <p className={`${theme.textMuted} italic`}>"{testimonial.quote}"</p>
                </blockquote>
                <figcaption className="flex items-center mt-4">
                    <img src={testimonial.imageUrl} alt={testimonial.studentName} className="w-12 h-12 rounded-full object-cover" />
                    <div className="ml-4">
                        <p className={`font-bold ${theme.text}`}>{testimonial.studentName}</p>
                        <p className={`text-sm ${theme.accent}`}>{testimonial.program}, '{String(testimonial.graduationYear).slice(-2)}</p>
                    </div>
                </figcaption>
            </div>
        </div>
    );
};

const Testimonials: React.FC = () => {
    const { data: testimonials, loading, error } = useApi<Testimonial[]>('/api/testimonials');

    if (loading) {
        return (
             <div className="grid md:grid-cols-3 gap-8">
                <SkeletonLoader type="card" className="h-48" />
                <SkeletonLoader type="card" className="h-48" />
                <SkeletonLoader type="card" className="h-48" />
            </div>
        )
    }

    if (error || !testimonials) {
        return <p className="text-center text-red-500">Could not load testimonials.</p>;
    }

    return (
        <div className="relative">
            <div 
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-4 px-2 pb-4"
                style={{ scrollbarWidth: 'none' }} /* For Firefox */
            >
                {testimonials.map(t => <TestimonialCard key={t.id} testimonial={t} />)}
            </div>
        </div>
    );
};


const AboutPage: React.FC = () => {
  const { theme } = useTheme();
  const partnersBg = theme.name === 'light' ? 'bg-gray-50' : theme.name === 'modern' ? 'bg-neutral-100' : theme.card.background;
  const testimonialsBg = theme.name === 'light' ? 'bg-white' : theme.card.background;

  useEffect(() => {
    document.title = 'About Us - CrestOAK College';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', 'Learn about the history, mission, vision, and leadership of CrestOAK College, a premier institution in Lagos, Nigeria.');
    }
  }, []);

  return (
    <>
      <PageWrapper
        title="About CrestOAK College"
        subtitle="Pioneering education for a brighter future in Nigeria and beyond."
      >
        <div className="max-w-4xl mx-auto space-y-16">
          {/* History Section */}
          <section>
            <h2 className={`text-3xl font-bold ${theme.text} mb-4`}>Our History</h2>
            <div className={`space-y-4 ${theme.textMuted} leading-relaxed`}>
              <p>
                Founded in 2010, CrestOAK College was established with a clear vision: to bridge the gap between theoretical knowledge and practical application in Nigeria's key growth sectors. Starting with a single faculty, we have grown into a multi-disciplinary institution renowned for its commitment to academic rigor and student success.
              </p>
              <p>
                Over the years, we have celebrated numerous milestones, from the accreditation of our core programs to the establishment of state-of-the-art laboratories and partnerships with leading industry players. Our journey is one of continuous growth, driven by a passion for excellence and a dedication to our community.
              </p>
            </div>
          </section>

          {/* Leadership Message Section */}
          <section className={`${theme.name === 'light' ? 'bg-white' : theme.card.background} p-8 rounded-lg ${theme.card.shadow}`}>
            <h2 className={`text-3xl font-bold ${theme.text} mb-6`}>Message from the Provost</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <img 
                src="https://picsum.photos/seed/provost/200/200" 
                alt="Provost of CrestOAK College" 
                className="w-40 h-40 rounded-full object-cover flex-shrink-0"
                loading="lazy"
              />
              <div className={`${theme.textMuted} leading-relaxed`}>
                <p className="italic">
                  "Welcome to CrestOAK College, a place where curiosity is nurtured, innovation is celebrated, and futures are forged. Our commitment is to provide an education that is not only world-class but also deeply relevant to the challenges and opportunities of the 21st century. We invite you to join our vibrant community and become a part of our story of success."
                </p>
                <p className={`mt-4 font-semibold ${theme.text}`}>- Dr. Adanna Okoro, Provost</p>
              </div>
            </div>
          </section>

          {/* Goals and Values Section */}
          <section>
            <h2 className={`text-3xl font-bold ${theme.text} mb-4`}>Our Goals & Values</h2>
            <div className={`grid md:grid-cols-2 gap-8 ${theme.textMuted}`}>
              <div>
                <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>Our Goals</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>To deliver high-quality, industry-relevant education.</li>
                  <li>To foster a culture of research and innovation.</li>
                  <li>To develop well-rounded, socially responsible graduates.</li>
                  <li>To build strong partnerships with local and international bodies.</li>
                </ul>
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>Our Core Values</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className={theme.text}>Integrity:</strong> Upholding the highest ethical standards.</li>
                  <li><strong className={theme.text}>Excellence:</strong> Striving for the best in all we do.</li>
                  <li><strong className={theme.text}>Innovation:</strong> Embracing creativity and new ideas.</li>
                  <li><strong className={theme.text}>Community:</strong> Fostering collaboration and mutual respect.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </PageWrapper>
      <PageWrapper title="What Our Students Say" bgClass={testimonialsBg}>
        <Testimonials />
      </PageWrapper>
      <PageWrapper title="Our Partner Universities" subtitle="We collaborate with leading institutions to provide world-class education and opportunities." bgClass={partnersBg}>
          <PartnerUniversities />
      </PageWrapper>
    </>
  );
};

export default AboutPage;