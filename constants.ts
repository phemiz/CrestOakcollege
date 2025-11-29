
import { SearchResultItem } from './types';

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Academics', path: '#' },
  { name: 'Admissions', path: '/admissions' },
  { name: 'News & Events', path: '#' },
  { name: 'Community', path: '#' },
  { name: 'Contact', path: '/contact' },
  { name: 'Portals', path: '/portal' },
];

export const ACADEMICS_SUB_LINKS = [
  { name: 'Departments', path: '/departments', description: "Explore our faculties and programs." },
  { name: 'Courses', path: '/courses', description: "Browse our degree and diploma courses." },
];

export const STUDENT_HUB_LINKS = [
  { name: 'Student Dashboard', path: '/student-dashboard', description: "Your central hub for academic info." },
  { name: 'E-Learning Hub', path: '/e-learning', description: "Access your course materials and resources." },
  { name: 'Fee Payment', path: '/fee-payment', description: "View and pay your school fees." },
];

export const NEWS_AND_EVENTS_SUB_LINKS = [
  { name: 'Latest News', path: '/news', description: "Stay updated with the latest announcements." },
  { name: 'Events Calendar', path: '/events', description: "View upcoming academic and campus events." },
];

export const COMMUNITY_SUB_LINKS = [
  { name: 'Library', path: '/library', description: "Explore our vast collection of books and resources." },
  { name: 'Student Clubs', path: '/clubs', description: "Find your passion and connect with peers." },
  { name: 'Visitations & Excursions', path: '/visitations', description: "Explore educational and recreational trips." },
  { name: 'Alumni Network', path: '/alumni', description: "Engage with our global graduate community." },
  { name: 'College Blog', path: '/blog', description: "Read the latest news and stories." },
  { name: 'Staff Directory', path: '/directory', description: "Find contact information for faculty and staff." },
  { name: 'Careers', path: '/careers', description: "Discover job opportunities at CrestOAK." },
];

export const SEARCHABLE_PAGES: SearchResultItem[] = [
    { id: 'home', type: 'Page', title: 'Home', description: 'Return to the CrestOAK College homepage.', path: '/' },
    { id: 'about', type: 'Page', title: 'About Us', description: 'Learn about our history, mission, and vision.', path: '/about' },
    { id: 'departments', type: 'Page', title: 'Departments', description: 'Explore our faculties, which offer both Degree and Diploma programs in areas like Management, Science, Engineering, Arts, and Health Sciences.', path: '/departments' },
    { id: 'courses', type: 'Page', title: 'Courses', description: 'Discover the wide range of programs we offer.', path: '/courses' },
    { id: 'directory', type: 'Page', title: 'Staff Directory', description: 'Find contact information for faculty and staff.', path: '/directory' },
    { id: 'library', type: 'Page', title: 'Online Library', description: 'Search our library catalog for books and resources.', path: '/library' },
    { id: 'clubs', type: 'Page', title: 'Student Clubs', description: 'Explore student-run clubs and organizations.', path: '/clubs' },
    { id: 'alumni', type: 'Page', title: 'Alumni Network', description: 'Connect with our global alumni community.', path: '/alumni' },
    { id: 'blog', type: 'Page', title: 'Blog', description: 'Read articles and insights from the CrestOAK community.', path: '/blog' },
    { id: 'news', type: 'Page', title: 'News', description: 'Stay updated with the latest announcements.', path: '/news' },
    { id: 'events', type: 'Page', title: 'Events Calendar', description: 'View our upcoming academic and campus events.', path: '/events' },
    { id: 'careers', type: 'Page', title: 'Careers', description: 'Explore job opportunities and join our team.', path: '/careers' },
    { id: 'admissions', type: 'Page', title: 'Admissions', description: 'Find information on how to apply.', path: '/admissions' },
    { id: 'apply', type: 'Page', title: 'Application Form', description: 'Your future starts here. Apply to CrestOAK College now.', path: '/apply' },
    { id: 'contact', type: 'Page', title: 'Contact Us', description: 'Get in touch with us for enquiries.', path: '/contact' },
    { id: 'admin', type: 'Page', title: 'Student & Staff Portals', description: 'Login for students and staff to manage college operations.', path: '/portal' },
    { id: 'donate', type: 'Page', title: 'Donate', description: 'Support CrestOAK College and contribute to our mission.', path: '/donate' },
    { id: 'e-learning', type: 'Page', title: 'E-Learning Hub', description: 'Access course materials for your enrolled courses.', path: '/e-learning' },
    { id: 'fee-payment', type: 'Page', title: 'Fee Payment', description: 'View and pay your outstanding school fees.', path: '/fee-payment' },
];
