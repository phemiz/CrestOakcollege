import { 
  ClipboardList, 
  BookOpen, 
  GraduationCap, 
  Wallet, 
  Building, 
  ShieldCheck,
  Atom,
  HeartPulse,
  Briefcase
} from "lucide-react";
import { News, Testimonial } from "@/types";

export interface QuickLink {
  name: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string;
}

export interface ChooseReason {
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const quickLinks: QuickLink[] = [
  { name: "Admissions Portal", desc: "Start online application", href: "/admissions", icon: ClipboardList, badge: "Open" },
  { name: "Program Finder", desc: "Find courses & criteria", href: "/academics", icon: BookOpen, badge: "B.Sc./Degree" },
  { name: "Student Portal", desc: "Register courses & check results", href: "/portal", icon: GraduationCap, badge: "Active" },
  { name: "Fee Payment Portal", desc: "Simulated Paystack billing", href: "/portal?tab=billing", icon: Wallet, badge: "Secure" },
  { name: "Campus Gallery", desc: "Labs, library & campus life", href: "/gallery", icon: Building, badge: "Tour" },
  { name: "Admin CMS Control", desc: "Manage announcements & fees", href: "/admin", icon: ShieldCheck, badge: "Staff" }
];

export const chooseReasons: ChooseReason[] = [
  {
    title: "Accredited Health & Tech Modules",
    desc: "Fully validated by NMCN, MLSCN, and Community Health Boards for licensed practice.",
    icon: ShieldCheck
  },
  {
    title: "Partnered with Atiba University",
    desc: "Formal degree supervision and academic paths endorsed by Atiba University, Oyo.",
    icon: GraduationCap
  },
  {
    title: "Modern Training Laboratories",
    desc: "Gain hands-on expertise in simulated clinical wards, microbiology labs, and tech hubs.",
    icon: Atom
  },
  {
    title: "Affordable & Installment Fees",
    desc: "Flexible, parents-focused tuition structured to allow convenient installment splits.",
    icon: Wallet
  },
  {
    title: "Clinical Placement Guarantee",
    desc: "Rotations and internships across recognized regional hospitals and digital enterprises.",
    icon: HeartPulse
  },
  {
    title: "Graduate Job Employability",
    desc: "Focus on licensing examination reviews to ensure immediate workforce integration.",
    icon: Briefcase
  }
];

export const testimonialsData: Record<"students" | "alumni" | "parents" | "partners", Testimonial[]> = {
  students: [
    { name: "Chinedu Okafor", program: "Nursing Science (B.Sc.)", text: "The medical lab equipment at CrestOak is outstanding. The practical sessions prepare us for actual clinical tasks. It makes a huge difference compared to other colleges.", outcome: "Clinical Intern" },
    { name: "Fatima Bello", program: "Computer Science (B.Sc.)", text: "I love the hybrid learning structure. CrestOak has modern computer hardware labs and the collaboration with Atiba University provides great resources.", outcome: "Software Dev Aspirant" }
  ],
  alumni: [
    { name: "Tunde Adelakun", program: "Medical Laboratory Science (B.Sc.)", text: "Directly after my B.Sc. program, I secured a job at a top diagnostic center in Lagos. The licensing review drills at CrestOak were the key to passing my board exams.", outcome: "Lab Scientist at Synlab" },
    { name: "Amara Okoye", program: "Public Health Graduate", text: "The program focused heavily on community engagement and epidemiology. I was hired by a healthcare NGO immediately after graduation.", outcome: "Health Officer, UNICEF NG" }
  ],
  parents: [
    { name: "Chief Gabriel Adebayo", relation: "Parent of Nursing Student", text: "Sending my daughter to CrestOak is the best decision I've made. The school fees are affordable, payments are structured, and the partnership with Atiba University is reassuring.", outcome: "Satisfied Parent" },
    { name: "Alhaji Ibrahim Musa", relation: "Guardian of Computer Science Student", text: "The focus on ethics and practical skills makes CrestOak stand out. My nephew is already designing websites and databases in his second year.", outcome: "Proud Uncle" }
  ],
  partners: [
    { name: "Dr. Kunle Fagbemi", company: "Lagos Health Systems", text: "We have partnered with CrestOak for clinical rotations for 3 years. Their students show higher clinical preparedness and discipline than most.", outcome: "Healthcare Partner" },
    { name: "Engr. Sandra Cole", company: "TechNext Nigeria", text: "CrestOak graduates in Applied Sciences adapt very quickly to industry tech stacks. Their curriculum aligns with modern technical standards.", outcome: "Industry Placement Partner" }
  ]
};

export const newsAndEvents: News[] = [
  {
    id: 1,
    title: "2025/2026 Admissions Screening Dates Released",
    slug: "admissions-screening-dates-2025-2026",
    date: "June 15, 2026",
    desc: "First batch entrance screenings and interviews will commence at the Badagry campus. Check requirements.",
    category: "Screening",
    alert: "Urgent"
  },
  {
    id: 2,
    title: "Academic Partnership Review by Atiba University Board",
    slug: "academic-partnership-review-atiba-university",
    date: "June 02, 2026",
    desc: "A delegation from Atiba University visited the CCHSMT laboratories to certify the updated digital curriculum.",
    category: "Partnership",
    alert: "Update"
  },
  {
    id: 3,
    title: "Lagos State Healthcare Integration Placement Scheme",
    slug: "lagos-state-healthcare-integration-placement-scheme",
    date: "May 28, 2026",
    desc: "New partnerships signed with Lagos State hospitals for student clinical postings and internship placements.",
    category: "Clinical",
    alert: "New Partnership"
  },
  {
    id: 4,
    title: "Tuition Installment Payment Option Now Live",
    slug: "tuition-installment-payment-option-live",
    date: "May 15, 2026",
    desc: "Students can now pay school fees in flexible installments using Paystack or local bank transfers via the portal.",
    category: "Finance",
    alert: "Portal Alert"
  }
];
