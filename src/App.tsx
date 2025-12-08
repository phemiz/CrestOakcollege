
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DepartmentsPage from './pages/DepartmentsPage';
import DepartmentDetailPage from './pages/DepartmentDetailPage';
import CoursesPage from './pages/CoursesPage';
import NewsPage from './pages/NewsPage';
import AdmissionsPage from './pages/AdmissionsPage';
import ContactPage from './pages/ContactPage';
import CareersPage from './pages/CareersPage';
import NotFoundPage from './pages/NotFoundPage';
import AdmissionsPortalPage from './pages/AdmissionsPortalPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import CodeAssistantPage from './pages/CodeAssistantPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AlumniPage from './pages/AlumniPage';
import StaffDirectoryPage from './pages/StaffDirectoryPage';
import LibraryPage from './pages/LibraryPage';
import ClubsPage from './pages/ClubsPage';
import ClubDetailsPage from './pages/ClubDetailsPage';
import DonationPage from './pages/DonationPage';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import Chatbot from './components/Chatbot';
import ScrollToTopButton from './components/ScrollToTopButton';
import CookieConsentBanner from './components/CookieConsentBanner';
import EventsCalendarPage from './pages/EventsCalendarPage';
import ELearningPage from './pages/ELearningPage';
import FeePaymentPage from './pages/FeePaymentPage';
import VisitationsPage from './pages/VisitationsPage';
import JobApplicationFormPage from './pages/JobApplicationFormPage';
import PortalPage from './pages/PortalPage';

const AppContent: React.FC = () => {
  const { theme, isReaderMode } = useTheme();
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("page-fade-in");

  useEffect(() => {
    if (location !== displayLocation && transitionStage !== "page-fade-out") {
        setTransitionStage("page-fade-out");
    }
  }, [location, displayLocation, transitionStage]);


  useEffect(() => {
    const lightThemeLink = document.getElementById('prism-light-theme') as HTMLLinkElement;
    const darkThemeLink = document.getElementById('prism-dark-theme') as HTMLLinkElement;

    if (lightThemeLink && darkThemeLink) {
        if (theme.name === 'light' || theme.name === 'modern') {
            lightThemeLink.disabled = false;
            darkThemeLink.disabled = true;
        } else { // 'dark' or 'faith'
            lightThemeLink.disabled = true;
            darkThemeLink.disabled = false;
        }
    }
  }, [theme.name]);


  return (
    <div className={`${isReaderMode ? 'reader-mode' : ''} ${theme.background} ${theme.text} font-sans flex flex-col min-h-screen transition-colors duration-500`}>
        <a href="#main-content" className={`absolute z-[9999] p-3 m-3 -translate-y-16 focus:translate-y-0 ${theme.button.primary.background} ${theme.button.primary.text} rounded-lg font-semibold transition-transform duration-300`}>
            Skip to main content
        </a>
        <Header />
        <main 
          id="main-content"
          className={`flex-grow ${transitionStage}`}
          onAnimationEnd={() => {
            if (transitionStage === "page-fade-out") {
                window.scrollTo(0, 0);
                setDisplayLocation(location);
                setTransitionStage("page-fade-in");
            }
          }}
        >
          <Routes location={displayLocation}>
            <Route path="/" element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="departments/:departmentId" element={<DepartmentDetailPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="directory" element={<StaffDirectoryPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="clubs" element={<ClubsPage />} />
            <Route path="clubs/:id" element={<ClubDetailsPage />} />
            <Route path="alumni" element={<AlumniPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="events" element={<EventsCalendarPage />} />
            <Route path="careers" element={<CareersPage />} />
            <Route path="careers/apply/:jobId" element={<JobApplicationFormPage />} />
            <Route path="admissions" element={<AdmissionsPage />} />
            <Route path="admissions-portal" element={<AdmissionsPortalPage />} />
            <Route path="apply" element={<ApplicationFormPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="donate" element={<DonationPage />} />
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="student-dashboard" element={<StudentDashboardPage />} />
            <Route path="portal" element={<PortalPage />} />
            <Route path="e-learning" element={<ELearningPage />} />
            <Route path="fee-payment" element={<FeePaymentPage />} />
            <Route path="visitations" element={<VisitationsPage />} />
            <Route path="code-assistant" element={<CodeAssistantPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <Chatbot />
        <ScrollToTopButton />
        <CookieConsentBanner />
      </div>
  )
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;
