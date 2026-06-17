import { 
  HeartPulse, 
  Atom, 
  Briefcase, 
  Scale, 
  BookOpen, 
  Leaf,
  GraduationCap,
  Globe
} from "lucide-react";

export interface FacultyAcademicData {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  dean: string;
  requirements: string;
  duration: string;
  outcomes: string;
  courses: string[];
  fees: {
    application: number;
    acceptance: number;
    tuition: number;
    examination: number;
    hostel: number;
  };
}

export interface PostgraduateAcademicData {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  requirements: string;
  duration: string;
  outcomes: string;
  courses: string[];
  fees: {
    application: number;
    acceptance: number;
    tuition: number;
    examination: number;
    hostel: number;
  };
}

export const facultiesData: FacultyAcademicData[] = [
  {
    id: "health",
    name: "Faculty of Health Sciences",
    icon: HeartPulse,
    dean: "Dr. Mrs. A. O. Williams",
    requirements: "Five O'Level Credit passes in WAEC/NECO/NABTEB including English Language, Mathematics, Biology, Chemistry, and Physics in not more than two sittings. Candidates with JAMB must satisfy the cut-off threshold of 140 (Nursing Sciences requires 200).",
    duration: "4 - 5 Years (B.Sc. / BMLs / professional pathways)",
    outcomes: "Licensed Nurse, Medical Lab Scientist, Public Health Administrator, Community Health Inspector.",
    courses: [
      "Nursing Sciences (B.Sc.)",
      "Medical Laboratory Science (BMLs)",
      "Public Health",
      "Physiology"
    ],
    fees: {
      application: 20000,
      acceptance: 50000,
      tuition: 400000,
      examination: 25000,
      hostel: 200000
    }
  },
  {
    id: "natural",
    name: "Faculty of Natural and Applied Sciences",
    icon: Atom,
    dean: "Dr. E. O. Johnson",
    requirements: "Five O'Level Credit passes including English Language, Mathematics, Chemistry, Physics, and Biology or Computer Studies.",
    duration: "4 Years (Bachelor of Science - B.Sc. degree pathways)",
    outcomes: "Software developer, Lab Biochemist, Industrial Chemist, Systems Administrator, Microbiologist.",
    courses: [
      "Biochemistry",
      "Chemistry",
      "Microbiology",
      "Computer Science",
      "Mathematics",
      "Physics",
      "Physics with Electronics"
    ],
    fees: {
      application: 20000,
      acceptance: 50000,
      tuition: 300000,
      examination: 25000,
      hostel: 200000
    }
  },
  {
    id: "arts_social_management",
    name: "Faculty of Arts, Social and Management Sciences",
    icon: Briefcase,
    dean: "Prof. S. J. Balogun",
    requirements: "Five O'Level Credit passes in WAEC/NECO including English Language, Mathematics, and three other relevant Arts, Social Science, or Commercial subjects.",
    duration: "4 Years (Bachelor of Science / Bachelor of Arts pathways)",
    outcomes: "Financial Analyst, Business Manager, Criminology Investigator, Hotel Executive, Diplomat, Communicator.",
    courses: [
      "English",
      "Theater",
      "Accounting",
      "Banking and Finance",
      "Business Administration",
      "Criminology and Security Studies",
      "Entrepreneurship",
      "Economics",
      "Hospitality and Tourism Management",
      "International Relations",
      "Marketing",
      "Political Science",
      "Public Administration",
      "Psychology",
      "Sociology",
      "Transport Management"
    ],
    fees: {
      application: 20000,
      acceptance: 50000,
      tuition: 250000,
      examination: 25000,
      hostel: 200000
    }
  },
  {
    id: "law",
    name: "Faculty of Law",
    icon: Scale,
    dean: "Barr. A. O. Coker (LL.M)",
    requirements: "Five O'Level Credit passes in WAEC/NECO including English Language, Literature in English, Mathematics, and any two Arts/Social Science subjects.",
    duration: "5 Years (LL.B pathway)",
    outcomes: "Legal Advocate, Solicitor, Corporate Counsel, Legal Consultant, Jurist.",
    courses: [
      "LL.B Law"
    ],
    fees: {
      application: 20000,
      acceptance: 50000,
      tuition: 400000,
      examination: 25000,
      hostel: 200000
    }
  },
  {
    id: "education",
    name: "Faculty of Education",
    icon: BookOpen,
    dean: "Dr. Mrs. F. A. Ayodele",
    requirements: "Five O'Level Credit passes in WAEC/NECO including English Language, Mathematics, and three other relevant teaching subject areas.",
    duration: "4 Years (Bachelor of Education - B.Ed. pathways)",
    outcomes: "Educational Administrator, Library Consultant, Information Officer, School Principal.",
    courses: [
      "Educational Management",
      "Library & Information Science"
    ],
    fees: {
      application: 20000,
      acceptance: 50000,
      tuition: 250000,
      examination: 25000,
      hostel: 200000
    }
  },
  {
    id: "agriculture",
    name: "Faculty of Agricultural Sciences",
    icon: Leaf,
    dean: "Prof. I. A. Ogundele",
    requirements: "Five O'Level Credit passes in English Language, Mathematics, Agricultural Science or Biology, Chemistry, and Geography or Physics.",
    duration: "5 Years (Bachelor of Agriculture - B.Agric. pathways)",
    outcomes: "Agronomist, Farm Manager, Extension Officer, Agricultural Entrepreneur.",
    courses: [
      "Agricultural Extension and Rural Development"
    ],
    fees: {
      application: 20000,
      acceptance: 50000,
      tuition: 250000,
      examination: 25000,
      hostel: 200000
    }
  }
];

