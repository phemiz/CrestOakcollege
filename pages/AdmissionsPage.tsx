
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../hooks/useTheme';

const AdmissionStep: React.FC<{ step: number; title: string; children: React.ReactNode }> = ({ step, title, children }) => {
    const { theme } = useTheme();
    const stepBg = theme.name === 'light' ? 'bg-crest-blue text-white' : `${theme.button.primary.background} ${theme.button.primary.text}`;
    const dividerColor = theme.name === 'light' ? 'bg-gray-300' : 'bg-white/30';
    return (
        <div className="flex">
            <div className="flex flex-col items-center mr-6">
                <div className={`w-10 h-10 ${stepBg} rounded-full flex items-center justify-center font-bold text-lg`}>
                    {step}
                </div>
                {step < 3 && <div className={`w-px h-full ${dividerColor}`}></div>}
            </div>
            <div className="pb-8">
                <h3 className={`text-xl font-bold ${theme.text} mb-2`}>{title}</h3>
                <p className={`${theme.textMuted}`}>{children}</p>
            </div>
        </div>
    );
};

interface FAQItemProps {
    question: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children, isOpen, onToggle }) => {
    const { theme } = useTheme();
    return (
        <div className={`border-b ${theme.name === 'light' ? 'border-gray-200' : 'border-white/20'}`}>
            <button
                onClick={onToggle}
                aria-expanded={isOpen}
                className="w-full flex justify-between items-center text-left py-4"
            >
                <h4 className={`text-lg font-semibold ${theme.text}`}>{question}</h4>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className={`pb-4 pr-6 ${theme.textMuted}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};


const AdmissionsPage: React.FC = () => {
    const { theme } = useTheme();
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "What are the O'Level requirements?",
            answer: "You need at least 5 credits in your O'Level result (WAEC, NECO, or NABTEB), including English Language and Mathematics, obtained in not more than two sittings."
        },
        {
            question: "What is the JAMB cut-off mark?",
            answer: "The JAMB cut-off mark varies by department and academic year. Please refer to the latest admission guidelines or contact the admissions office for the specific cut-off for your desired course."
        },
        {
            question: "Can I apply with pending O'Level results?",
            answer: "Yes, candidates with pending O'Level results (awaiting results) can apply. However, the results must be available and uploaded to the portal before the admission process is finalized."
        },
        {
            question: "Is there an application fee?",
            answer: "Yes, a non-refundable application fee is required to process your application. The amount and payment details can be found on the application portal when you begin your application."
        },
        {
            question: "When is the application deadline?",
            answer: "The application for the upcoming academic session closes on January 31, 2025. We encourage you to apply early to ensure a smooth process."
        }
    ];
    
    const handleFaqToggle = (index: number) => {
        setOpenFaqIndex(prevIndex => (prevIndex === index ? null : index));
    };

  return (
    <PageWrapper
      title="Admissions"
      subtitle="Begin your academic journey at Crestview College. We're excited to welcome you."
    >
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-12">
          <section>
            <h2 className={`text-3xl font-bold ${theme.text} mb-4`}>Application Process</h2>
            <div>
                <AdmissionStep step={1} title="Submit Your Application">
                    Complete our online application form and submit all required documents before the deadline.
                </AdmissionStep>
                <AdmissionStep step={2} title="Entrance Examination">
                    Eligible candidates will be invited to take the Crestview College entrance examination.
                </AdmissionStep>
                <AdmissionStep step={3} title="Receive Admission Offer">
                    Successful candidates will receive an admission offer and instructions for registration.
                </AdmissionStep>
            </div>
          </section>

          <section>
            <h2 className={`text-3xl font-bold ${theme.text} mb-4`}>Requirements</h2>
            <ul className={`list-disc list-inside space-y-3 ${theme.textMuted}`}>
              <li>Completed application form and payment of application fee.</li>
              <li>O'Level result (WAEC/NECO/NABTEB) with at least 5 credits including English and Mathematics.</li>
              <li>JAMB result with a score meeting the cut-off mark for the chosen course.</li>
              <li>Two recent passport photographs.</li>
              <li>Birth certificate or affidavit of age declaration.</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-3xl font-bold ${theme.text} mb-4`}>Frequently Asked Questions</h2>
            <div>
                {faqs.map((faq, index) => (
                    <FAQItem
                        key={index}
                        question={faq.question}
                        isOpen={openFaqIndex === index}
                        onToggle={() => handleFaqToggle(index)}
                    >
                        <p>{faq.answer}</p>
                    </FAQItem>
                ))}
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <aside className="md:col-span-1 space-y-6">
          <div className={`${theme.name === 'light' ? 'bg-crest-light' : theme.card.background} p-6 rounded-lg`}>
            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Ready to Apply?</h3>
            <p className={`${theme.textMuted} mb-6`}>Our application portal is open. Start your application today and take the first step towards an exciting future.</p>
            <Link to="/apply" className={`w-full text-center ${theme.button.primary.background} ${theme.button.primary.text} font-bold py-3 px-6 rounded-full inline-block ${theme.button.primary.hover} transition-colors duration-300`}>
              Apply Now
            </Link>
          </div>
          <div className={`${theme.name === 'light' ? 'bg-crest-light' : theme.card.background} p-6 rounded-lg`}>
            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Important Dates</h3>
            <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
                <li><strong className={theme.text}>Application Opens:</strong> October 1, 2024</li>
                <li><strong className={theme.text}>Application Closes:</strong> January 31, 2025</li>
                <li><strong className={theme.text}>Entrance Exam:</strong> February 15, 2025</li>
            </ul>
          </div>
        </aside>
      </div>
    </PageWrapper>
  );
};

export default AdmissionsPage;
