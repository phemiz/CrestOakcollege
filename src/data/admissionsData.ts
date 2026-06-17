export interface ChargeItem {
  name: string;
  amount: number;
  mustPaidInFull: boolean;
  key: string;
  defaultSelected: boolean;
  categorySpecific?: string[];
}

export interface CourseOption {
  value: string;
  label: string;
}

export const admissionsChargesList: ChargeItem[] = [
  { name: "Application Fee/Registration", amount: 20000, mustPaidInFull: true, key: "app_fee", defaultSelected: true },
  { name: "Acceptance Fee", amount: 50000, mustPaidInFull: true, key: "acceptance_fee", defaultSelected: true },
  { name: "Medical Test", amount: 10000, mustPaidInFull: true, key: "medical", defaultSelected: true },
  { name: "ID Card", amount: 10000, mustPaidInFull: true, key: "id_card", defaultSelected: true },
  { name: "Matriculation Fee", amount: 20000, mustPaidInFull: true, key: "matric", defaultSelected: true },
  { name: "Portal Maintenance Fee", amount: 10000, mustPaidInFull: true, key: "portal", defaultSelected: true },
  { name: "Departmental Dues (Per Semester)", amount: 5000, mustPaidInFull: true, key: "dept_dues", defaultSelected: true },
  { name: "Library Fee", amount: 10000, mustPaidInFull: false, key: "library", defaultSelected: true },
  { name: "Course Form", amount: 10000, mustPaidInFull: false, key: "course_form", defaultSelected: true },
  { name: "Polo Shirts", amount: 25000, mustPaidInFull: true, key: "polo", defaultSelected: true },
  { name: "Lab/Workshop Fee", amount: 15000, mustPaidInFull: false, key: "lab", defaultSelected: false, categorySpecific: ["health", "physical"] },
  { name: "Manual (Sciences)", amount: 15000, mustPaidInFull: true, key: "manual", defaultSelected: false, categorySpecific: ["health", "physical"] },
  { name: "Nursing Procedure", amount: 20000, mustPaidInFull: true, key: "nursing_proc", defaultSelected: false, categorySpecific: ["health"] },
  { name: "Entrepreneurship", amount: 60000, mustPaidInFull: false, key: "entrepreneurship", defaultSelected: false },
  { name: "Carryover Fees (Per Semester)", amount: 20000, mustPaidInFull: true, key: "carryover", defaultSelected: false }
];

export const undergraduateCourses: Record<string, CourseOption[]> = {
  health: [
    { value: "nursing", label: "Nursing Sciences (B.Sc.)" },
    { value: "medlab", label: "Medical Laboratory Science (BMLs)" },
    { value: "pubhealth", label: "Public Health" },
    { value: "physiology", label: "Physiology" }
  ],
  natural: [
    { value: "biochem", label: "Biochemistry" },
    { value: "chemistry", label: "Chemistry" },
    { value: "microbio", label: "Microbiology" },
    { value: "compsci", label: "Computer Science" },
    { value: "maths", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "physics_elec", label: "Physics with Electronics" }
  ],
  arts_social_management: [
    { value: "english", label: "English" },
    { value: "theater", label: "Theater" },
    { value: "accounting", label: "Accounting" },
    { value: "finance", label: "Banking and Finance" },
    { value: "busadmin", label: "Business Administration" },
    { value: "criminology", label: "Criminology and Security Studies" },
    { value: "entrepreneurship", label: "Entrepreneurship" },
    { value: "economics", label: "Economics" },
    { value: "hospitality", label: "Hospitality and Tourism Management" },
    { value: "intl_relations", label: "International Relations" },
    { value: "marketing", label: "Marketing" },
    { value: "political_sci", label: "Political Science" },
    { value: "pub_admin", label: "Public Administration" },
    { value: "psychology", label: "Psychology" },
    { value: "sociology", label: "Sociology" },
    { value: "transport", label: "Transport Management" }
  ],
  law: [
    { value: "law", label: "LL.B Law" }
  ],
  education: [
    { value: "edu_mgmt", label: "Educational Management" },
    { value: "lib_sci", label: "Library & Information Science" }
  ],
  agriculture: [
    { value: "agric_ext", label: "Agricultural Extension and Rural Development" }
  ]
};

export const postgraduateCourses: Record<string, CourseOption[]> = {
  pgd: [
    { value: "pgd_accounting", label: "PGD Accounting" },
    { value: "pgd_busadmin", label: "PGD Business Administration" },
    { value: "pgd_pubadmin", label: "PGD Public Administration" },
    { value: "pgd_compsci", label: "PGD Computer Science" }
  ],
  msc: [
    { value: "msc_pubadmin", label: "M.Sc. Public Administration" },
    { value: "msc_compsci", label: "M.Sc. Computer Science" },
    { value: "msc_busadmin", label: "M.Sc. Business Administration" },
    { value: "msc_nursing", label: "M.Sc. Nursing" },
    { value: "msc_political", label: "M.Sc. Political Science" },
    { value: "msc_economics", label: "M.Sc. Economics" },
    { value: "msc_intl_relations", label: "M.Sc. International Relations" },
    { value: "msc_sociology", label: "M.Sc. Sociology" }
  ],
  mba: [
    { value: "mba_busadmin", label: "MBA Business Administration" }
  ],
  ma: [
    { value: "ma_english", label: "M.A. English" }
  ],
  phd: [
    { value: "phd_pubadmin", label: "Ph.D. Public Administration" },
    { value: "phd_compsci", label: "Ph.D. Computer Science" },
    { value: "phd_political", label: "Ph.D. Political Science" },
    { value: "phd_economics", label: "Ph.D. Economics" },
    { value: "phd_intl_relations", label: "Ph.D. International Relations" },
    { value: "phd_sociology", label: "Ph.D. Sociology" },
    { value: "phd_english", label: "Ph.D. English" }
  ]
};

export const getCoursesForFaculty = (faculty: string): CourseOption[] => {
  return undergraduateCourses[faculty] || [];
};

export const getCoursesForPostgrad = (degreeType: string): CourseOption[] => {
  return postgraduateCourses[degreeType] || [];
};

export const getCourseLabel = (level: string, faculty: string, value: string): string => {
  const list = level === "undergraduate" ? getCoursesForFaculty(faculty) : getCoursesForPostgrad(faculty);
  const item = list.find(c => c.value === value);
  return item ? item.label : value;
};

export interface FacultyTuition {
  name: string;
  amount: number;
  key: string;
}

export interface HostelOption {
  name: string;
  amount: number;
  key: string;
}

export const facultyTuitions: FacultyTuition[] = [
  { name: "Education", amount: 250000, key: "education" },
  { name: "Health Sciences", amount: 400000, key: "health" },
  { name: "Management Sciences", amount: 250000, key: "management" },
  { name: "Physical Sciences", amount: 300000, key: "physical" },
  { name: "Social Sciences", amount: 250000, key: "social" },
  { name: "Law", amount: 400000, key: "law" }
];

export const hostelOptions: HostelOption[] = [
  { name: "No Hostel Accommodation", amount: 0, key: "none" },
  { name: "6 Persons Per Room (One-Off)", amount: 200000, key: "six_persons" },
  { name: "4 Persons Per Room (One-Off)", amount: 250000, key: "four_persons" }
];