export const postgraduateData: PostgraduateAcademicData[] = [
  {
    id: "pgd",
    name: "Postgraduate Diploma (PGD) Programmes",
    icon: BookOpen,
    requirements: "A good first degree (B.Sc. / HND) in a relevant field from a recognized tertiary institution. Candidates must also satisfy the specific department's core prerequisite subject requirements.",
    duration: "1 - 2 Years (Postgraduate Diploma)",
    outcomes: "Advanced corporate advancement, structural training shift, or prerequisite criteria fulfillment for master's degree pathways.",
    courses: [
      "Accounting",
      "Business Administration",
      "Public Administration",
      "Computer Science"
    ],
    fees: {
      application: 15000,
      acceptance: 30000,
      tuition: 220000,
      examination: 30000,
      hostel: 50000
    }
  },
  {
    id: "msc",
    name: "Master of Science (M.Sc.) Programmes",
    icon: GraduationCap,
    requirements: "A good first degree in the relevant discipline with a minimum of Second Class Lower division from a recognized institution.",
    duration: "1.5 - 2 Years (Master of Science)",
    outcomes: "Specialist corporate consultant, scientific research specialist, university lecturer, public administrator.",
    courses: [
      "Public Administration",
      "Computer Science",
      "Business Administration",
      "Nursing",
      "Political Science",
      "Economics",
      "International Relations",
      "Sociology"
    ],
    fees: {
      application: 15000,
      acceptance: 30000,
      tuition: 250000,
      examination: 30000,
      hostel: 50000
    }
  },
  {
    id: "mba",
    name: "Master of Business Administration (MBA)",
    icon: Briefcase,
    requirements: "A good first degree in business or commercial sciences, or a recognized Postgraduate Diploma in administration, with professional work experience.",
    duration: "1.5 - 2 Years (Master of Business Administration)",
    outcomes: "Chief executive officer, organizational manager, senior business administrator, entrepreneur.",
    courses: [
      "Business Administration"
    ],
    fees: {
      application: 20000,
      acceptance: 30000,
      tuition: 280000,
      examination: 30000,
      hostel: 50000
    }
  },
  {
    id: "ma",
    name: "Master of Arts (M.A.) Programmes",
    icon: Globe,
    requirements: "A good bachelor's degree in English or adjacent humanities subjects with a minimum of Second Class Lower division.",
    duration: "1.5 - 2 Years (Master of Arts)",
    outcomes: "Communications director, editor, communications consultant, lecturer, publisher.",
    courses: [
      "English"
    ],
    fees: {
      application: 15000,
      acceptance: 30000,
      tuition: 240000,
      examination: 30000,
      hostel: 50000
    }
  },
  {
    id: "phd",
    name: "Doctor of Philosophy (Ph.D.) Programmes",
    icon: Scale,
    requirements: "A recognized Master's degree in the relevant discipline with a cumulative Grade Point Average (GPA) of 3.50 on a 5.00 point scale or 60% average.",
    duration: "3 - 5 Years (Doctoral Degree)",
    outcomes: "Doctoral researcher, university professor, government policymaker, institutional consultant.",
    courses: [
      "Public Administration",
      "Computer Science",
      "Political Science",
      "Economics",
      "International Relations",
      "Sociology",
      "English"
    ],
    fees: {
      application: 25000,
      acceptance: 40000,
      tuition: 350000,
      examination: 40000,
      hostel: 50000
    }
  }
];
